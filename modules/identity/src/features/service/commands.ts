import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { serviceService } from './serviceService';
import { IAM_MODULE, SERVICE_SCHEMA_NAME } from '../../constants';
import * as ra from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${SERVICE_SCHEMA_NAME}`;

/** The status each contextual action moves the service to. A service is never invited: it cannot sign in. */
const STATUS_BY_ACTION = { activate: 'active', suspend: 'suspended' } as const;

/**
 * Command names for the service resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.iam_service.*`), served by the Shell's
 * single prefix subscription. The rest mirror `UserCommands`: `ACTIVATE` / `SUSPEND` are `update` carrying a fixed
 * `status`, and the role-assignment pair hits `iam_service/:id/roles` and `iam_service/:id/manage_roles`.
 */
export const ServiceCommands = Object.freeze({
	...resourceCommands(SERVICE_SCHEMA_NAME),
	ACTIVATE: `${PREFIX}.activate_service`,
	SUSPEND: `${PREFIX}.suspend_service`,
	MANAGE_ROLE_ASSIGNMENTS: `${PREFIX}.manage_service_role_assignments`,
	SEARCH_ASSIGNED_ROLES: `${PREFIX}.search_service_assigned_roles`,
} as const);

/**
 * Registers the service resource's service and subscribes the non-CRUD handlers. Called synchronously during the
 * micro-app `init`. Returns a function that unsubscribes every handler (for teardown).
 */
export function registerServiceCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SERVICE_SCHEMA_NAME, IAM_MODULE);
	registerCrudService(SERVICE_SCHEMA_NAME, serviceService);

	const unsubscribers = [
		bus.subscribe(ServiceCommands.ACTIVATE, cmd => setStatus('activate', cmd)),
		bus.subscribe(ServiceCommands.SUSPEND, cmd => setStatus('suspend', cmd)),
		bus.subscribe(
			ServiceCommands.SEARCH_ASSIGNED_ROLES,
			cmd => ra.searchAssignedRoles('services', payload<ra.SearchAssignedRolesRequest>(cmd)),
		),
		bus.subscribe(
			ServiceCommands.MANAGE_ROLE_ASSIGNMENTS,
			cmd => ra.manageRoleAssignments('services', payload<ra.ManageRoleAssignmentsRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function setStatus(action: keyof typeof STATUS_BY_ACTION, command: Command) {
	const request = payload<dyn.RestMutateOneRequest>(command);
	return serviceService.update({ ...request, status: STATUS_BY_ACTION[action] });
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
