import express, { Router, Request, Response } from 'express';

export const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
	res.send('Welcome to the API!');
});
