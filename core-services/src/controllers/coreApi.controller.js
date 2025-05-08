import * as ApiKeyModel from '../models/ApiKey.js';
import * as ApiKeyUsageModel from '../models/ApiKeyUsage.js';

export const restCountriesController = async (req, res) => {

    try {

        const api_key = req.body.apiKey;
        const search_type = req.body.searchType;
        const search_query = req.body.searchQuery;

        const api_key_data = await ApiKeyModel.getAPIKeyByKey(api_key);

        if (!api_key_data) {
            return res.status(404).json({ error: 'API key not found' });
        }

        await ApiKeyUsageModel.createUsageRecord(api_key, `${search_type}/${search_query}`)

        const country_data = await fetch(`https://restcountries.com/v3.1/${search_type}/${search_query}`);
        const country_data_json = await country_data.json();

        if (country_data_json.status === 404) {
            return res.status(404).json({ error: 'Country not found' });
        }

        return res.status(200).json(country_data_json);


    } catch (error) {
        console.error('Error in restCountriesController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}