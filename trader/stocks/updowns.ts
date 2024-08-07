import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";


class UpDowns extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async updowns(): Promise<any> {
        return await this.fetch(resources.upgradeOrDowngrade, {symbol: this.symbol}, {apikey: apikey});
    }

    async consensus(): Promise<any> {
        return await this.fetch(resources.upgradeOrDowngradeConsensus, {symbol: this.symbol}, {apikey: apikey});
    }

    public async run(): Promise<any> {
        const [updowns, consensus] = await Promise.all([this.updowns(), this.consensus()]);

        return {
            upgradeAndDowngrade: updowns, 
            upgradesAndDowngradesConsensus: consensus,
        };
    }
}

export default UpDowns;