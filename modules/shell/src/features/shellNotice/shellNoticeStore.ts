export type ShellNoticeType = 'info' | 'error';

export type ShellNotice = {
	id: string,
	type: ShellNoticeType,
	html: string,
};

export type ShellNoticeSnapshot = {
	readonly info: readonly ShellNotice[],
	readonly error: readonly ShellNotice[],
};

export type ShellNoticeStore = {
	subscribe: (listener: () => void) => () => void,
	getSnapshot: () => ShellNoticeSnapshot,
	push: (type: ShellNoticeType, html: string) => string,
	dismiss: (id: string) => void,
	pauseInfo: () => void,
	resumeInfo: () => void,
	clear: () => void,
};

export type ShellNoticeStoreOptions = {
	infoTimeoutMs?: number,
	stackCap?: number,
};

export const INFO_TIMEOUT_MS = 10_000;

/**
 * Bounds memory when a module floods the stack. Only the newest few are visible anyway, and errors
 * never time out, so without a cap a looping caller would grow the error stack forever.
 */
export const STACK_CAP = 50;

type InfoTimer = {
	remainingMs: number,
	startedAt: number,
	handle: ReturnType<typeof setTimeout> | null,
};

type StoreState = {
	snapshot: ShellNoticeSnapshot,
	timers: Map<string, InfoTimer>,
	listeners: Set<() => void>,
	paused: boolean,
	sequence: number,
};

/**
 * Transient, in-memory notices for async actions. A plain external store rather than a
 * `@storeService` slice: it owns timers, and the command handler writes to it outside React.
 */
export function createShellNoticeStore(options: ShellNoticeStoreOptions = {}): ShellNoticeStore {
	const infoTimeoutMs = options.infoTimeoutMs ?? INFO_TIMEOUT_MS;
	const stackCap = options.stackCap ?? STACK_CAP;
	const state: StoreState = {
		snapshot: { info: [], error: [] },
		timers: new Map(),
		listeners: new Set(),
		paused: false,
		sequence: 0,
	};

	const dismiss = (id: string) => removeNotice(state, id);

	return {
		subscribe: listener => {
			state.listeners.add(listener);
			return () => state.listeners.delete(listener);
		},
		getSnapshot: () => state.snapshot,
		push: (type, html) => pushNotice(state, { type, html, infoTimeoutMs, stackCap, dismiss }),
		dismiss,
		pauseInfo: () => pauseTimers(state),
		resumeInfo: () => resumeTimers(state, dismiss),
		clear: () => clearAll(state),
	};
}

type PushArgs = {
	type: ShellNoticeType,
	html: string,
	infoTimeoutMs: number,
	stackCap: number,
	dismiss: (id: string) => void,
};

function pushNotice(state: StoreState, args: PushArgs): string {
	state.sequence += 1;
	const notice: ShellNotice = { id: `shell-notice-${state.sequence}`, type: args.type, html: args.html };
	const stack = [...state.snapshot[args.type], notice];
	const dropped = stack.splice(0, Math.max(0, stack.length - args.stackCap));
	dropped.forEach(old => stopTimer(state, old.id));

	if (args.type === 'info') {
		const timer: InfoTimer = { remainingMs: args.infoTimeoutMs, startedAt: 0, handle: null };
		state.timers.set(notice.id, timer);
		if (!state.paused) startTimer(timer, notice.id, args.dismiss);
	}
	commit(state, { ...state.snapshot, [args.type]: stack });
	return notice.id;
}

function removeNotice(state: StoreState, id: string): void {
	const { info, error } = state.snapshot;
	const nextInfo = info.filter(notice => notice.id !== id);
	const nextError = error.filter(notice => notice.id !== id);
	if (nextInfo.length === info.length && nextError.length === error.length) return;

	stopTimer(state, id);
	commit(state, { info: nextInfo, error: nextError });
}

function startTimer(timer: InfoTimer, id: string, dismiss: (id: string) => void): void {
	timer.startedAt = Date.now();
	timer.handle = setTimeout(() => dismiss(id), timer.remainingMs);
}

function stopTimer(state: StoreState, id: string): void {
	const timer = state.timers.get(id);
	if (timer?.handle) clearTimeout(timer.handle);
	state.timers.delete(id);
}

function pauseTimers(state: StoreState): void {
	if (state.paused) return;
	state.paused = true;
	const now = Date.now();
	state.timers.forEach(timer => {
		if (!timer.handle) return;
		clearTimeout(timer.handle);
		timer.handle = null;
		timer.remainingMs = Math.max(0, timer.remainingMs - (now - timer.startedAt));
	});
}

function resumeTimers(state: StoreState, dismiss: (id: string) => void): void {
	if (!state.paused) return;
	state.paused = false;
	state.timers.forEach((timer, id) => startTimer(timer, id, dismiss));
}

function clearAll(state: StoreState): void {
	state.timers.forEach(timer => timer.handle && clearTimeout(timer.handle));
	state.timers.clear();
	state.paused = false;
	commit(state, { info: [], error: [] });
}

function commit(state: StoreState, snapshot: ShellNoticeSnapshot): void {
	state.snapshot = snapshot;
	state.listeners.forEach(listener => listener());
}

/** The Shell's single instance, shared by the command handler and the container. */
export const shellNoticeStore = createShellNoticeStore();
