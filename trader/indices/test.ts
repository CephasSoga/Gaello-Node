import axios from 'axios';

// Define the function to fetch historical data
async function fetchHistoricalData(symbol: string, apiKey: string, startDate: string, endDate: string): Promise<void> {
    // Construct the URL
    const url = `https://eodhistoricaldata.com/api/eod/${symbol}`;
    
    try {
        // Make the API request
        const response = await axios.get(url, {
            params: {
                api_token: apiKey,
                from: startDate,
                to: endDate,
                fmt: 'json'
            }
        });

        // Log or process the response data
        console.log(response.data);
    } catch (error) {
        // Handle errors
        console.error(`Error fetching data: ${error}`);
    }
}

// Replace with your actual API key and desired parameters
const apiKey = ' 66ab78f0ec6072.28841666';
const symbol = 'DJI.INDX'; // For example, S&P 500 index
const startDate = '2024-01-01';
const endDate = '2024-07-01';

// Call the function
fetchHistoricalData(symbol, apiKey, startDate, endDate);
