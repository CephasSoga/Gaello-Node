/**
 * This module loads environment variables from a .env file into the `process.env` object.
 * It uses the `dotenv` package to achieve this.
 *
 * @remarks
 * The `.env` file should be located in the root directory of your project.
 *
 * @example
 * ```typescript
 * import env from "./env";
 *
 * console.log(env.NODE_ENV); // Outputs the value of NODE_ENV from .env file
 * ```
 *
 * @returns An object containing the environment variables loaded from the .env file.
 *
 * @throws Will throw an error if the .env file is not found or cannot be parsed.
 */

import * as dotenv from "dotenv";
dotenv.config();

const env  = process.env;
export default env;