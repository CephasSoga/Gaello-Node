import BuildComponents from "../setup/builder";
import resources from "../setup/ressources";
import apikey from "../setup/config";

export interface MarketPerformance {
    index: any;
    sectorPEratio: any;
    industryPEratio: any;
    sectorPerformance: any;
    sectorHistorical: any;
    biggestGainers: any;
    biggestLosers: any;
    mostActives: any;
}

class Performances extends BuildComponents {
    constructor(){
        super();
    }

    async index(): Promise<any> {
        return await this.fetch(resources.marketIndex, {}, {apikey: apikey});
    }

    async sector(): Promise<any> {
        return await this.fetch(resources.sectorPEration, {}, {apikey: apikey});
    }

    async industry(): Promise<any> {
        return await this.fetch(resources.industryPerformance, {}, {apikey: apikey});
    }

    async performance(): Promise<any> {
        return await this.fetch(resources.sectorPerformance, {}, {apikey: apikey});
    }

    async historical(): Promise<any> {
        return await this.fetch(resources.sectorHistoricalPerformance, {}, {apikey: apikey});
    }

    async gainers(): Promise<any> {
        return await this.fetch(resources.marketBiggestGainers, {}, {apikey: apikey});
    }

    async losers(): Promise<any> {
        return await this.fetch(resources.marketBiggestLosers, {}, {apikey: apikey});
    }

    async actives(): Promise<any> {
        return await this.fetch(resources.marketMostActives, {}, {apikey: apikey});
    }

    public async run(): Promise<MarketPerformance> {

        const [index, sector, industry, performance, historical, gainers, losers, actives] = await Promise.allSettled([
            this.index(),
            this.sector(),
            this.industry(),
            this.performance(),
            this.historical(),
            this.gainers(),
            this.losers(),
            this.actives(),
        ]);

        return {
            index: index.status === "fulfilled" ? index.value : null,
            sectorPEratio: sector.status === "fulfilled" ? sector.value : null,
            industryPEratio: industry.status === "fulfilled" ? industry.value : null,
            sectorPerformance: performance.status === "fulfilled" ? performance.value : null,
            sectorHistorical: historical.status === "fulfilled" ? historical.value : null,
            biggestGainers: gainers.status === "fulfilled" ? gainers.value : null,
            biggestLosers: losers.status === "fulfilled" ? losers.value : null,
            mostActives: actives.status === "fulfilled" ? actives.value : null,
        };
    }
}

export default Performances;