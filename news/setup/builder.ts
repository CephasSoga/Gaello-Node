import Article from "./types";
import log from "../../utils/logging";
import { Message } from "../../rmq/producer";
import { now } from "../../utils/time";

/**
 * Fetches paginated data from the specified URL and returns an object containing the fetched articles and messages.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {number} size - The number of items to fetch per page.
 * @param {number} maxPageNumber - The maximum number of pages to fetch.
 * @param {string} apikey - The API key to use for authentication.
 * @return {Promise<{articles: Article[], messages: Message[]}>} - A promise that resolves to an object containing the fetched articles and messages.
 */
export async function fetchPaginatedData(url: string, size: number, maxPageNumber: number, apikey: string): Promise<{articles: Article[], messages: Message[]}> {
    let allData: Article[] = [];
    let currentPage = 0;
    let hasMorePages = true;
    const messages: Message[] = [];

    while (hasMorePages && currentPage <= maxPageNumber) {
      try {
        const response = await fetch(`${url}?page=${currentPage}&size=${size}&apikey=${apikey}`);
        
        if (response.status === 429) {
          //Save it for when a better subscription is acquired
          // Handle rate limit (retry after some delay)
          //const retryAfter = response.headers.get('Retry-After');
          //await new Promise(resolve => setTimeout(resolve, retryAfter ? parseInt(retryAfter) * 1000 : 1000));
          //continue;
          let e = new Error('Rate limit exceeded');
          log("error", "News > ... :: Rate limit exceeded", e);
          break;
        }
        
        if (!response.ok) {
          let e = new Error(`HTTP error! status: ${response.status}`);
          log("error", "News > ... :: HTTP error", e);
          break;
        }
        
        const data = await response.json();
        const articles: Article[] = data.content;
        allData = allData.concat(articles);
        
        allData.forEach((article: Article) => {
          const id = now();
          const type = 'article';
          const message: Message = {
            id: id,
            type: type,
            value: JSON.stringify(article)
          };
          messages.push(message);
        });

        // Check if there are more pages
        hasMorePages = articles.length === size; // If less than size, it's the last page
        currentPage++;
      } catch (error) {
        log("error", 'News > ... :: Error fetching data:', error);
        // Optionally, handle retries or other error handling logic here
        break;
      }
    }
  
    return {
      articles: allData,
      messages: messages,
    }
  }