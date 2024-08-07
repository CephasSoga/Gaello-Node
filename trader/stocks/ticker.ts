import GenericInformation from "./generic";
import Valuation from "./valuation";
import FinancialAnalysis from "./analysis";
import HistoricalData from "./historical";
import UpDowns from "./updowns";
import Statistics from "./statistics";
import {Message}  from "../../rmq/producer";
import { now } from "../../utils/time";
import RevenueBySegments from "./revenues";

export interface TickerInterface {
    general: {
        outlook: any,
        stockPeers: any,
        financials: any,
        analystEstimate: any,
        analystRecommendations: any,
        priceTarget: any,
        priceTargetSummary: any,
    },
    analysis: {
        keyMetricsTTM: any,
        ratiosTTM: any,
        cashflowGrowth: any,
        incomeGrowth: any,
        balanceSheetGrowth: any,
        financialGrowth: any,
        financialScores: any,
        ownerEarnings: any,
        enterpriseValues: any,
    },
    valuation: {
        discountedCashflow: any,
        advancdeDiscountedCashflow: any,
        leveredDiscountedCashflow: any,
        companyRating: any,
    },
    historical: {
        price: any,
        marketCapitalization: any,
        dividends: any,
        splits: any,
        rating: any,
        socialSentiment: any,
    },
    upsAndDowns: {
        upgradeAndDowngrade: any,
        upgradesAndDowngradesConsensus: any,
    },

    revenues: {
        revenueProductSegementation: any,
        revenueGeoSegementation: any, 
    },

    statistics: {
        simpleMovingAverage: any,
        exponentialMovingAverage: any,
        doubleEMA: any,
        tripeEMA: any,
        williams: any,
        relativeStrengthIndex: any,
        averageDirectionalIndex: any,
        standardDeviation: any,
    },
}

class Ticker {
    constructor(public symbol: any) {}
    
    public async build(): Promise<{tickerResult: TickerInterface, message: Message}> {
        const [general, analysis, valuation, historical, upsAndDowns, revenues, statistics] = await Promise.all(
            [
                new GenericInformation(this.symbol).run(),
                new FinancialAnalysis(this.symbol).run(),
                new Valuation(this.symbol).run(),
                new HistoricalData(this.symbol).run(),
                new UpDowns(this.symbol).run(),
                new RevenueBySegments(this.symbol).run(),
                new Statistics(this.symbol).run(),
            ]
        );

        const ticker: TickerInterface = {
            general,
            analysis,
            valuation,
            historical,
            upsAndDowns,
            revenues,
            statistics,
        }
        
        const message: Message = {
            id: this.symbol + now(),
            type: "ticker",
            value: JSON.stringify(ticker),
        };
      
        return {
            tickerResult: ticker,
            message: message,
        }
    }
}

export default Ticker;