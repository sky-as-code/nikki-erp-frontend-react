import { Command, ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';

import { AsyncNoticeStore, AsyncNoticeType, asyncNoticeStore } from './asyncNoticeStore';


/**
 * Shell-owned async-action notices: transient, center-top, unrelated to the Notification module's
 * persistent inbox. Micro-apps call `showAsyncNotice` from `@nikkierp/common/service` instead of
 * naming this command.
 */
export const ASYNC_NOTICE_COMMANDS = Object.freeze({
	NOTIFY: 'shell.async_notice.notify',
} as const);

export type AsyncNoticeNotifyPayload = {
	type: AsyncNoticeType,
	/** Trusted HTML, injected as-is (see problem shell-001): callers must escape interpolated values. */
	html: string,
};

export type AsyncNoticeNotifyResult = {
	id: string,
};

const NOTICE_TYPES: ReadonlySet<string> = new Set<AsyncNoticeType>(['info', 'error']);

export function registerAsyncNoticeCommands(
	bus: ICommandBus, store: AsyncNoticeStore = asyncNoticeStore,
): () => void {
	const unsubscribe = bus.subscribe(ASYNC_NOTICE_COMMANDS.NOTIFY, command => handleNotify(command, store));
	return () => {
		unsubscribe();
		store.clear();
	};
}

function handleNotify(command: Command, store: AsyncNoticeStore): ServiceResult<AsyncNoticeNotifyResult> {
	const payload = command.payload as Partial<AsyncNoticeNotifyPayload> | undefined;
	// A malformed payload is a caller bug, so it throws and surfaces as `CommandBusResponse.error`.
	if (!payload?.type || !NOTICE_TYPES.has(payload.type)) {
		throw new Error(`${command.name} requires { type: 'info' | 'error' }.`);
	}
	if (typeof payload.html !== 'string' || !payload.html.trim()) {
		throw new Error(`${command.name} requires a non-empty { html }.`);
	}
	return ok({ id: store.push(payload.type, payload.html) });
}
