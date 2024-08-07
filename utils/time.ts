/** 
 * Generates a string object representing the current data and time.
*/
export function now(): string {
    return new Date().toISOString(); // Get today's date
}
