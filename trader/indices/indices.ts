import IndexItem, {HistoricalQuote}  from "./index";
import exportables from "./symbols";
import {mongoMultipleUpsert} from "../../utils/mongo";
import log from "../../utils/logging";
import producer, { Message } from "../../rmq/producer";
import {IndexType} from "./symbols";
import env from "../../env";
import { str } from "../../utils/common";


type indexDocument = {
    symbol: string;
    name: string;
    date: Date;
    historical: HistoricalQuote;
    contentStr: string;
};

class Index {
    private indexDocuments: indexDocument[] = [];
    private indexMessages: Message[] = [];

    constructor(public batchSize: number = 1000) {}

    async build(): Promise<void> {

        //Palceholder handle here first
        const indexSymbols: IndexType[] = exportables;
        
        if (!indexSymbols || indexSymbols.length === 0) {
            log("warn", "Trader > Index:: No index symbols found");
            return;
        }

        const createBatches = (array: IndexType[], size: number) => {
            const batches: IndexType[][] = [];
            for (let i = 0; i < array.length; i += size) {
                batches.push(array.slice(i, i + size));
            }
            return batches;
        };
        
        const indexBatches = createBatches(indexSymbols.slice(0, 1), this.batchSize); // For testing purposes, limit calls to 3 pairs
        
        for (const batch of indexBatches) {
            const indexPromises = batch.map(async (pair: IndexType) => {
                try {
                    const index = new IndexItem(pair.symbol);
                    const { historical, message } = await index.run();
                    
                    const doc: indexDocument = {
                        symbol: pair.symbol,
                        name: pair.name,
                        date: new Date(),
                        historical: historical,
                        contentStr: str(historical),
                    };

                    // Push to array of documents
                    this.indexDocuments.push(doc);
                    this.indexMessages.push(message);

                } catch (error) {
                    log('error', `Trader > Index:: Error processing index pair ${pair.symbol}:`, error);
                }
            });

            const results = await Promise.allSettled(indexPromises);

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    log("info", `*Trader > Index:: subpromise ${index} fulfilled.`);
                } else {
                    log("error", `*Trader > Index:: subpromise ${index} rejected:`, result.reason);
                }
            });

            //Only proceed if indexDocuments is not empty
            if (this.indexDocuments.length > 0) {
                // Log befor insertion
                log("info", `Trader > Index:: Inserting ${this.indexDocuments.length} documents`);
                // Insert documents
                try {
                    await mongoMultipleUpsert(this.indexDocuments, env.MONGO_URI, env.MONGO_DB, "indices");
                    await producer.produce(this.indexMessages);
                } catch (error) {
                    log("error", 'Trader > Index:: Error inserting documents or producing messages:', error);
                }
            } else {
                continue;
            }

            // Reset documents
            this.indexDocuments.length = 0;
            this.indexMessages.length = 0;
        }
    }
}


export default Index;