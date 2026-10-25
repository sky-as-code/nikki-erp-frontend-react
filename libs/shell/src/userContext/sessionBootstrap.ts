import * as request from '@nikkierp/common/request';

import { seedUserContext } from './userContextService';
import { seedModules } from '../erpModules/moduleService';
import { seedEnabledLanguages } from '../languages/languageService';

import type { GetUserContextResponse } from './types';
import type { Module } from '../erpModules/types';
import type { ListEnabledLanguagesResponse } from '../languages/languageService';


/** `GET v1/iam/me/bootstrap`: what the BFF gathers from three upstream reads in one round trip. */
export type SessionBootstrapResponse = {
	context: GetUserContextResponse,
	languages: ListEnabledLanguagesResponse,
	modules: Module[],
};

/**
 * Reads what the Shell needs right after a session starts, and seeds each owner's cache with it.
 *
 * Best effort by design: on any failure nothing is seeded and every reader falls back to its own
 * single call, which also reports the refusal through the slice the UI already watches.
 */
export async function loadSessionBootstrap(): Promise<boolean> {
	try {
		const data = request.unwrapResult(await request.get<SessionBootstrapResponse>('v1/iam/me/bootstrap'));
		if (!data?.context) return false;
		seedUserContext(data.context);
		if (data.languages) seedEnabledLanguages(data.languages);
		if (Array.isArray(data.modules)) seedModules(data.modules);
		return true;
	}
	catch {
		return false;
	}
}
