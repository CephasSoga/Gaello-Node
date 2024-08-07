import env from "../../../env";
import {mongoMultipleInsertion} from "../../../utils/mongo";
import producer from "../../../rmq/producer";
import { fetchPaginatedData } from "../../setup/builder";
import log from "../../../utils/logging";

  class StockRSS{
    private target: string = 'https://financialmodelingprep.com/api/v4/stock-news-sentiments-rss-feed';
    private apikey: string = '77281afed0c3bb617a06aa3e73490812';
    constructor(public pageSize: number= 5, public maxPageNumber: number= 1){}

  /**
   * Asynchronously builds the news articles for the Stock RSS Feed source.
   *
   * This function fetches paginated data from the target API, processes the articles,
   * and inserts them into the MongoDB database. It also sends the messages to the
   * message queue for further processing. Finally, it logs the number of articles
   * processed.
   *
   * @return {Promise<void>} A Promise that resolves when the building is complete.
   */
    async build(): Promise<void>{
      const result = await fetchPaginatedData(this.target, this.pageSize, this.maxPageNumber, this.apikey);

      const articles = result.articles;
      const messages = result.messages;

      try {
        await mongoMultipleInsertion(articles, env.MONGO_URI, env.MONGO_DB, 'articles');
        await producer.produce(messages);
      } catch (error) {
        log("error", "RSS Feed > Stocks:: Error inserting articles to MongoDB or producing messages", error);
      }
    }
  }
  
export default StockRSS;  
  