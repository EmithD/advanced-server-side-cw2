import express from 'express';

import { createCountriesController, getSavedCountries, restCountriesController } from '../controllers/coreApi.controller.js';

const router = express.Router();

router.post('/', restCountriesController);
router.post('/create', createCountriesController);
router.get('/', getSavedCountries);

export default router;