import * as fs from 'fs';

/**
 * Delays the execution of a job for a specified amount of time.
 * 
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Converts an item to a JSON string.
 * @param item The item to be converted to a JSON string.
 * @returns A JSON string representation of the item.
 */
export function str(item: any): string {
    return JSON.stringify(item, null, 2);
}

/** 
 * Make an error a Json String
 * @param error The error that was returned by the process
 * @returns a Json String representation of the error
 */
function errorstr(error : any): string {
    return JSON.stringify({'error': error}, null, 2);
}

/**
 * Pauses execution for a specified duration.
 * @param func The function to execute after the delay.
 * @param delay The delay in milliseconds.
 * @returns A promise that resolves after the delay.
 */
async function wait(func: () => Promise<any>, delay: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Retries a function call with exponential backoff.
 * @param func The function to retry.
 * @param maxRetries The maximum number of retries.
 * @param delay The initial delay before the first retry, in milliseconds.
 * @returns A promise that resolves with the result of the function call.
 * @throws The error from the last retry attempt if all retries fail.
 */
export async function retry(func: () => Promise<any>, maxRetries: number = 3, delay: number = 1000): Promise<any> {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            return await func();
        } catch (error: any) {
            retries++;
            if (retries === maxRetries) {
                //logger.error(log(`Retries exhausted... Final Error Code: ${error.code}\nReturning the Error String as Response.`, 1, error))
                return errorstr(error);
            }
            await wait(() => func(), delay * Math.pow(2, retries)); // Exponential backoff
        }
    }
}

/**
 * Reads JSON data synchronously from a file.
 * @param jsonFilePath The path to the JSON file.
 * @returns The parsed JSON data, or undefined if there was an error.
 */
export function readJsonFileSync(jsonFilePath: string): any {
    // Read the JSON file synchronously.
    try {
        // Read the file content.
        const jsonData: Buffer = fs.readFileSync(jsonFilePath);
        // Parse JSON data.
        const parsedData: any = JSON.parse(jsonData.toString());
        // Return the parsed data.
        return parsedData;
    } catch (error) {
        // Log any errors.
        //logger.error(log(`Error parsing JSON file at location: ${jsonFilePath}`, 1, error));
        // Return undefined in case of error.
        return undefined;
    }
}