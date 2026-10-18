import { Command, ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';

import { ShellNoticeStore, ShellNoticeType, shellNoticeStore } from './shellNoticeStore';


/**
 * Shell-owned async-action notices: transient, center-top, unrelated to the Notification module's
 * persistent inbox. Micro-apps call `showShellNotice` from `@nikkierp/common/service` instead of
 * naming this command.
 */
export const SHELL_NOTICE_COMMANDS = Object.freeze({
	NOTIFY: 'shell.shell_notice.notify',
} as const);

export type ShellNoticeNotifyPayload = {
	type: ShellNoticeType,
	/** Trusted HTML, injected as-is (see problem shell-001): callers must escape interpolated values. */
	html: string,
};

export type ShellNoticeNotifyResult = {
	id: string,
};

const NOTICE_TYPES: ReadonlySet<string> = new Set<ShellNoticeType>(['info', 'error']);

export function registerShellNoticeCommands(
	bus: ICommandBus, store: ShellNoticeStore = shellNoticeStore,
): () => void {
	const unsubscribe = bus.subscribe(SHELL_NOTICE_COMMANDS.NOTIFY, command => handleNotify(command, store));
	return () => {
		unsubscribe();
		store.clear();
	};
}

function handleNotify(command: Command, store: ShellNoticeStore): ServiceResult<ShellNoticeNotifyResult> {
	const payload = command.payload as Partial<ShellNoticeNotifyPayload> | undefined;
	// A malformed payload is a caller bug, so it throws and surfaces as `CommandBusResponse.error`.
	if (!payload?.type || !NOTICE_TYPES.has(payload.type)) {
		throw new Error(`${command.name} requires { type: 'info' | 'error' }.`);
	}
	if (typeof payload.html !== 'string' || !payload.html.trim()) {
		throw new Error(`${command.name} requires a non-empty { html }.`);
	}
	return ok({ id: store.push(payload.type, payload.html) });
}
