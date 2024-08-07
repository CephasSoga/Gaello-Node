import BuildComponents from "../setup/builder";
import resources from "../setup/ressources";
import apikey from "../setup/config";

export interface MarketSentiments {
    trendingBullish(): any;
    trendingBearish(): any;
    changesBullish(): any;
    changesBearish(): any;
}

class Sentiments extends BuildComponents  {
    constructor() {
        super();
    }

    async trendingBullish(): Promise<any> {
        return await this.fetch(resources.trendingSentiment, {}, {apikey: apikey, type: 'bullish', source: 'stocktwits'});
    }

    async trendingBearish(): Promise<any> {
        return await this.fetch(resources.trendingSentiment, {}, {apikey: apikey, type: 'bearish', source: 'stocktwits'});
    }

    async changesBullish(): Promise<any> {
        return await this.fetch(resources.sentimentChange, {}, {apikey: apikey, type: 'bullish', source: 'stocktwits'});
    }

    async changesBearish(): Promise<any> {
        return await this.fetch(resources.sentimentChange, {}, {apikey: apikey, type: 'bearish', source: 'stocktwits'});
    }

    public async run(): Promise<MarketSentiments> {

        const [trendingBullish, trendingBearish, changesBullish, changesBearish] = await Promise.all([
            this.trendingBullish(),
            this.trendingBearish(),
            this.changesBullish(),
            this.changesBearish(),
        ]);

        return {
            trendingBullish: trendingBullish,
            trendingBearish: trendingBearish,
            changesBullish: changesBullish,
            changesBearish: changesBearish,
        };
    }
}

export default Sentiments;