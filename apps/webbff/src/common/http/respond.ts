import type { Response } from 'express';


/** The raw query string of `originalUrl` without `?`; empty when there is none. */
export function rawQuery(originalUrl: string): string {
	const separatorIdx = originalUrl.indexOf('?');
	return separatorIdx < 0 ? '' : originalUrl.slice(separatorIdx + 1);
}

/** Sends an accumulated answer with `Cache-Control: no-store`: JSON, plain text for a non-JSON body, or empty. */
export function sendNoStoreResult(res: Response, result: { readonly status: number; readonly body: unknown }): void {
	res.status(result.status).set('cache-control', 'no-store');
	if (result.body === undefined) {
		res.end();
		return;
	}
	if (typeof result.body === 'string') {
		res.type('text/plain').send(result.body);
		return;
	}
	res.json(result.body);
}
