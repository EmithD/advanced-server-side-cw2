import * as ApiKeyModel from '../models/ApiKey.js';
import * as UserModel from '../models/User.js';

export const createAPIKeyController = async (req, res) => {

	try {

		const user_id = req.user.id;

		const userData = await UserModel.findUserById(user_id);

		if (!userData) {
			return res.status(404).json({ error: 'User not found' });
		}

		const newAPIKey = await ApiKeyModel.createApiKey({ user_id: userData.id });
		
		res.status(201).json({
			success: true,
			data: newAPIKey
		});

	} catch (error) {
		if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'API key already exists' });
    }
    
    res.status(500).json({
      success: false,
      error: error
    });
	}

};

export const getAPIKeysController = async (req, res) => {

	try {

		const user_id = req.user.id;
		const apiKeys = await ApiKeyModel.getAPIKeysByUserId(user_id);

		if (!apiKeys) {
			return res.status(404).json({ error: 'No API keys found' });
		}

		res.status(200).json({
			success: true,
			data: apiKeys
		});
		
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error
		});
	}
}

export const deleteApiKeyController = async (req, res) => {
	try {

		const user_id = req.user.id;
		const id = req.params.id;
		
		if (!id) {
			return res.status(400).json({
				success: false,
				error: "API key ID is required"
			});
		}

		const deletedApiKey = await ApiKeyModel.deleteApiKey(id);
		
		if (!deletedApiKey) {
			return res.status(404).json({
				success: false,
				error: "API key not found"
			});
		}

		const apiKeys = await ApiKeyModel.getAPIKeysByUserId(user_id);
		

		res.status(200).json({
			success: true,
			message: "API key deleted successfully",
			data: apiKeys
		});
		
	} catch (error) {
		console.error("Error deleting API key:", error);
		res.status(500).json({
			success: false,
			error: error.message || "Internal server error"
		});
	}
}