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
 * Every notification read is org-scoped, and the backend binds `org_id` into the query
 * unconditionally, so omitting it matches no rows rather than all of them — an empty inbox that
 * looks like "nothing to read" rather than the missing precondition it is.
 *
 * Async because the command bus is. Do not cache the result — the user can switch orgs at any
 * time, and a stale id silently shows another organization's notifications.
 */
export async function getCurrentOrgId(): Promise<string | null> {
	const bus = CommandBus.instance;
	if (!bus) {
		throw new Error('CommandBus is not initialized; the Shell installs it when the host provider mounts.');
	}
	const response = await bus.publish<string | null>({ name: GET_CURRENT_ORG_ID });
	return response.result?.data ?? null;
}
