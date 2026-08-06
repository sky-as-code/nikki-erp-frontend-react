import { EventBus, IEventBus } from '@nikkierp/common/eventBus';
import { storeService, storeSyncMethod } from '@nikkierp/ui/appState/store';
import { parsePath } from 'react-router';

import { NavigateEventPayload, SHELL_EVENTS } from './topics';
import { ActiveRoutingContext, RoutingState } from './types';
import { shellStore } from '../appState/shellStore';


export const SLICE_NAME = 'routing';

/**
 * The parts of the current URL the Shell keeps in state.
 *
 * Guards `window` rather than assuming it: this module is imported at decoration time,
 * which happens in Node tests and anywhere else outside a browser. Reading the location
 * eagerly at import is exactly what made the old `routingSlice` unloadable outside one.
 */
function getActualPath() {
	if (typeof window === 'undefined') {
		return { currentPath: '/', search: '', returnTo: null as string | null };
	}
	const { pathname, search, hash } = window.location;
	// Parse with react-router's own logic so the pathname matches what it would produce.
	const parsed = parsePath(`${pathname}${search}${hash}`);
	const queryParams = new URLSearchParams(parsed.search || '');
	const returnTo = queryParams.get('returnTo');
	return {
		currentPath: parsed.pathname || '/',
		search: parsed.search ?? '',
		returnTo: returnTo ? decodeURIComponent(returnTo) : null,
	};
}

/**
 * Seeds the slice from the URL the app was opened at.
 *
 * Keyed by method name, which is how `createServiceSlice` names its state entries.
 */
function buildInitialRoutingState(): RoutingState {
	const actual = getActualPath();
	return {
		resetCurrentPath: actual.currentPath,
		setReturnTo: actual.returnTo,
		setActiveOrg: null,
		setActiveModule: null,
	};
}

export type NavigateParams = {
	to: string,
	hardNavigate?: boolean,
};

/**
 * The Shell's routing state, and the navigation intents that act on it.
 *
 * Two different natures, deliberately handled differently:
 *
 * - **State** (`currentPath`, `returnTo`, `activeOrg`, `activeModule`) is read
 *   synchronously during render by many components, so it lives in the slice. The event
 *   bus would be wrong here: it has no replay, so a late subscriber would see nothing.
 * - **Navigation intent** is a one-shot notification and is published on the event bus.
 *   It used to be modelled as slice state (`action` + `actionUpdatedAt` as a `Date.now()`
 *   sequence number) which a `useEffect` polled — that collapsed two navigations landing
 *   in the same millisecond, and left the consumed command sitting in state forever.
 *
 * The navigate methods are `async` on purpose: `EventBus.publish` is synchronous, and an
 * async method keeps `navigate()` off the render path.
 */
@storeService(SLICE_NAME, shellStore, { initialState: buildInitialRoutingState() })
export class RoutingService {
	readonly #eventBus?: IEventBus;

	public constructor(eventBus?: IEventBus) {
		this.#eventBus = eventBus;
	}

	@storeSyncMethod
	public resetCurrentPath(): string {
		return getActualPath().currentPath;
	}

	@storeSyncMethod
	public setReturnTo(returnTo: string | null): string | null {
		return returnTo;
	}

	@storeSyncMethod
	public setActiveOrg(slug: string | undefined | null): string | null {
		return slug ?? null;
	}

	@storeSyncMethod
	public setActiveModule(slug: string | undefined | null): string | null {
		return slug ?? null;
	}

	/** Navigates to `to`, which is taken literally. */
	public async navigateTo(params: NavigateParams): Promise<void> {
		this.#publishNavigate({ to: params.to, hardNavigate: params.hardNavigate ?? false });
	}

	/**
	 * Navigates to `to` and records where to come back to, as a `returnTo` query param.
	 *
	 * Going deeper into the same route hierarchy preserves the existing `returnTo` rather
	 * than overwriting it, so a multi-step flow still returns to where it began.
	 */
	public async navigateWillReturn(params: NavigateParams): Promise<void> {
		const actual = getActualPath();
		const destPath = parsePath(params.to);
		if (!destPath.pathname) {
			throw new Error('Invalid destination path');
		}

		const isSameOrSubPath = destPath.pathname === actual.currentPath
			|| (actual.currentPath !== '/' && destPath.pathname.startsWith(`${actual.currentPath}/`));
		const returnTo = isSameOrSubPath
			? actual.returnTo ?? '/'
			: `${actual.currentPath}${actual.search}`;

		const searchParams = new URLSearchParams(destPath.search || '');
		searchParams.set('returnTo', encodeURIComponent(returnTo));

		this.#publishNavigate({
			to: `${destPath.pathname}?${searchParams.toString()}`,
			hardNavigate: params.hardNavigate ?? false,
		});
	}

	/** Navigates to a URL-encoded path, as carried by a `returnTo` param. */
	public async navigateReturnTo(params: NavigateParams): Promise<void> {
		this.#publishNavigate({
			to: decodeURIComponent(params.to ?? '/'),
			hardNavigate: params.hardNavigate ?? false,
		});
	}

	/** The routing state as it stands, for a command-bus caller that cannot select it. */
	public getActiveContext(): ActiveRoutingContext {
		const state = shellStore.getState()[SLICE_NAME] as RoutingState | undefined;
		return {
			currentPath: state?.resetCurrentPath ?? '/',
			returnTo: state?.setReturnTo ?? null,
			activeOrg: state?.setActiveOrg ?? null,
			activeModule: state?.setActiveModule ?? null,
		};
	}

	#publishNavigate(payload: NavigateEventPayload): void {
		const bus = this.#eventBus ?? EventBus.instance;
		bus?.publish(SHELL_EVENTS.ROUTING_NAVIGATE, payload);
	}
}

export const routingService = new RoutingService();
