import express from 'express';

import { createCountriesController, getSavedCountries, restCountriesController } from '../controllers/coreApi.controller.js';
import authenticateUser from '../middleware/authUser.middleware.js';

const router = express.Router();

router.post('/', restCountriesController);
router.post('/create', authenticateUser, createCountriesController);
router.get('/', getSavedCountries);

export default router;