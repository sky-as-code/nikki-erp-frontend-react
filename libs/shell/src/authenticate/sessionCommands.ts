import { ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';

import { getSessionExpiresAt, isAuthenticated } from './authService';


/**
 * Shell-owned session commands.
 *
 * Read-only by design, plus sign-out. `sign_in` and `refresh` are deliberately absent:
 * authentication is the Shell's own flow, and exposing it would let a module drive it.
 */
export const SESSION_COMMANDS = Object.freeze({
	IS_AUTHENTICATED: 'shell.session.is_authenticated',
	GET_EXPIRES_AT: 'shell.session.get_expires_at',
} as const);

export function registerSessionCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(SESSION_COMMANDS.IS_AUTHENTICATED, () => handleIsAuthenticated()),
		bus.subscribe(SESSION_COMMANDS.GET_EXPIRES_AT, () => handleGetExpiresAt()),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function handleIsAuthenticated(): ServiceResult<boolean> {
	return ok(isAuthenticated());
}

function handleGetExpiresAt(): ServiceResult<string | null> {
	return ok(getSessionExpiresAt()?.toISOString() ?? null);
}
