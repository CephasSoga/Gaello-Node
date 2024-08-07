import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";


class GenericInformation extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async outlook(): Promise<any> {
        return await this.fetch(resources.outlook, {symbol: this.symbol}, {apikey: apikey});
    }

    async peers(): Promise<any> {
        return await this.fetch(resources.stockPeers, {symbol: this.symbol}, {apikey: apikey});
    }

    async financials(): Promise<any> {
        return await this.fetch(resources.financials, {symbol: this.symbol}, {apikey: apikey});
    }

    async estimates(): Promise<any> {
        return await this.fetch(resources.analystEstimates, {symbol: this.symbol}, {apikey: apikey});
    }

    async recommendations(): Promise<any> {
        return await this.fetch(resources.analystRecommendations, {symbol: this.symbol}, {apikey: apikey});
    }
    
    async target(): Promise<any> {
        return await this.fetch(resources.priceTarget, {}, {symbol: this.symbol, apikey: apikey});
    }

    async targetSummary(): Promise<any> {
        return await this.fetch(resources.priceTargetSummary, {}, {symbol: this.symbol, apikey: apikey});
    }

    public async run(): Promise<any> {
        const [outlook, peers, financials, estimates, recommendations, target, targetSummary] = await Promise.all([
            this.outlook(),
            this.peers(),
            this.financials(),
            this.estimates(),
            this.recommendations(),
            this.target(),
            this.targetSummary(),
        ]);
        
        return {
            outlook: outlook,
            stockPeers: peers,
            financials: financials,
            analystEstimates: estimates,
            analystsRecommendations: recommendations,
            priceTarget: target,
            priceTargetSummary: targetSummary,
        }
    }

}

export default GenericInformation;