import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";

class HistoricalData extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async price(): Promise<any> {
        return await this.fetch(resources.dailyChartEOD, {symbol: this.symbol}, {apikey: apikey});
    }

    async marketCap(): Promise<any> {
        return await this.fetch(resources.marketCapHistorical, {symbol: this.symbol}, {apikey: apikey});
    }


    async dividends(): Promise<any> {
        return await this.fetch(resources.dividendsHistorical, {symbol: this.symbol}, {apikey: apikey});
    }

    async splits(): Promise<any> {
        return await this.fetch(resources.spiltsHistorical, {symbol: this.symbol}, {apikey: apikey});
    }

    async rating(): Promise<any> {
        return await this.fetch(resources.ratingHistorical, {symbol: this.symbol}, {apikey: apikey});
    }

    async sentiment(): Promise<any> {
        return await this.fetch(resources.socialSentimentHistorical, {symbol: this.symbol}, {apikey: apikey});
    }

    public async run(): Promise<any>{
        const [price, marketCap, dividends, splits, rating, sentiment] = await Promise.all([
            this.price(),
            this.marketCap(),
            this.dividends(),
            this.splits(),
            this.rating(),
            this.sentiment(),
        ]);
        
        return {
            price: price,
            marketCapitalization: marketCap,
            dividends: dividends,
            splits: splits,
            rating: rating,
            socialSentiment: sentiment,
        }
    }
}

export default HistoricalData;