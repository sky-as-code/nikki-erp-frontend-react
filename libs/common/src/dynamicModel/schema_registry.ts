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
	/** Schemas another response already carried, held until their owner registers them. */
	#seeds: Map<string, ModelSchema> = new Map();

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
		this.#seeds.clear();
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
	 * the owner lets it register its own `resourcePath`, which cannot be derived from the schema
	 * name alone — the module key in the path is the owner's, not the schema prefix.
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

	/**
	 * Caches schemas a response already carried, so a later `get` costs no request. A schema already
	 * loaded or loading keeps what it has: the seed is never fresher than a fetch of its own.
	 */
	public seed(schemas: ModelSchema[]): void {
		for (const schema of schemas) {
			if (schema?.name && !this.#registry.get(schema.name)?.modelSchema) {
				this.#seeds.set(schema.name, schema);
			}
		}
	}

	/**
	 * Clears cached schema data and fetches a fresh {@link SchemaPack}.
	 *
	 * Only this schema: a changed etag says nothing about the schemas its edges point at.
	 */
	public async refresh(schemaName: string): Promise<SchemaPack | null> {
		const item = this.#registry.get(schemaName);
		if (!item) return null;
		this.#seeds.delete(schemaName);
		this.#setSchema(item, this.#loadSingle(item));
		return this.get(schemaName);
	}

	async #fetchModelSchema(schemaName: string): Promise<RegistryItem | null> {
		const item = this.#registry.get(schemaName);
		if (!item) return null;
		if (item.modelSchema) return item;
		const seeded = this.#seeds.get(schemaName);
		this.#seeds.delete(schemaName);
		this.#setSchema(item, seeded ? Promise.resolve(seeded) : this.#loadWithGraph(item));
		return item;
	}

	#setSchema(item: RegistryItem, modelSchema: Promise<ModelSchema>): void {
		item.modelSchema = modelSchema;
		item.validationSchema = modelSchema.then(buildValidationSchema);
	}

	/**
	 * One `meta/schema_graph` request answers this schema and seeds every edge target, which a list
	 * or detail page asks for right after. Falls back to `meta/schema` when the graph is unavailable
	 * -- a nested resource, or an API host without the BFF -- so it is never worse than before.
	 */
	async #loadWithGraph(item: RegistryItem): Promise<ModelSchema> {
		if (item.restApi.isTopLevel) {
			const graph = await item.restApi.getSchemaGraph().catch(() => null);
			const root = graph?.data?.schema;
			if (root?.name === item.schemaName) {
				this.seed(Object.values(graph!.data!.edges ?? {}));
				return root;
			}
		}
		return this.#loadSingle(item);
	}

	async #loadSingle(item: RegistryItem): Promise<ModelSchema> {
		const { data, clientErrors } = await item.restApi.getModelSchema();
		if (!data) {
			const reason = clientErrors.map(it => it.message).join('; ') || 'no response body';
			throw new Error(`Failed to fetch model schema '${item.schemaName}': ${reason}`);
		}
		if (data.name !== item.schemaName) {
			throw new Error(
				`Registered schema name '${item.schemaName}' does not match the response name '${data.name}'`,
			);
		}
		return data;
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
