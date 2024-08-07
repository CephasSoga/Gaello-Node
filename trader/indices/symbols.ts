export interface IndexType {
    symbol: string;
    name: string;
}


export async function collectIndexSymbols(): Promise<IndexType[]> {
    // TODO: Implement logic to fetch and return index symbols
    // placeholder function
    return [{symbol: '', name: ''}]
}


const exportables: IndexType[] = [
    {symbol: "GSPC.INDX", name: "S & P 500"},
    {symbol: "DJI.INDX", name: "Dow Jones Industrial Average"},
    {symbol: "IXIC.INDX", name: "Nasdaq Composite Index"},
    {symbol: "FTSE.INDX", name: "FTSE 100 Index"},
    {symbol: "GDAXI.INDX", name: "DAX Index"},
    {symbol: "N225.INDX", name: "Nikkei 225 Index"},
    {symbol: "HSI.INDX", name: "Hang Seng Index"},
    {symbol: "FCHI.INDX", name: "CAC 40 Index"},
    {symbol: "STOXX50E.INDX", name: "Euro Stoxx 50 Index"},
    {symbol: "IBOV.INDX", name: "Bovespa Index"},

];

export default exportables;