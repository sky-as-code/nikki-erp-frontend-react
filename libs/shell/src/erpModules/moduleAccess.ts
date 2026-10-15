import { canAccessModule } from '@nikkierp/common/entitlements';
import { useCallback } from 'react';

import { useEntitlementContext } from '../userContext/entitlements';

import type { Module } from './types';


/** Settings only hosts other modules' settings widgets, and each widget checks its own permissions. */
const ALWAYS_ACCESSIBLE_MODULES: readonly string[] = ['settings'];

export type ModuleAccess = {
	/** The user context has not loaded yet; nothing can be decided. */
	isPending: boolean,
	canAccess: (module: Pick<Module, 'name' | 'model_prefix'>) => boolean,
};

/** What the UI shows. The backend still refuses every request the user is not entitled to. */
export function useModuleAccess(): ModuleAccess {
	const context = useEntitlementContext();

	const canAccess = useCallback((module: Pick<Module, 'name' | 'model_prefix'>) => {
		if (ALWAYS_ACCESSIBLE_MODULES.includes(module.name)) {
			return true;
		}
		if (!context) {
			return false;
		}
		return canAccessModule(module.model_prefix || module.name, context);
	}, [context]);

	return { isPending: context == null, canAccess };
}
