import { canAccessModule } from '@nikkierp/common/entitlements';
import { useCallback } from 'react';

import { useEntitlementContext } from '../userContext/entitlements';

import type { Module } from './types';


/** Settings only hosts other modules' settings widgets, and each widget checks its own permissions. */
const ALWAYS_ACCESSIBLE_MODULES: readonly string[] = ['settings'];

export type ModuleAccess = {
	/** The user context has not loaded yet; nothing can be decided. */
	isPending: boolean,
	canAccess: (module: Pick<Module, 'name' | 'model_prefixes'>) => boolean,
};

/** What the UI shows. The backend still refuses every request the user is not entitled to. */
export function useModuleAccess(): ModuleAccess {
	const context = useEntitlementContext();

	const canAccess = useCallback((module: Pick<Module, 'name' | 'model_prefixes'>) => {
		if (ALWAYS_ACCESSIBLE_MODULES.includes(module.name)) {
			return true;
		}
		if (!context) {
			return false;
		}
		const prefixes = module.model_prefixes?.length ? module.model_prefixes : module.name;
		return canAccessModule(prefixes, context);
	}, [context]);

	return { isPending: context == null, canAccess };
}
