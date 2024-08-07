import env from "../../env";
import CryptoItem, { CryptoInterface } from "./crypto";
import {Crypto, collectCryptos } from "./symbols";
import { mongoMultipleInsertion } from "../../utils/mongo";
import producer, { Message } from "../../rmq/producer";
import log from "../../utils/logging";

type cryptoDocument = {
  symbol: string;
  name: string;
  date: Date;
  historicalData: CryptoInterface;
}

class Cryptos {
  private cryptoDocuments: cryptoDocument[] = [];
  private cryptoMessages: Message[] = [];

  constructor(public batchSize: number = 1000) {}

  async sync(): Promise<void> {
    // Collect cryptos
    const cryptos: Crypto[] = await collectCryptos();

    if (!cryptos || cryptos.length === 0) {
      log("warn", "Trader > Crypto:: No cryptos found");
      return;
    }

    const createBatches = (array: Crypto[], size: number) => {
      const batches: Crypto[][] = [];
      for (let i = 0; i < array.length; i += size) {
        batches.push(array.slice(i, i + size));
      }
      return batches;
    };

    // Split the workload into batches to avoid overwhelming the system
    ///  Set a filtering condition    
    const validSymbols = ["BTCUSD", "ETHUSD"];
    const condition = (item: Crypto) => validSymbols.includes(item.symbol);
    const cryptoBatches = createBatches(cryptos.filter(condition), this.batchSize); //For testing purposes, limit calls to some popular cryptos only

    // Process each batch
    for (const batch of cryptoBatches) {
      const cryptoPromises = batch.map(async (crypto: Crypto) => {
        try {
          const cryptoItem = new CryptoItem(crypto.symbol);
          const { cryptoResult, message } = await cryptoItem.build();

          const doc: cryptoDocument = {
            symbol: crypto.symbol,
            name: crypto.name,
            date: new Date(),
            historicalData: cryptoResult,
          };
          
          // Push to array of documents
          this.cryptoDocuments.push(doc);
          this.cryptoMessages.push(message);
        } catch (error) {
          log("error", `Trader > Crypto:: Error processing crypto ${crypto.symbol}:`, error);
        }
      });

      // Wait for all promises to settle
      const results = await Promise.allSettled(cryptoPromises);

      // Log results of the promises
      results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
              log("info", `*Trader > Crypto:: subpromise ${index} fulfilled.`);
          } else {
              log("error", `*Trader > Crypto:: subpromise ${index} rejected:`, result.reason);
          }
      });

      // Only proceed if cryptoDocuments is not empty
      if (this.cryptoDocuments.length > 0) {
        // Log the documents before inserting
        log("info", `Trader > Crypto::Inserting ${this.cryptoDocuments.length} crypto documents.`);
        try {
            await mongoMultipleInsertion(this.cryptoDocuments, env.MONGO_URI, env.MONGO_DB, "crypto");
            await producer.produce(this.cryptoMessages);
        } catch (error) {
            log("error", 'Trader > Crypto:: Error inserting documents or producing messages:', error);
        }
      } else {
          continue;
      }

      // Clear arrays after processing each batch
      this.cryptoDocuments.length = 0;
      this.cryptoMessages.length = 0;
    }
  }
}

export default Cryptos;
