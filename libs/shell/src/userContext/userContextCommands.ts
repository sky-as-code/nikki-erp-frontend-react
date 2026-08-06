import { Command, ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';
import { dispatchServiceMethod } from '@nikkierp/ui/appState/store';

import { LocalSettings, SLICE_NAME, UserContext, UserContextOrg } from './types';
import { userContextService } from './userContextService';
import { shellStore } from '../appState/shellStore';
import { routingService } from '../routing/routingService';


/** Shell-owned user-context commands. */
export const USER_CONTEXT_COMMANDS = Object.freeze({
	GET: 'shell.user_context.get',
	GET_ACTIVE_ORG: 'shell.user_context.get_active_org',
	GET_LOCAL_SETTINGS: 'shell.user_context.get_local_settings',
	SET_LOCAL_SETTINGS: 'shell.user_context.set_local_settings',
} as const);

export function registerUserContextCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(USER_CONTEXT_COMMANDS.GET, () => handleGet()),
		bus.subscribe(USER_CONTEXT_COMMANDS.GET_ACTIVE_ORG, () => handleGetActiveOrg()),
		bus.subscribe(USER_CONTEXT_COMMANDS.GET_LOCAL_SETTINGS, () => handleGetLocalSettings()),
		bus.subscribe(USER_CONTEXT_COMMANDS.SET_LOCAL_SETTINGS, cmd => handleSetLocalSettings(cmd)),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/** Reads what is already loaded rather than refetching; the Shell owns the fetch. */
function readSlice(): any {
	return shellStore.getState()[SLICE_NAME];
}

function handleGet(): ServiceResult<UserContext | null> {
	return ok(readSlice()?.getUserContext?.data ?? null);
}

function handleGetActiveOrg(): ServiceResult<UserContextOrg | null> {
	const { activeOrg } = routingService.getActiveContext();
	const orgs = (readSlice()?.getUserContext?.data?.orgs ?? []) as UserContextOrg[];
	return ok(orgs.find(org => org.slug === activeOrg) ?? null);
}

function handleGetLocalSettings(): ServiceResult<LocalSettings | null> {
	return ok(readSlice()?.setLocalSettings?.data ?? null);
}

/**
 * Dispatched rather than called: `handleGetLocalSettings` above answers from the slice,
 * so a direct call would leave a caller reading back the value it just wrote as stale.
 */
async function handleSetLocalSettings(command: Command): Promise<ServiceResult<LocalSettings>> {
	const payload = command.payload as LocalSettings | undefined;
	if (!payload) {
		throw new Error(`${USER_CONTEXT_COMMANDS.SET_LOCAL_SETTINGS} requires { languageCode, themeMode }.`);
	}
	return ok(await dispatchServiceMethod<LocalSettings>(userContextService.setLocalSettings, payload));
}
