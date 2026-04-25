import { z } from 'zod';

import { ModelSchema, buildValidationSchema } from './model_schema';
import { RestApi, RestApiOptions } from './restapi';


export type SchemaRegisterOptions = RestApiOptions & {
	schemaName: string,
};


export class SchemaRegistry {
	#registry: Map<string, RegistryItem> = new Map();

	public register(opts: SchemaRegisterOptions[]): void {
		opts.forEach(opt => {
			const restApi = new RestApi(opt);
			this.#registry.set(opt.schemaName, {
				schemaName: opt.schemaName,
				restApi: restApi,
			});
		});
	}

	public async get(schemaName: string): Promise<SchemaPack | null> {
		const item = await this.#fetchModelSchema(schemaName);
		if (!item) return null;
		const [modelSchema, validationSchema] = await Promise.all([item.modelSchema!, item.validationSchema!]);

		return {
			schemaName,
			modelSchema,
			validationSchema,
			restApi: item.restApi,
		};
	}

	async #fetchModelSchema(schemaName: string): Promise<RegistryItem | null> {
		const item = this.#registry.get(schemaName);
		if (!item) return null;
		if (item.modelSchema) return item;
		item.modelSchema = item.restApi.getModelSchema().then(response => {
			if (response.name !== schemaName) {
				throw new Error(`Registered schema name '${schemaName}' does not match the response name '${response.name}'`);
			}
			return response;
		});
		item.validationSchema = item.modelSchema.then(buildValidationSchema);
		return item;
	}
}

export type SchemaPack = {
	schemaName: string,
	restApi: RestApi,
	modelSchema: ModelSchema,
	validationSchema: z.ZodObject,
};

type RegistryItem = {
	schemaName: string,
	restApi: RestApi,
	validationSchema?: Promise<z.ZodObject>,
	modelSchema?: Promise<ModelSchema>,
};

export const schemaRegistry = new SchemaRegistry();
