import * as ApiKeyUsageModel from '../models/ApiKeyUsage.js';
import * as ApiKeyModel from '../models/ApiKey.js';

export const getApiKeyUsageByDayByUser = async (req, res) => {
	try {
	  const user_id = req.user.id;
  
	  const apiKeys = await ApiKeyModel.getAPIKeysByUserId(user_id);
  
	  const usageByDate = {};
  
	  for (const apiKey of apiKeys) {
		const usageData = await ApiKeyUsageModel.getUsageByApiKey(apiKey.api_key);
		
		usageData.forEach(usage => {
		  const date = usage.created_at.split(' ')[0];
		  if (usageByDate[date]) {
			usageByDate[date] += 1;
		  } else {
			usageByDate[date] = 1;
		  }
		});
	  }

	  //transform to date: requests:
	  const formattedData = Object.entries(usageByDate).map(([date, count]) => ({
		date,
		requests: count
	  }));

	  formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
	  res.json({
		success: true,
		data: formattedData
	  });
	  
	} catch (error) {
	  res.status(500).json({
		success: false,
		error: error.message
	  });
	}
  };

export const getApiKeyUsageByEndpoint = async (req, res) => {
	try {
	  const user_id = req.user.id;
	  const apiKeys = await ApiKeyModel.getAPIKeysByUserId(user_id);
	  
	  const usageByEndpointAndKey = [];
	  
	  for (const apiKey of apiKeys) {
		const usageData = await ApiKeyUsageModel.getUsageByApiKey(apiKey.api_key);

		const endpointCounts = {};
		
		usageData.forEach(usage => {
		  const endpoint = usage.endpoint;
		  if (endpointCounts[endpoint]) {
			endpointCounts[endpoint] += 1;
		  } else {
			endpointCounts[endpoint] = 1;
		  }
		});

		Object.entries(endpointCounts).forEach(([endpoint, count]) => {
		  usageByEndpointAndKey.push({
			endpoint,
			requests: count,
			apiKey: apiKey.api_key
		  });
		});
	  }
	  
	  res.json({
		success: true,
		data: usageByEndpointAndKey
	  });
	  
	} catch (error) {
	  res.status(500).json({
		success: false,
		error: error.message
	  });
	}
  };