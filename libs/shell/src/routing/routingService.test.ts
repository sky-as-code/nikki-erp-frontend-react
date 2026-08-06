import { createEventBus } from '@nikkierp/common/eventBus';
import { readStoreMethodTag } from '@nikkierp/ui/appState/store';
import { describe, expect, it, vi } from 'vitest';

import { RoutingService, SLICE_NAME, routingService } from './routingService';
import { NavigateEventPayload, SHELL_EVENTS } from './topics';
import { shellStore } from '../appState/shellStore';

import type { RoutingState } from './types';


function state(): RoutingState {
	return shellStore.getState()[SLICE_NAME] as RoutingState;
}

function dispatch(method: unknown, params?: any) {
	const tag = readStoreMethodTag(method)!;
	return shellStore.dispatch((tag.thunk ?? tag.syncAction)!(params) as any);
}


describe('RoutingService sync state', () => {
	// Slice keys are method names, which is how `createServiceSlice` names its entries.
	it('stores the active org as a bare value, with no request envelope', () => {
		dispatch(routingService.setActiveOrg, 'acme');

		expect(state().setActiveOrg).toBe('acme');
	});

	it('normalizes undefined to null', () => {
		dispatch(routingService.setActiveOrg, undefined);

		expect(state().setActiveOrg).toBeNull();
	});

	it('stores the active module independently of the org', () => {
		dispatch(routingService.setActiveOrg, 'acme');
		dispatch(routingService.setActiveModule, 'iam');

		expect(state().setActiveOrg).toBe('acme');
		expect(state().setActiveModule).toBe('iam');
	});

	it('exposes the state under domain names via getActiveContext', () => {
		dispatch(routingService.setActiveOrg, 'acme');
		dispatch(routingService.setActiveModule, 'iam');

		expect(routingService.getActiveContext()).toMatchObject({ activeOrg: 'acme', activeModule: 'iam' });
	});

	it('tags sync methods with a syncAction, not a thunk', () => {
		// The whole point of @storeSyncMethod: no promise, no pending/rejected states.
		expect(readStoreMethodTag(routingService.setActiveOrg)?.syncAction).toBeDefined();
		expect(readStoreMethodTag(routingService.setActiveOrg)?.thunk).toBeUndefined();
	});
});


describe('RoutingService navigation events', () => {
	function withBus() {
		const bus = createEventBus();
		const handler = vi.fn();
		bus.subscribe<NavigateEventPayload>(SHELL_EVENTS.ROUTING_NAVIGATE, handler);
		return { service: new RoutingService(bus), handler };
	}

	it('publishes the requested path', async () => {
		const { service, handler } = withBus();

		await service.navigateTo({ to: '/acme/iam' });

		expect(handler).toHaveBeenCalledWith({ to: '/acme/iam', hardNavigate: false }, SHELL_EVENTS.ROUTING_NAVIGATE);
	});

	it('carries the hardNavigate flag through', async () => {
		const { service, handler } = withBus();

		await service.navigateTo({ to: '/signin', hardNavigate: true });

		expect(handler.mock.calls[0][0]).toEqual({ to: '/signin', hardNavigate: true });
	});

	it('publishes every navigation, even two to the same path in a row', async () => {
		// The old `actionUpdatedAt` timestamp collapsed same-millisecond navigations; an
		// event is delivered once per publish, so both land.
		const { service, handler } = withBus();

		await service.navigateTo({ to: '/same' });
		await service.navigateTo({ to: '/same' });

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it('appends returnTo when navigating away from the current path', async () => {
		const { service, handler } = withBus();

		await service.navigateWillReturn({ to: '/signin' });

		const payload = handler.mock.calls[0][0] as NavigateEventPayload;
		expect(payload.to).toContain('returnTo=');
	});

	it('decodes an encoded returnTo path', async () => {
		const { service, handler } = withBus();

		await service.navigateReturnTo({ to: encodeURIComponent('/acme/iam?tab=1') });

		expect((handler.mock.calls[0][0] as NavigateEventPayload).to).toBe('/acme/iam?tab=1');
	});

	it('rejects a destination with no pathname', async () => {
		const { service } = withBus();

		await expect(service.navigateWillReturn({ to: '?only=query' })).rejects.toThrow(/Invalid destination path/);
	});
});
