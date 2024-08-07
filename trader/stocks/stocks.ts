import env from "../../env";
import Ticker, { TickerInterface } from "./ticker";
import {Stock, collectSymbols } from "./symbols";
import { mongoMultipleInsertion } from "../../utils/mongo";
import producer, { Message } from "../../rmq/producer";
import log from "../../utils/logging";

interface tickerDocument {
  symbol: string,
  name:string,
  date: Date,
  ticker: TickerInterface,
}

class Stocks {
  private tickerDocuments: tickerDocument[] = [];
  private tickerMessages: Message[] = [];

  constructor(public batchSize: number = 1000) {}
  
  async sync(): Promise<void> {

    // Collect symbols
    const symbols: Stock[] = await collectSymbols();

    if (!symbols || symbols.length === 0) {
      log("warn", "Trader > Stocks:: No stocks symbols found");
      return;
    }

    const createBatches = (array: Stock[], size: number) => {
      const batches: Stock[][] = [];
      for (let i = 0; i < array.length; i += size) {
        batches.push(array.slice(i, i + size));
      }
      return batches;
    };

    // Split the workload into batches to avoid overwhelming the system
    ///set a filtering condition
    const validSymbols = ["AAPL"] //"MSFT", "DIS", "NFLX", "TSLA", "AMZN", "GOOG"];
    const condition = (item: Stock) => validSymbols.includes(item.symbol);
    const symbolBatches = createBatches(symbols.filter(condition), this.batchSize); //For testing purposes, limit calls some US stocks

    // Process each batch
    for (const batch of symbolBatches) {
      const tickerPromises = batch.map(async (stock: Stock) => {
        try {
          const ticker = new Ticker(stock.symbol);
          const { tickerResult, message } = await ticker.build();

          const doc: tickerDocument = {
            symbol: stock.symbol,
            name: stock.name,
            date: new Date(),
            ticker: tickerResult,
          };

          this.tickerDocuments.push(doc);
          this.tickerMessages.push(message);
        } catch (error) {
          log("error", `Trader > Stocks:: Error processing ticker ${stock.symbol}:`, error);
        }
      });

      // Wait for all promises to settle
      const results = await Promise.allSettled(tickerPromises);

      // Log results of the promises
      results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
              log("info", `*Trader > Stocks:: subpromise ${index} fulfilled.`);
          } else {
              log("error", `Trader > Stocks:: subpromise ${index} rejected:`, result.reason);
          }
      });

      // Only proceed if tickerDocuments is not empty
      if (this.tickerDocuments.length > 0) {
        // Log the documents before inserting
        log("info", `Trader > Stocks:: Inserting ${this.tickerDocuments.length} stock documents.`);
        try {
            await mongoMultipleInsertion(this.tickerDocuments, env.MONGO_URI, env.MONGO_DB, "ticker");
            await producer.produce(this.tickerMessages);
        } catch (error) {
            log("error", 'Trader > Stocks:: Error inserting documents or producing messages:', error);
        }
      } else {
        continue;
      }

      // Clear arrays after processing each batch
      this.tickerDocuments.length = 0;
      this.tickerMessages.length = 0;
    }
  }
}

export default Stocks;
