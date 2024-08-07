/**
 * Retrieves the Financial Modeling Prep API key from the environment variables.
 *
 * @remarks
 * This function retrieves the API key from the `env.FMP_API_KEY` variable, which is expected to be set in the project's environment configuration.
 *
 * @returns {string} - The Financial Modeling Prep API key.
 *
 * @example
 * ```typescript
 * import apikey from "./apikey";
 *
 * const response = await fetch(`https://financialmodelingprep.com/api/v3/stock/real-time-price/${symbol}?apikey=${apikey}`);
 * const data = await response.json();
 * console.log(data);
 * ```
 */

import env from "../../env";

const apikey = env.FMP_API_KEY;
export default apikey;