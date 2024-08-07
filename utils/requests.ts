import axios, { AxiosError } from 'axios';

import log from './logging';
import { retry } from './common';

/**
 * Defines constants for status codes.
 */
const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    TOO_MANY_REQUESTS: 429,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Appends path parameters to the base URL.
 *
 * @param url - The base URL to which the path parameters will be appended.
 * @param pathParams - An object containing the path parameters to be appended.
 *
 * @returns The full URL with the appended path parameters.
 *
 * @example
 * ```typescript
 * const baseUrl = 'https://api.example.com/users';
 * const pathParams = { id: 123 };
 * const fullUrl = appendParams(baseUrl, pathParams);
 * console.log(fullUrl); // Output: 'https://api.example.com/users/123'
 * ```
 */
function appendParams(url: string, pathParams: any): string {
    let fullUrl = `${url}`
    for (const key in pathParams) {
        if (pathParams.hasOwnProperty(key)) {
            fullUrl += `/${pathParams[key]}`
        }
    }
    return fullUrl;
}

/**
 * A function to make a GET request to a specified URL with optional path and query parameters.
 * It handles various HTTP status codes and retries failed requests.
 *
 * @param baseUrl - The base URL to which the path parameters will be appended.
 * @param pathParams - An optional object containing the path parameters to be appended to the base URL.
 * @param queryParams - An optional object containing the query parameters to be sent with the GET request.
 *
 * @returns A Promise that resolves to the response data if the request is successful,
 *          or null if the request fails due to client or server-side errors.
 *          If a network error occurs, the function will retry the request.
 *
 * @example
 * ```typescript
 * const baseUrl = 'https://api.example.com/users';
 * const pathParams = { id: 123 };
 * const queryParams = { sort: 'desc' };
 * const response = await get(baseUrl, pathParams, queryParams);
 * if (response) {
 *     console.log(response.data);
 * } else {
 *     console.log('Request failed');
 * }
 * ```
 */
export default async function get(baseUrl: string, pathParams?: any, queryParams?: any): Promise<any>{
    const url = appendParams(baseUrl, pathParams)
    try {
        const response = await axios.get(url, {params: queryParams});
        return response;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
                const { status } = axiosError.response
                if ([HTTP_STATUS.BAD_REQUEST, 
                    HTTP_STATUS.UNAUTHORIZED,
                    HTTP_STATUS.FORBIDDEN, 
                    HTTP_STATUS.NOT_FOUND, 
                    HTTP_STATUS.REQUEST_TIMEOUT, 
                    HTTP_STATUS.TOO_MANY_REQUESTS].includes(status)) {
                    log("error", `GET request Failed on Client Side with Status: ${status}.\nUrl: ${url}`, axiosError);
                    return null;
                }
                else if (status === HTTP_STATUS.SERVICE_UNAVAILABLE) {
                    log("error", `GET request Failed on Server Side with Status: ${status}.\nUrl: ${url}`, axiosError);
                    return null;
                }
                else {
                    log("error", `GET request Failed with Unknown Status.\nUrl: ${url}`, axiosError);
                    return null;
                }
            }
        }               
        else if (['ECONNABORTED',
                'ENOTFOUND',
                'EAI_AGAIN'].includes(error.code)){
            log("error", "GET request Failed with Status Code: " + error.code, error);
            return await retry(() => get(url, pathParams, queryParams))
        }
        else {
            log('error', `GET request failed with an unknown error: ${error.message}`, error);
            return null;
        }
    }  
    
}