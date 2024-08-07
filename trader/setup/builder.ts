import {PathParameters, QueryParameters} from "./parameters";
import get from "../../utils/requests";

/**
 * Represents a set of methods for building components.
 */
class BuildComponents {
    constructor() {}

    /**
     * Fetches data from the specified resource using the provided path and query parameters.
     *
     * @param ressource - The specific resource to fetch data from.
     * @param pathParams - The path parameters to be included in the request URL.
     * @param queryParams - The query parameters to be included in the request URL.
     *
     * @returns A Promise that resolves to the fetched data or `null` if an error occurs.
     *
     * @throws Will throw an error if the request fails.
     */
    public async fetch(ressource:string, pathParams:PathParameters, queryParams: QueryParameters): Promise<any> {
        const baseUrl = "https://financialmodelingprep.com/api/";
        const url = `${baseUrl}${ressource}`;
        try{
            const response =  await get(url, pathParams, queryParams);
            if (!response) {
                return null;
            }
            return response.data;
        } catch (error: any) {
            return null;
        }
    }
}

export default BuildComponents;