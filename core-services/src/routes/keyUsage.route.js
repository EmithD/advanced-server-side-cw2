import express from 'express';

import { getApiKeyUsageByDayByUser, getApiKeyUsageByEndpoint } from '../controllers/apiKeyUsage.controller.js';

const router = express.Router();

router.get('/date', getApiKeyUsageByDayByUser);
router.get('/endpoint', getApiKeyUsageByEndpoint);


export default router;