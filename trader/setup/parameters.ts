/**
 * This snippet merges path and query parameters into a single object.
 * It ensures that the resulting object only contains properties defined in either PathParameters or QueryParameters.
 *
 * @param pathParams - An object containing path parameters.
 * @param queryParams - An object containing query parameters.
 *
 * @returns An object containing all parameters from both path and query, with optional properties.
 *
 * @example
 * ```typescript
 * const pathParams: PathParameters = { symbol: 'AAPL', type: 'stock' };
 * const queryParams: QueryParameters = { timeframe: '1D', page: 1, size: 10 };
 * const mergedParams: Parameters = pathParams | queryParams;
 * console.log(mergedParams); // { symbol: 'AAPL', type: 'stock', timeframe: '1D', page: 1, size: 10 }
 * ```
 */

export interface PathParameters{
    symbol?: string,
    type?: string,
    timeframe?: string,
}

export interface QueryParameters{
    symbol?: string,
    year?: number,
    period?: number,
    type?: string,
    source?: string,
    page?: number,
    size?: number,
    from?: Date,
    to?: Date,
    quarter?: number,
    timeframe?: string,
    query?: string,
    limit?: number,
    exchange?: string,
    datatype?: string,
    apikey?: string,
}


export type Parameters = PathParameters | QueryParameters


