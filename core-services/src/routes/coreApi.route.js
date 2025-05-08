import express from 'express';

import authenticateUser from '../middleware/authUser.middleware.js';
import { restCountriesController } from '../controllers/coreApi.controller.js';

const router = express.Router();

router.post('/', restCountriesController);

export default router;