import { fail, ICommandBus, ok } from '../commandBus';
import { schemaRegistry, SchemaPack } from './schema_registry';


/**
 * Command names owned by the dynamic-model core. `get_schema` resolves a
 * {@link SchemaPack} for a registered schema name through the command bus,
 * decoupling consumers from the concrete {@link schemaRegistry}.
 */
export const SCHEMA_COMMANDS = {
	getSchema: 'core.dynamic_model.get_schema',
} as const;

export type GetSchemaPayload = { schemaName: string };

/**
 * Subscribes the `get_schema` handler onto the given bus. The handler returns the
 * live (non-serializable) {@link SchemaPack} in `data`, or an error when the
 * schema name is not registered. Returns the unsubscribe function.
 */
export function registerSchemaCommands(bus: ICommandBus): () => void {
	return bus.subscribe(SCHEMA_COMMANDS.getSchema, async function getSchema(command) {
		const { schemaName } = (command.payload ?? {}) as Partial<GetSchemaPayload>;
		if (!schemaName) {
			return fail(new Error('get_schema requires a "schemaName" payload.'));
		}
		const pack = await schemaRegistry.get(schemaName);
		if (!pack) {
			return fail(new Error(`No schema registered for '${schemaName}'.`));
		}
		return ok(pack);
	});
}

/** Publishes `get_schema` and unwraps the response to a `SchemaPack | null`. */
export async function publishGetSchema(bus: ICommandBus, schemaName: string): Promise<SchemaPack | null> {
	const response = await bus.publish<SchemaPack>({
		name: SCHEMA_COMMANDS.getSchema,
		payload: { schemaName } satisfies GetSchemaPayload,
	});
	return response.error ? null : response.data;
}
