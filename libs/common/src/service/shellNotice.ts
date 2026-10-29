import { CommandBus } from '../commandBus';
import { EventBus } from '../eventBus';
import { ClientErrorItem, translateClientError } from '../types';
import { escapeHtml } from '../utils/string';

import type { IEventBus } from '../eventBus';
import type { ClientErrorTranslator } from '../types';


/**
 * Command the Shell serves to show an async-action notice.
 *
 * A literal rather than an import: the Shell owns the name, and `common` must not take a
 * compile-time dependency on the shell implementation to read it.
 */
const NOTIFY = 'shell.shell_notice.notify';

export type ShellNoticeType = 'info' | 'error';

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
export async function showShellNotice(type: ShellNoticeType, html: string): Promise<string> {
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

/**
 * Sends every client error to the Shell Notice stack as an `error` notice, translated and escaped
 * (problem shell-001). Authorization errors are skipped: the request layer already shows the
 * locked-feature modal for them, and a notice on top would repeat it.
 */
export function notifyClientErrors(t: ClientErrorTranslator, errors: ClientErrorItem[]): void {
	for (const item of errors) {
		if (ClientErrorItem.isAuthorizationError(item)) {
			continue;
		}
		showShellNotice('error', escapeHtml(translateClientError(t, item))).catch((error: unknown) => {
			console.error('Failed to show the Shell Notice', error);
		});
	}
}

/**
 * Published to open the error modal the Shell mounts once (`ServerErrorModalHost` in
 * `@nikkierp/ui/components`), the same way `PERMISSION_DENIED_TOPIC` opens the locked-feature one.
 */
export const CLIENT_ERROR_MODAL_TOPIC = 'shell:client_error:modal';

/** Payload of {@link CLIENT_ERROR_MODAL_TOPIC}: messages already translated by the caller. */
export type ClientErrorModalEvent = {
	messages: string[],
};

/**
 * Shows server rejections that have no input to land on — an empty `field`, or a field the form
 * does not show — in a modal, translated with the caller's namespaces. Authorization errors are
 * skipped, as in {@link notifyClientErrors}: the locked-feature modal already explains them.
 */
export function showClientErrorModal(
	t: ClientErrorTranslator, errors: ClientErrorItem[], bus: IEventBus | null | undefined = EventBus.instance,
): void {
	const messages = errors
		.filter(item => !ClientErrorItem.isAuthorizationError(item))
		.map(item => translateClientError(t, item))
		.filter(message => message.trim() !== '');
	if (messages.length > 0) {
		bus?.publish(CLIENT_ERROR_MODAL_TOPIC, { messages } satisfies ClientErrorModalEvent);
	}
}
