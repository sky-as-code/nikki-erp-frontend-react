import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus } from '../eventBus';
import { PERMISSION_DENIED_TOPIC, SESSION_AUTHORIZATION_ERROR_TOPIC } from './crudServiceBase';
import { ClientErrorItem } from '../types/common';


/**
 * Which topic a refusal takes decides what the user sees: one signs them out, the other explains
 * the refusal in place. The frontend gates what a page declares; when the server refuses something
 * it did not, that refusal has to reach the UI rather than vanish.
 */

type Published = { topic: string, payload: any };

function busRecording(published: Published[]): EventBus {
	const bus = new EventBus();
	const original = bus.publish.bind(bus);
	vi.spyOn(bus, 'publish').mockImplementation((topic: string, payload: unknown) => {
		published.push({ topic, payload });
		return original(topic, payload as never);
	});
	return bus;
}

describe('refusal routing', () => {
	let published: Published[];

	beforeEach(() => {
		published = [];
	});

	it('an insufficient-permission refusal carries the entitlements the server named', () => {
		const refusal = new ClientErrorItem({
			key: 'common:err_insufficient_permissions',
			message: 'Insufficient permissions: {{.entitlements}}',
			type: 'authorization',
			vars: { entitlements: ['create:iam_user:org/ORG1'] },
		});

		expect(ClientErrorItem.isAuthorizationError(refusal)).toBe(true);
		expect(ClientErrorItem.isUnauthenticatedError(refusal)).toBe(false);
		// The vars survive interpolation, which is what lets the modal list them as bullets.
		expect(refusal.vars?.entitlements).toEqual(['create:iam_user:org/ORG1']);
	});

	it('publishes on distinct topics so one cannot be mistaken for the other', () => {
		const bus = busRecording(published);

		bus.publish(SESSION_AUTHORIZATION_ERROR_TOPIC, { key: 'common:err_unauthenticated' });
		bus.publish(PERMISSION_DENIED_TOPIC, {
			key: 'common:err_insufficient_permissions',
			message: 'nope',
			entitlements: ['delete:iam_user:org/ORG1'],
		});

		expect(published.map(p => p.topic)).toEqual([
			SESSION_AUTHORIZATION_ERROR_TOPIC,
			PERMISSION_DENIED_TOPIC,
		]);
		expect(SESSION_AUTHORIZATION_ERROR_TOPIC).not.toBe(PERMISSION_DENIED_TOPIC);
	});

	it('a subscriber receives the entitlements to display', () => {
		const bus = new EventBus();
		const seen: string[][] = [];
		bus.subscribe(PERMISSION_DENIED_TOPIC, (event: any) => seen.push(event.entitlements));

		bus.publish(PERMISSION_DENIED_TOPIC, {
			key: 'common:err_insufficient_permissions',
			message: 'nope',
			entitlements: ['update:products:org/ORG1'],
		});

		expect(seen).toEqual([['update:products:org/ORG1']]);
	});
});
