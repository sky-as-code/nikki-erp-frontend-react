import { CommandBus } from '../commandBus';

import type { SchemaPack } from '../dynamicModel';


/**
 * Command published to read the Shell's current organization.
 *
 * A literal rather than an import: the Shell owns the name, and `common` must not take a
 * compile-time dependency on the shell implementation to read it.
 */
const GET_CURRENT_ORG_ID = 'shell.shared_state.get_current_org_id';

/** The field the backend scopes on, named the same on both sides. */
const ORG_ID_FIELD = 'org_id';

/**
 * Resources that declare an `org_id` column but must **not** be sent one.
 *
 * Both call `WithdrawOrgScoping` on the backend because a NULL `org_id` means "domain-scoped"
 * rather than "belongs to no org". Sending an org would filter those rows out, which reads as
 * a silent under-grant rather than an error — so the id is omitted and the server returns the
 * org-owned and domain-scoped rows together.
 *
 * This is the one case schema detection alone gets wrong: the column is there, but the rule
 * that normally follows from it does not apply.
 */
export const ORG_SCOPE_OPT_OUT: ReadonlySet<string> = new Set([
	'iam_role',
	'iam_entitlement',
]);

/**
 * The organization the user is currently working in, or `null` before the Shell has resolved it.
 *
 * Async because the command bus is. Do not cache the result — the user can switch orgs at any
 * time, and a stale id silently returns another org's rows.
 */
export async function getCurrentOrgId(): Promise<string | null> {
	const bus = CommandBus.instance;
	if (!bus) {
		throw new Error('CommandBus is not initialized; the Shell installs it when the host provider mounts.');
	}
	const response = await bus.publish<string | null>({ name: GET_CURRENT_ORG_ID });
	return response.result?.data ?? null;
}

/**
 * Whether a resource is scoped to an organization, and so must carry an `org_id`.
 *
 * Mirrors the backend's own test — it asks whether the schema declares an `org_id` field
 * (`schemaHasOrgId`) — rather than keeping a hand-written list of resource names. The schema
 * is already fetched and cached before every call, so this costs nothing and stays correct
 * on its own as backend models gain or lose the column.
 */
export function isOrgScoped(schema: SchemaPack, schemaName: string): boolean {
	if (ORG_SCOPE_OPT_OUT.has(schemaName)) return false;
	return ORG_ID_FIELD in schema.modelSchema.fields;
}

/**
 * Adds `org_id` to a request bag for an org-scoped resource.
 *
 * A value the caller set always wins: a screen that deliberately reads across orgs — or one
 * acting on a record whose org is not the current one — has already decided, and must not be
 * silently redirected to the active org.
 *
 * Throws when the resource needs an org and none is resolved. The alternative is to send the
 * request anyway and let the server answer 400 `err_org_id_required`, which surfaces as a
 * generic validation toast naming a field the user never filled in. Failing here names the
 * resource and the real cause: the Shell has not resolved an org yet, or the page is being
 * rendered outside an org route.
 */
export async function withOrgId<TRequest extends object>(
	request: TRequest, schema: SchemaPack, schemaName: string,
): Promise<TRequest> {
	if (!isOrgScoped(schema, schemaName)) return request;
	if (ORG_ID_FIELD in request && (request as Record<string, unknown>)[ORG_ID_FIELD] != null) {
		return request;
	}

	const orgId = await getCurrentOrgId();
	if (!orgId) {
		throw new Error(
			`Resource '${schemaName}' is scoped to an organization, but no current organization is set. `
			+ 'The Shell resolves it from the :orgSlug route segment; a page rendered outside an org '
			+ 'route has none.',
		);
	}
	return { ...request, [ORG_ID_FIELD]: orgId };
}
