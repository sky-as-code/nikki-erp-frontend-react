import { CommandBus } from '@nikkierp/common/commandBus';


/**
 * Command published to read the Shell's current organization.
 *
 * A literal rather than an import: the Shell owns the name, and a module must not take a
 * compile-time dependency on the shell implementation to read it.
 */
const GET_CURRENT_ORG_ID = 'shell.shared_state.get_current_org_id';

/**
 * The organization the user is currently working in, or `null` before the Shell has resolved it.
 *
 * `essential_uom` and `essential_uomcat` both carry a required `org_id`, and the backend binds it
 * into the search graph unconditionally, so omitting it matches no rows rather than matching all
 * of them. Every call that lists or fetches records must carry it.
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
 * Adds `org_id` to a request bag, leaving it off entirely when no org is active.
 *
 * Omitting beats sending an empty string: `org_id=''` is a filter that matches nothing, which
 * reads as "this org owns no records" rather than as the missing precondition it actually is.
 */
export async function withOrgId<TRequest extends object>(
	request: TRequest,
): Promise<TRequest & { org_id?: string }> {
	const orgId = await getCurrentOrgId();
	return orgId ? { ...request, org_id: orgId } : request;
}
