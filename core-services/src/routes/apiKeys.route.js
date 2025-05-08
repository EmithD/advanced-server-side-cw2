import express from 'express';
import { createAPIKeyController, deleteApiKeyController, getAPIKeysController } from '../controllers/apiKey.controller.js';

const router = express.Router();

router.post('/', createAPIKeyController);
router.get('/', getAPIKeysController);
router.delete('/:id', deleteApiKeyController)

export default router;