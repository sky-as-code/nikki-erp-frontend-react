import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import compression from 'compression'
import express, { Express, NextFunction, Request, Response } from 'express'
import * as vite from 'vite'

import { router } from './api'
import * as config from './config'

const isLocal = config.mustGetNodeEnv() === 'local'
const clientRootPath = config.mustGetBffConfig('CLIENT_ROOT_PATH') || '';

(async () => {
	const server = await createServer()
	const host = config.getBffConfig('HTTP_HOST')
	const port = config.mustGetBffConfig('HTTP_PORT')
	const bindAddress = host ? `${host}:${port}` : port
	server.listen(bindAddress, () => {
		console.log(`Shell BFF Server running on http://${host || 'localhost'}:${port}`)
	})
})()

async function createServer(): Promise<Express>{
	console.log('Client Root Path:', clientRootPath)
	const app = express()
	app.use('/api/config', router)

	let viteServer: vite.ViteDevServer | undefined
	if (isLocal) {
		viteServer = await initViteServer(app)
	}
	else {
		initStaticServer(app)
	}

	app.use(renderIndexHtml(viteServer))

	return app
};

async function initViteServer(app: Express): Promise<vite.ViteDevServer> {
	console.log('Initializing Vite Server...')
	const viteServer = await vite.createServer({
		root: clientRootPath,
		logLevel: 'info',
		server: {
			middlewareMode: true,
			watch: {
				usePolling: true,
				interval: 100,
			},
		},
		appType: 'custom',
	})

	app.use(viteServer.middlewares)
	return viteServer
}

function initStaticServer(app: Express): void {
	console.log('Initializing Static Server...')
	app.use(compression())
	app.use(
		express.static(clientRootPath, {
			// Disable directory listing
			index: false,
		}),
	)
}

function renderIndexHtml(viteServer: vite.ViteDevServer | undefined) {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!viteServer) {
			res.sendFile(path.join(clientRootPath, 'index.html'))
			return
		}
		try {
			await renderWithVite(req, res, viteServer)
		}
		catch (err) {
			viteServer?.ssrFixStacktrace(err as Error)
			next(err)
		}
	}
}

async function renderWithVite(req: Request, res: Response, viteServer: vite.ViteDevServer) {
	const url = req.originalUrl

	// Read raw index.html
	const html = await fs.readFile(
		path.join(clientRootPath, 'index.html'),
		'utf-8',
	)

	// Apply Vite transforms (inject HMR client, rewrite imports, etc.)
	const transformedHtml = await viteServer.transformIndexHtml(url, html)

	res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml)
}