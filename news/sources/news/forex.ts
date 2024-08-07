import env from "../../../env";
import {mongoMultipleInsertion} from "../../../utils/mongo";
import producer from "../../../rmq/producer";
import { fetchPaginatedData } from "../../setup/builder";
import log from "../../../utils/logging";

  class ForexAsSource{
    private target: string = 'https://financialmodelingprep.com/api/v4/forex_news';
    private apikey: string = env.FMP_API_KEY;
    constructor(public pageSize: number= 5, public maxPageNumber: number= 1){}

    /**
     * Asynchronously builds the news articles for the Forex source.
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
        log("error", "News > Forex:: Error inserting articles to MongoDB or producing messages", error);
      }

    }
  }
  
export default ForexAsSource;