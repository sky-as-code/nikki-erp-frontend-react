import express, { Router, Request, Response } from 'express';

import * as config from './config';


export const router: Router = express.Router();

router.get('/', (_: Request, res: Response) => {
	res.status(200).json(config.clientConfig);
});
