import { Command, CommandHandler, ICommandBus, ServiceResult } from '../commandBus';
import { CrudServiceBase, GenericCrudService } from '../service/crudServiceBase';


/**
 * Namespace of the schema-driven CRUD commands.
 *
 * The schema name lives in the command *name* rather than the payload, so page
 * metadata keeps passing a plain command-name string and the view kit needs no
 * knowledge of this mechanism.
 */
export const RESOURCE_COMMAND_PREFIX = 'core.resource';

export type ResourceAction =
	'create' | 'delete' | 'update' | 'get_by_id' | 'get_one'
	| 'search' | 'exists' | 'set_is_archived' | 'get_model_schema' | 'manage_m2m'
	| 'compute_field';

const RESOURCE_ACTIONS: ResourceAction[] = [
	'create', 'delete', 'update', 'get_by_id', 'get_one',
	'search', 'exists', 'set_is_archived', 'get_model_schema', 'manage_m2m',
	'compute_field',
];

/** `resourceCommand('iam_user', 'search')` -> `core.resource.iam_user.search` */
export function resourceCommand(schemaName: string, action: ResourceAction): string {
	return `${RESOURCE_COMMAND_PREFIX}.${schemaName}.${action}`;
}

export type ResourceCommandNames = {
	CREATE: string,
	DELETE: string,
	UPDATE: string,
	GET_BY_ID: string,
	GET_ONE: string,
	SEARCH: string,
	EXISTS: string,
	SET_IS_ARCHIVED: string,
	GET_MODEL_SCHEMA: string,
	MANAGE_M2M: string,
	COMPUTE_FIELD: string,
};

/** The command names for one schema, shaped like a hand-written `XCommands` object. */
export function resourceCommands(schemaName: string): Readonly<ResourceCommandNames> {
	return Object.freeze({
		CREATE: resourceCommand(schemaName, 'create'),
		DELETE: resourceCommand(schemaName, 'delete'),
		UPDATE: resourceCommand(schemaName, 'update'),
		GET_BY_ID: resourceCommand(schemaName, 'get_by_id'),
		GET_ONE: resourceCommand(schemaName, 'get_one'),
		SEARCH: resourceCommand(schemaName, 'search'),
		EXISTS: resourceCommand(schemaName, 'exists'),
		SET_IS_ARCHIVED: resourceCommand(schemaName, 'set_is_archived'),
		GET_MODEL_SCHEMA: resourceCommand(schemaName, 'get_model_schema'),
		MANAGE_M2M: resourceCommand(schemaName, 'manage_m2m'),
		COMPUTE_FIELD: resourceCommand(schemaName, 'compute_field'),
	});
}

const services = new Map<string, CrudServiceBase>();

/**
 * Registers the service the generic handler should use for `schemaName`.
 *
 * A module calls this in `init` when its resource needs behaviour beyond plain CRUD.
 * Schemas with no registered service fall back to a {@link GenericCrudService}, which
 * is what lets a resource defined at runtime work with no module code at all.
 */
export function registerCrudService(schemaName: string, service: CrudServiceBase): void {
	services.set(schemaName, service);
}

/** Clears registered services. Test seam. */
export function clearCrudServices(): void {
	services.clear();
}

/**
 * The module a schema belongs to, used as part 1 of its event topics.
 *
 * A schema name is `{module}_{entity}` by convention, but the convention is not
 * enforced (`iam_orgUnit` vs `essential_module_metadata`), so a module may declare
 * the mapping instead of relying on the split.
 */
const schemaModules = new Map<string, string>();

export function registerSchemaModule(schemaName: string, moduleName: string): void {
	schemaModules.set(schemaName, moduleName);
}

/**
 * The service the generic handler will use for `schemaName`. Exported for tests, which assert that
 * a fallback never displaces a service the owning module registers later.
 */
export function resolveService(schemaName: string): CrudServiceBase {
	const registered = services.get(schemaName);
	if (registered) {
		return registered;
	}
	// Deliberately not cached. The Shell subscribes the `core.resource` prefix eagerly, so a
	// command can be served before the owning module has loaded and called `registerCrudService`.
	// Caching the fallback here would pin it for the rest of the session and silently shadow the
	// real service — along with every behaviour it adds beyond plain CRUD.
	const moduleName = schemaModules.get(schemaName) ?? schemaName.split('_')[0];
	return new GenericCrudService({ moduleName, schemaName });
}

/**
 * Subscribes one prefix handler that serves CRUD for every schema, present and future.
 *
 * The Shell calls this once. Because it is a prefix subscription, a schema registered
 * later — including one an admin defines at runtime — is served without any further
 * subscription. A module may still `subscribe` an exact command name to override a
 * single operation, since exact matches win over prefixes.
 */
export function registerGenericResourceCommands(bus: ICommandBus): () => void {
	return bus.subscribePrefix(RESOURCE_COMMAND_PREFIX, handleResourceCommand);
}

async function handleResourceCommand(command: Command): Promise<ServiceResult<unknown>> {
	const { schemaName, action } = parseResourceCommand(command.name);
	return runAction(resolveService(schemaName), action, payloadOf(command));
}

export type ParsedResourceCommand = {
	schemaName: string,
	action: ResourceAction,
};

/**
 * Splits `core.resource.{schemaName}.{action}`.
 *
 * Throws on a malformed name: that is a programmer error (a page referencing a
 * command that was never defined), so it belongs in `error`, not `clientErrors`.
 */
