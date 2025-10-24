import { MicroAppMetadata } from '@nikkierp/common/types';
import { ImportResult } from '@nikkierp/ui/types';


export type RetryOptions = {
	maxAttempts?: number;
	baseDelayMs?: number;
	maxDelayMs?: number;
};

type AppSlug = string;

export class MicroAppManager {
	private readonly registeredApps: Map<AppSlug, MicroAppMetadata> = new Map();
	private readonly downloadedBundles: Map<AppSlug, ImportResult> = new Map();
	private readonly retryOptions: RetryOptions;

	constructor(
		apps: MicroAppMetadata[],
		retryOptions: RetryOptions = {},
	) {
		this.registeredApps = new Map(apps.map(app => [app.slug, app]));
		this.retryOptions = {
			maxAttempts: 3,
			baseDelayMs: 1_000,
			maxDelayMs: 10_000,
			...retryOptions,
		};
	}

	/**
	 * Attempts to fetch the bundle from the registered micro-app with specified slug.
	 * If the bundle is already downloaded, returns the downloaded bundle,
	 * otherwise, downloads and returns it with retry logic.
	 */
	public async fetchMicroApp(slug: string): Promise<MicroAppMetadata> {
		const app = this.registeredApps.get(slug);
		if (!app) {
			throw new Error(`Bundle ${slug} not found`);
		}

		if (!this.downloadedBundles.has(slug)) {
			const bundle = await this.importWithRetry(app);
			this.downloadedBundles.set(slug, bundle);
		}

		return app;
	}

	private async importWithRetry(app: MicroAppMetadata): Promise<ImportResult> {
		const { maxAttempts, baseDelayMs: baseDelay, maxDelayMs: maxDelay } = this.retryOptions;
		let lastError: Error;

		for (let attempt = 1; attempt <= maxAttempts!; attempt++) {
			try {
				return await (typeof app.url === 'string' ? import(app.url) : app.url());
			}
			catch (error) {
				lastError = error as Error;

				if (attempt === maxAttempts) {
					break;
				}

				const delayMs = calculateExponentialBackoffDelay(attempt, baseDelay!, maxDelay!);

				console.warn(
					`Bundle import attempt ${attempt} failed for ${typeof app.url === 'string' ? app.url : 'function'}. Retrying in ${delay}ms...`,
					error,
				);

				await delay(delayMs);
			}
		}

		throw new Error(
			`Failed to import bundle after ${maxAttempts} attempts. Last error: ${lastError!.message}`,
		);
	}
}

function calculateExponentialBackoffDelay(attempt: number, baseDelay: number, maxDelay: number): number {
	return Math.min(
		baseDelay * Math.pow(2, attempt - 1),
		maxDelay,
	);
}

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}