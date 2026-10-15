import type { Module } from './types';


/**
 * Whether a module is offered for navigation (Module Home, the header module switch).
 *
 * Access is deliberately not part of it: a module the user holds nothing in stays listed and
 * opens the No Permission page, so the user learns it exists and whom to ask.
 */
export function isListedModule(module: Pick<Module, 'has_ui' | 'is_orphaned'>, showOrphaned = false): boolean {
	return module.has_ui && (showOrphaned || !module.is_orphaned);
}
