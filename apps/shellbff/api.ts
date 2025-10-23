import express, { Router, Request, Response } from 'express';

import * as config from './config';


const clientConfig = config.parseFrontend();

export const router: Router = express.Router();

router.get('/', (_: Request, res: Response) => {
	res.status(200).json(clientConfig);
});
