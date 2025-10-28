import { MicroAppBundle, MicroAppConfig, MicroAppMetadata } from '@nikkierp/ui/microApp';
import { ImportResult } from '@nikkierp/ui/types';


export type RetryOptions = {
	maxAttempts?: number;
	baseDelayMs?: number;
	maxDelayMs?: number;
};

type MicroAppSlug = string;
export type MicroAppPack = {
	initBundle: MicroAppBundle;
	config: MicroAppConfig | undefined;
	htmlTag: string;
	metadata: MicroAppMetadata;
};

export class MicroAppManager {
	private readonly registeredApps: Map<MicroAppSlug, MicroAppMetadata> = new Map();
	private readonly downloadedPacks: Map<MicroAppSlug, MicroAppPack> = new Map();
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
	 * Attempts to fetch the bundle and config from the registered micro-app with specified slug.
	 * If the bundle is already downloaded, returns the downloaded bundle,
	 * otherwise, downloads and returns it with retry logic.
	 */
	public async fetchMicroApp(slug: string): Promise<MicroAppPack> {
		const app = this.registeredApps.get(slug);
		if (!app) {
			throw new Error(`Bundle ${slug} is not registered`);
		}

		let pack = this.downloadedPacks.get(slug);
		if (!pack) {
			const [bundle, config] = await Promise.all([
				this.importBundle(app),
				this.fetchConfig(app),
			]);

			pack = {
				initBundle: bundle.default,
				config,
				htmlTag: app.htmlTag,
				metadata: app,
			};
			this.downloadedPacks.set(slug, pack);
		}

		return pack;
	}

	private async importBundle(app: MicroAppMetadata): Promise<ImportResult<MicroAppBundle>> {
		return this.fetchWithRetry<ImportResult<MicroAppBundle>>(
			() => {
				return (typeof app.bundleUrl === 'string' ? import(app.bundleUrl) : app.bundleUrl());
			},
			`Bundle import for ${app.slug}`,
		);
	}

	private async fetchConfig(app: MicroAppMetadata): Promise<MicroAppConfig | undefined> {
		if (!app.configUrl) {
			return undefined;
		}

		const config = await this.fetchWithRetry<MicroAppConfig>(
			async () => {
				const response = await fetch(app.configUrl!);
				if (!response.ok) {
					throw new Error(`Failed to fetch config: ${response.statusText}`);
				}
				return response.json();
			},
			`Config fetch for ${app.slug}`,
		);

		return config;
	}

	private async fetchWithRetry<T>(
		operation: () => Promise<T>,
		action: string,
	): Promise<T> {
		const { maxAttempts, baseDelayMs: baseDelay, maxDelayMs: maxDelay } = this.retryOptions;
		let lastError: Error;

		for (let attempt = 1; attempt <= maxAttempts!; attempt++) {
			try {
				return await operation();
			}
			catch (error) {
				lastError = error as Error;

				if (attempt === maxAttempts) {
					break;
				}

				const delayMs = calculateExponentialBackoffDelay(attempt, baseDelay!, maxDelay!);

				console.warn(
					`${action} attempt ${attempt} failed. Retrying in ${delayMs}ms...`,
					error,
				);

				await delay(delayMs);
			}
		}

		throw new Error(
			`${action} failed after ${maxAttempts} attempts. Last error: ${lastError!.message}`,
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