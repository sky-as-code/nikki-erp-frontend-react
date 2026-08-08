import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { roleService } from './roleService';
import * as t from './types';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../constants';
import { DescribeRolesRequest, describeRoles } from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${ROLE_SCHEMA_NAME}`;

/**
 * Command names for the role resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.iam_role.*`), served by
 * the Shell's single prefix subscription — this module subscribes none of them. Deriving them from
 * the schema name alone is what lets a relation select find the search command for a target it
 * only knows by `dest_schema_name`.
 *
 * The remaining two are not CRUD over `iam_role`: `DESCRIBE` reads a role-assignment endpoint the
 * dynamic schema cannot express, and `MANAGE_ENTITLEMENTS` is a many-to-many write whose sub-path
 * is fixed, so callers need send no `path`.
 */
export const RoleCommands = Object.freeze({
	...resourceCommands(ROLE_SCHEMA_NAME),
	DESCRIBE: `${PREFIX}.describe_roles`,
	MANAGE_ENTITLEMENTS: `${PREFIX}.manage_role_entitlements`,
} as const);

/**
 * Registers the role service and subscribes the non-CRUD handlers. Called synchronously during the
 * micro-app `init` so the service is in place before any generic command is served.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerRoleCommands(bus: ICommandBus): () => void {
	registerSchemaModule(ROLE_SCHEMA_NAME, IAM_MODULE);
	registerCrudService(ROLE_SCHEMA_NAME, roleService);

	const unsubscribers = [
		bus.subscribe(RoleCommands.DESCRIBE, cmd => describeRoles(payload<DescribeRolesRequest>(cmd))),
		bus.subscribe(
			RoleCommands.MANAGE_ENTITLEMENTS,
			cmd => roleService.manageEntitlements(payload<t.ManageRoleEntitlementsRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
