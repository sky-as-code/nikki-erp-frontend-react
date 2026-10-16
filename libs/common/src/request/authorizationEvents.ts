import { EventBus } from '../eventBus';
import { ClientErrorItem } from '../types/common';

import type { IEventBus } from '../eventBus';


/**
 * Published when any API call comes back rejected because the session is gone.
 *
 * Announced from the request layer, which every call funnels through — service methods, raw
 * `ky()` downloads such as report exports, and the token refresh alike.
 */
export const SESSION_AUTHORIZATION_ERROR_TOPIC = 'shell:session:authorization_error';

/**
 * Published when a call is refused for lack of permission, as opposed to lack of a session.
 *
 * The frontend gates what it can from the user context, but that check can only cover what a page
 * declares. When it misses — an action nobody gated, or a rule the server applies and the client
 * does not model — the server's refusal is the authority, and this is how it reaches the UI.
 */
export const PERMISSION_DENIED_TOPIC = 'shell:session:permission_denied';

/** Payload of {@link PERMISSION_DENIED_TOPIC}: the entitlements the server said were required. */
export type PermissionDeniedEvent = {
	key: string,
	message: string,
	/** Parsed out of the error's `entitlements` var; empty when the server named none. */
	entitlements: string[],
};

/**
 * Routes a refusal to the topic that decides what the user sees.
 *
 * Only an *unauthenticated* failure ends the session. A plain insufficient-permission refusal is
 * a normal answer for a user who holds some grants and not others — signing them out for it would
 * log them off the moment they opened a page containing one action they cannot perform. The
 * backend types both as `authorization`, so the key is what separates them.
 */
export function announceAuthorizationErrors(
	errors: ClientErrorItem[], bus: IEventBus | null | undefined = EventBus.instance,
): void {
	const expired = errors.find(it => ClientErrorItem.isUnauthenticatedError(it));
	if (expired) {
		bus?.publish(SESSION_AUTHORIZATION_ERROR_TOPIC, { key: expired.key });
		return;
	}
	const refused = errors.find(it => ClientErrorItem.isAuthorizationError(it));
	if (refused) {
		bus?.publish(PERMISSION_DENIED_TOPIC, {
			key: refused.key,
			message: refused.message,
			entitlements: toEntitlementList(refused.vars?.entitlements),
		} satisfies PermissionDeniedEvent);
	}
}

/** The `entitlements` var arrives as a list from the backend, but tolerate a single string. */
function toEntitlementList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map(String);
	}
	return typeof value === 'string' && value.length > 0 ? [value] : [];
}
