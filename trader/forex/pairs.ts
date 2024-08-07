import env from "../../env";
import { ForexCurrencyPair,collectForexCurrencyPairs } from "./symbols";
import ForexItem, { ForexPrice} from "./pair";
import { mongoMultipleInsertion } from "../../utils/mongo";
import producer, { Message } from "../../rmq/producer";
import log from "../../utils/logging";

type forexDocument = {
    symbol: string;
    name: string;
    date: Date;
    price: ForexPrice;
};

class Forex {
    private forexDocuments: forexDocument[] = [];
    private forexMessages: Message[] = [];

    constructor(public batchSize: number = 1000) {}

    async build(): Promise<void> {
        const forexPairs: ForexCurrencyPair[] = await collectForexCurrencyPairs();
        
        if (!forexPairs || forexPairs.length === 0) {
            log("warn", "Trader > Forex:: No forex pairs found");
            return;
        }

        const createBatches = (array: ForexCurrencyPair[], size: number) => {
            const batches: ForexCurrencyPair[][] = [];
            for (let i = 0; i < array.length; i += size) {
                batches.push(array.slice(i, i + size));
            }
            return batches;
        };
        
        const forexBatches = createBatches(forexPairs.slice(0, 1), this.batchSize); // For testing purposes, limit calls to 3 pairs

        for (const batch of forexBatches) {
            const forexPromises = batch.map(async (pair: ForexCurrencyPair) => {
                try {
                    const forex = new ForexItem(pair.symbol);
                    const { price, message } = await forex.run();
                    
                    const doc: forexDocument = {
                        symbol: pair.symbol,
                        name: pair.name,
                        date: new Date(),
                        price: price,
                    };

                    // Push to array of documents
                    this.forexDocuments.push(doc);
                    this.forexMessages.push(message);

                } catch (error) {
                    log('error', `Trader > Forex:: Error processing forex pair ${pair.symbol}:`, error);
                }
            });

            const results = await Promise.allSettled(forexPromises);

            // Log results of the promises
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    log("info", `*Trader > Forex:: subpromise ${index} fulfilled.`);
                } else {
                    log("error", `*Trader > Forex:: subpromise ${index} rejected:`, result.reason);
                }
            });

            // Only proceed if forexDocuments is not empty
            if (this.forexDocuments.length > 0) {
                // Log the documents before inserting
                log("info", `Trader > Forex:: Inserting ${this.forexDocuments.length} forex documents.`);
                try {                 
                    await mongoMultipleInsertion(this.forexDocuments, env.MONGO_URI, env.MONGO_DB, "forex");
                    await producer.produce(this.forexMessages);
                } catch (error) {
                    log("error", 'Trader > Forex:: Error inserting documents or producing messages:', error);
                }
            } else {
                continue;
            }

            // Clear arrays after processing each batch
            this.forexDocuments.length = 0;
            this.forexMessages.length = 0;
        }
    }
}

export default Forex;
