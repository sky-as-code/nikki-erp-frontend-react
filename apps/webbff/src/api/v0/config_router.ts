import express, { type Router } from 'express';

import type { AppConfig } from '../../common/config/types';


export const CONFIG_ROUTER_PATH = '/api/v0/config';

export function createConfigRouter(config: AppConfig): Router {
	const router = express.Router();
	router.get('/', (_req, res) => {
		res.status(200).json(config.clientConfig);
	});
	return router;
}
