import Stocks from "../trader/stocks/stocks";
import Forex from "../trader/forex/pairs";
import Cryptos from "../trader/cryptos/cryptos";
import Index from "../trader/indices/indices";
import Commodities from "../trader/commodities/commodities";
import Market from "../trader/market/market";
import log from "../utils/logging";

import FmpAsSource from "../news/sources/news/fmp";
import GeneralAsSource from "../news/sources/news/general";
import PressAsSource from "../news/sources/news/press";
import StocksAsSource from "../news/sources/news/stocks";
import CryptoAsSource from "../news/sources/news/crypto";
import ForexAsSource from "../news/sources/news/forex";
import StockRSS from "../news/sources/RSS Feeds/stock";

import env from "../env";
import { deleteOldDocuments } from "../utils/mongo";

/**
 * Fetches news data by creating instances of various news sources and calling their build methods.
 *
 * @return {Array<Promise<void>>} An array of promises that resolve when the build methods of each news source are complete.
 */
const fetchNewsData = () => [
    new FmpAsSource().build(),
    new GeneralAsSource().build(),
    new PressAsSource().build(),
    new StocksAsSource().build(),
    new CryptoAsSource().build(),
    new ForexAsSource().build(),
    new StockRSS().build(),
];

/**
 * Fetches market data by synchronizing stocks, cryptos, forex, indices, commodities, and market data.
 *
 * @return {Promise<Array<any>>} An array of promises representing the fetched market data.
 */
const fetchMarketData = () => [
    new Stocks().sync(),
    new Cryptos().sync(),
    new Forex().build(),
    new Index().build(),
    new Commodities().build(),
    new Market().build(),
];

// Retry logic
/**
 * Retries a promise-based function a specified number of times with a specified delay between retries.
 *
 * @template T - The return type of the function to retry.
 * @param {() => Promise<T>} fn - The function to retry.
 * @param {number} [retries=3] - The number of times to retry the function (default: 3).
 * @param {number} [delay=1000] - The delay in milliseconds between retries (default: 1000).
 * @returns {Promise<T>} - A promise that resolves with the result of the function if it succeeds, or rejects with the last error if all retries fail.
 * @throws {Error} - If all retries fail.
 */
const retry = async <T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) {
                log("warn", "Throwing error because retries exhausted. Final Error Code:", error);
                throw error;
            }
            log("warn", `Attempt ${attempt} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Retries exhausted');
};

// Batch process with retries
/**
 * Processes an array of items in batches.
 *
 * @template T - The type of items in the array.
 * @param {T[]} items - The array of items to process.
 * @param {number} batchSize - The number of items to process in each batch.
 * @param {(batch: T[]) => Promise<void>} processBatch - The function to process each batch of items.
 * @returns {Promise<void>} - A promise that resolves when all items have been processed.
 */
const batchProcess = async (promises: (() => Promise<void>)[], batchSize: number) => {
    for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map(promise => retry(promise)));

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                log("info", `Batch ${Math.floor(i / batchSize)}: Promise ${index} fulfilled.`);
            } else {
                log("error", `Batch ${Math.floor(i / batchSize)}: Promise ${index} rejected: ${result.reason}`);
            }
        });
    }
};

/**
 * Cleans up old documents from the MongoDB database.
 *
 * This function is used to periodically remove old documents from the collections taht do not implement the upsert logic.
 * Those need manual clean up.
 * This function can be used to clean up documents from other collections as well, by adding them to the
 * for-of loop.
 *
 * @returns {Promise<void>} - A promise that resolves when all documents have been deleted.
 */
async function cleanUp(): Promise<void> {
    for (const collection of ['articles', 'marketSummary']) { // eventually more collections here
        log("info", `Cleaning up ${collection}...`);
        await deleteOldDocuments(env.MONGO_URI, env.MONGO_DB, collection, 'date', 30); // delete old documents from 'articles' collection
        log("info", `Cleaned up ${collection}.`);
    }
}

/**
 * Asynchronously executes the main function.
 * 
 * This function fetches market data and news data, and then processes them in batches.
 * The batch size is set to ${n}, but can be adjusted as needed.
 * 
 * @return {Promise<void>} A Promise that resolves when all data has been collected and built.
 */
async function main() {
    const marketPromises = fetchMarketData().map(p => () => p);
    const newsPromises = fetchNewsData().map(p => () => p);
    const allPromises = [...marketPromises, ...newsPromises];

    await batchProcess(allPromises, 2); // Adjust batch size as needed

    await cleanUp();

    log("info", "Successfully collected and built financial data.");
}


main()
    .then(() => log("info", "Successfully collected and built financial data."))
    .catch(error => log("error", "Failed to collect and build financial data.", error));
