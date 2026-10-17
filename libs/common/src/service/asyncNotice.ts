import { CommandBus } from '../commandBus';


/**
 * Command the Shell serves to show an async-action notice.
 *
 * A literal rather than an import: the Shell owns the name, and `common` must not take a
 * compile-time dependency on the shell implementation to read it.
 */
const NOTIFY = 'shell.async_notice.notify';

export type AsyncNoticeType = 'info' | 'error';

/**
 * Shows a transient notice at the top-center of the Shell for the outcome of an async action.
 * `info` auto-dismisses after 10 s; `error` stays until the user dismisses it.
 *
 * Not the Notification module (persistent inbox) and not a Mantine toast (form feedback).
 *
 * `html` is injected without sanitizing (problem shell-001): escape every value you did not author,
 * such as file names, record names or server error text.
 *
 * @returns the notice id.
 */
export async function showAsyncNotice(type: AsyncNoticeType, html: string): Promise<string> {
	const bus = CommandBus.instance;
	if (!bus) {
		throw new Error('CommandBus is not initialized; the Shell installs it when the host provider mounts.');
	}
	const response = await bus.publish<{ id: string }>({ name: NOTIFY, payload: { type, html } });
	const id = response.result?.data?.id;
	if (response.error || !id) {
		throw response.error ?? new Error(`${NOTIFY} returned no notice id.`);
	}
	return id;
}
