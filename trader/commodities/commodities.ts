import env from "../../env";
import { Commodity, collectCommoditySymbols } from "./symbols";
import CommodityItem, { HistoricalData } from "./commodity";
import { mongoMultipleUpsert } from "../../utils/mongo";
import producer, { Message } from "../../rmq/producer";
import log from "../../utils/logging";
import { str } from "../../utils/common";

type commodityDocument = {
    symbol: string;
    name: string;
    date: Date;
    historical: HistoricalData;
    contentStr: string;
};


class Commodities {
    private commodityDocuments: commodityDocument[] = [];
    private commodityMessages: Message[] = [];

    constructor(public batchSize: number = 1000) {}

    /**
     * Asynchronously builds the commodity documents and messages by collecting commodity symbols,
     * creating batches, processing each batch, and inserting the documents into MongoDB.
     *
     * @return {Promise<void>} A Promise that resolves when the function completes successfully.
     */
    async build(): Promise<void> {
        const commoditySymbols = await collectCommoditySymbols();

        if (!commoditySymbols || commoditySymbols.length === 0) {
            log("warn", "No commodity symbols found");
            return;
        }

        const createBatches = (array: Commodity[], size: number) => {
            const batches: Commodity[][] = [];
            for (let i = 0; i < array.length; i += size) {
                batches.push(array.slice(i, i + size));
            }
            return batches;
        };

        const commodityBatches = createBatches(commoditySymbols.slice(0, 2), this.batchSize); // For testing purposes, limit calls to 3 pairs

        for (const batch of commodityBatches) {
            const commodityPromises = batch.map(async (commodity: Commodity) => {
                try {
                    const commodityItem = new CommodityItem(commodity.symbol);
                    const { historical, message } = await commodityItem.historical();

                    const doc: commodityDocument = {
                        symbol: commodity.symbol,
                        name: commodity.name,
                        date: new Date(),
                        historical: historical,
                        contentStr: str(historical)
                    };

                    // Push to array of documents
                    this.commodityDocuments.push(doc);
                    this.commodityMessages.push(message);

                } catch (error) {
                    log('error', `Trader > Commodity:: Error processing commodity symbol ${commodity.symbol}:`, error);
                }
            });

            const results = await Promise.allSettled(commodityPromises);

            // Log results of the promises
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    log("info", `*Trader > Commodity:: subpromise ${index} fulfilled.`);
                } else {
                    log("error", `*Trader > Commodity:: subpromise ${index} rejected:`, result.reason);
                }
            });

            // Only proceed if commodityDocuments is not empty
            if (this.commodityDocuments.length > 0) {
                // Log the documents before inserting
                log("info", `Trader > Commodity:: Inserting ${this.commodityDocuments.length} commodity documents.`);
                try {                 
                    await mongoMultipleUpsert(this.commodityDocuments, env.MONGO_URI, env.MONGO_DB, "commodities");
                    await producer.produce(this.commodityMessages);
                } catch (error) {
                    log("error", 'Trader > Commodity:: Error inserting documents or producing messages:', error);
                }
            } else {
                continue;
            }

            // Clear arrays after processing each batch
            this.commodityDocuments.length = 0;
            this.commodityMessages.length = 0;
        }
    }
}

export default Commodities;