export function parseResourceCommand(commandName: string): ParsedResourceCommand {
	const suffix = commandName.slice(RESOURCE_COMMAND_PREFIX.length + 1);
	const separatorIdx = suffix.lastIndexOf('.');
	const schemaName = separatorIdx < 0 ? '' : suffix.slice(0, separatorIdx);
	const action = separatorIdx < 0 ? '' : suffix.slice(separatorIdx + 1);
	if (!schemaName || !RESOURCE_ACTIONS.includes(action as ResourceAction)) {
		throw new Error(`Malformed resource command name "${commandName}".`);
	}
	return { schemaName, action: action as ResourceAction };
}

/** `getOne` filters on whatever unique fields the caller passed, minus `fields`. */
function buildSearchParams(request: Record<string, any>): URLSearchParams {
	const searchParams = new URLSearchParams();
	Object.entries(request).forEach(([key, value]) => {
		if (value == null) return;
		if (Array.isArray(value)) {
			value.forEach(item => searchParams.append(key, String(item)));
		}
		else {
			searchParams.append(key, String(value));
		}
	});
	return searchParams;
}

export type ResourceDescriptor = {
	/** MUST equal the micro-app slug: the bus lazy-loads from segment 1 of the name. */
	module: string,
	schemaName: string,
	/** Singular noun used in verb-suffixed names, e.g. `role` -> `create_role`. */
	singular: string,
	/** Plural noun used by `search`, e.g. `roles` -> `search_roles`. */
	plural: string,
	service: CrudServiceBase,
	/** Extra command names mapped onto a standard action, e.g. `activate_user` -> `update`. */
	extraAliases?: Record<string, ResourceAction>,
};

/** The subset of {@link ResourceCommandNames} the named (non-generic) path covers. */
export type NamedResourceCommands = {
	CREATE: string,
	DELETE: string,
	UPDATE: string,
	GET_BY_ID: string,
	SEARCH: string,
	EXISTS: string,
	SET_IS_ARCHIVED: string,
};

/**
 * Reproduces the hand-written `{module}.{schema}.{verb}_{noun}` names.
 *
 * Kept so resources that have not migrated to the generic command path keep working
 * unchanged; new resources should use {@link resourceCommands}.
 */
export function buildResourceCommandNames(
	descriptor: ResourceDescriptor,
): NamedResourceCommands & Record<string, string> {
	const prefix = `${descriptor.module}.${descriptor.schemaName}`;
	const { singular, plural } = descriptor;
	const names: NamedResourceCommands & Record<string, string> = {
		CREATE: `${prefix}.create_${singular}`,
		DELETE: `${prefix}.delete_${singular}`,
		UPDATE: `${prefix}.update_${singular}`,
		GET_BY_ID: `${prefix}.get_${singular}_by_id`,
		SEARCH: `${prefix}.search_${plural}`,
		EXISTS: `${prefix}.${singular}_exists`,
		SET_IS_ARCHIVED: `${prefix}.set_${singular}_is_archived`,
	};
	Object.keys(descriptor.extraAliases ?? {}).forEach(alias => {
		names[alias.toUpperCase()] = `${prefix}.${alias}`;
	});
	return names;
}

/** Subscribes the named commands from {@link buildResourceCommandNames} onto `bus`. */
export function registerResourceCommands(bus: ICommandBus, descriptor: ResourceDescriptor): () => void {
	const { service } = descriptor;
	const names = buildResourceCommandNames(descriptor);
	const byName: Record<string, CommandHandler> = {
		CREATE: cmd => service.create(payloadOf(cmd)),
		DELETE: cmd => service.delete(payloadOf(cmd)),
		UPDATE: cmd => service.update(payloadOf(cmd)),
		GET_BY_ID: cmd => service.getById(payloadOf(cmd)),
		SEARCH: cmd => service.search(payloadOf(cmd)),
		EXISTS: cmd => service.exists(payloadOf(cmd)),
		SET_IS_ARCHIVED: cmd => service.setIsArchived(payloadOf(cmd)),
	};
	Object.entries(descriptor.extraAliases ?? {}).forEach(([alias, action]) => {
		byName[alias.toUpperCase()] = cmd => runAction(service, action, payloadOf(cmd));
	});

	const unsubscribers = Object.entries(byName).map(
		([key, handler]) => bus.subscribe(names[key], handler),
	);
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payloadOf<TPayload>(command: Command): TPayload {
	return (command.payload ?? {}) as TPayload;
}

function runAction(
	service: CrudServiceBase, action: ResourceAction, payload: any,
): Promise<ServiceResult<unknown>> {
	switch (action) {
		case 'create': return service.create(payload);
		case 'update': return service.update(payload);
		case 'delete': return service.delete(payload);
		case 'set_is_archived': return service.setIsArchived(payload);
		case 'manage_m2m': return service.manageM2m(payload, payload.path);
		case 'get_by_id': return service.getById(payload);
		case 'get_one': return service.getOne(payload, buildSearchParams);
		case 'search': return service.search(payload);
		case 'exists': return service.exists(payload);
		case 'get_model_schema': return service.getModelSchema();
		// The field name travels in the payload, like manage_m2m's path, so the command name
		// stays one-per-schema rather than one-per-field.
		case 'compute_field': return service.computeField(payload, payload.field);
	}
}
