import { ModelSchema, ModelValidationSchema, buildValidationSchema } from './model_schema';
import { RestApi, RestApiOptions } from './restapi';


export type SchemaRegisterOptions = RestApiOptions & {
	schemaName: string,
};

/**
 * Loads the micro-app owning `schemaName` so that its `init` can register the schema.
 *
 * Resolves `'unknown'` when no micro-app claims the schema. Set by the Shell, which is the only
 * layer that knows about micro-apps; `libs/common` must not depend on `libs/ui`.
 */
export type SchemaOwnerLoader = (schemaName: string) => Promise<'loaded' | 'unknown'>;


export class SchemaRegistry {
	#registry: Map<string, RegistryItem> = new Map();
	#ownerLoader?: SchemaOwnerLoader;
	#inflightLoads: Map<string, Promise<'loaded' | 'unknown'>> = new Map();
	#attempted: Set<string> = new Set();

	public register(opts: SchemaRegisterOptions[]): void {
		opts.forEach(opt => {
			const restApi = new RestApi(opt);
			this.#registry.set(opt.schemaName, {
				schemaName: opt.schemaName,
				restApi: restApi,
			});
		});
	}

	public setOwnerLoader(loader: SchemaOwnerLoader): void {
		this.#ownerLoader = loader;
	}

	/** Clears registrations and owner-load bookkeeping. Test seam. */
	public clear(): void {
		this.#registry.clear();
		this.#inflightLoads.clear();
		this.#attempted.clear();
		this.#ownerLoader = undefined;
	}

	public async get(schemaName: string): Promise<SchemaPack | null> {
		let item = await this.#fetchModelSchema(schemaName);
		if (!item) {
			item = await this.#loadOwnerAndRetry(schemaName);
			if (!item) return null;
		}
		const [modelSchema, validationSchema] = await Promise.all([item.modelSchema!, item.validationSchema!]);

		return {
			schemaName,
			modelSchema,
			validationSchema,
			restApi: item.restApi,
		};
	}

	/**
	 * A schema a module has not registered yet is not an error: its micro-app may simply not be
	 * loaded, which is the normal case for a relation pointing across module boundaries. Loading
	 * the owner lets it register its own `resourcePath`, which cannot be derived — `iam_user` is
	 * served from `v1/iam/users`, not `v1/iam/iam_user`.
	 *
	 * Attempted once per schema per session: a second miss means the owner loaded and still did
	 * not register it, which retrying cannot fix.
	 */
	async #loadOwnerAndRetry(schemaName: string): Promise<RegistryItem | null> {
		if (!this.#ownerLoader || this.#attempted.has(schemaName)) return null;

		const outcome = await this.#loadOwnerOnce(schemaName);
		this.#attempted.add(schemaName);
		if (outcome === 'unknown') {
			console.warn(`SchemaRegistry: no micro-app owns schema '${schemaName}'.`);
			return null;
		}

		const item = await this.#fetchModelSchema(schemaName);
		if (!item) {
			console.warn(
				`SchemaRegistry: micro-app owning '${schemaName}' loaded but did not register it.`,
			);
		}
		return item;
	}

	#loadOwnerOnce(schemaName: string): Promise<'loaded' | 'unknown'> {
		const inflight = this.#inflightLoads.get(schemaName);
		if (inflight) return inflight;

		const promise = this.#ownerLoader!(schemaName).finally(() => {
			this.#inflightLoads.delete(schemaName);
		});
		this.#inflightLoads.set(schemaName, promise);
		return promise;
	}

	/** Clears cached schema data and fetches a fresh {@link SchemaPack}. */
	public async refresh(schemaName: string): Promise<SchemaPack | null> {
		const item = this.#registry.get(schemaName);
		if (!item) return null;
		item.modelSchema = undefined;
		item.validationSchema = undefined;
		return this.get(schemaName);
	}

	async #fetchModelSchema(schemaName: string): Promise<RegistryItem | null> {
		const item = this.#registry.get(schemaName);
		if (!item) return null;
		if (item.modelSchema) return item;
		item.modelSchema = item.restApi.getModelSchema().then(({ data, clientErrors }) => {
			if (!data) {
				const reason = clientErrors.map(it => it.message).join('; ') || 'no response body';
				throw new Error(`Failed to fetch model schema '${schemaName}': ${reason}`);
			}
			if (data.name !== schemaName) {
				throw new Error(`Registered schema name '${schemaName}' does not match the response name '${data.name}'`);
			}
			return data;
		});
		item.validationSchema = item.modelSchema.then(buildValidationSchema);
		return item;
	}
}

export type SchemaPack = {
	schemaName: string,
	restApi: RestApi,
	modelSchema: ModelSchema,
	validationSchema: ModelValidationSchema,
};

type RegistryItem = {
	schemaName: string,
	restApi: RestApi,
	validationSchema?: Promise<ModelValidationSchema>,
	modelSchema?: Promise<ModelSchema>,
};

export const schemaRegistry = new SchemaRegistry();
