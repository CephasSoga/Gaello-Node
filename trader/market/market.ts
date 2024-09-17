import Performances, { MarketPerformance } from "./performance";
import Sentiments, { MarketSentiments } from "./sentiment";
import producer, { Message } from "../../rmq/producer";
import { now } from "../../utils/time";
import { mongoSingleInsertion } from "../../utils/mongo";
import env from "../../env";
import log from "../../utils/logging";
import { str } from "../../utils/common";
export interface MarketInterface{
    performances: MarketPerformance,
    socialSentiments: MarketSentiments
}

interface MarketDocument {
    date: Date,
    content: MarketInterface,
    contentStr: string;
}
class Market {
    constructor() {}

    async performances(): Promise<MarketPerformance> {
       return await new Performances().run()
    }

    async sentiments(): Promise<MarketSentiments> {
        return await new Sentiments().run()
    }

    public async build(): Promise<void> {
        
        const [performances, sentiments] = await Promise.all([this.performances(), this.sentiments()]);

        const result: MarketInterface = {
            performances: performances,
            socialSentiments: sentiments,
        };


        const message: Message = {
            id: "market"+now(),
            type: "market",
            value: JSON.stringify(result),
        };

        const doc: MarketDocument = {
            date: new Date(),
            content: result,
            contentStr: str(result),
        }
        
        log("info", "Trader > Market:: Pushing market data to queue and database")
        try {
            await mongoSingleInsertion(doc, env.MONGO_URI, env.MONGO_DB, "marketSummary")
            await producer.produce([message]);
        } catch (error) {
            log("error", "Trader > Market:: Error pushing market data to queue and database", error)
        }
    }
}

export default Market;