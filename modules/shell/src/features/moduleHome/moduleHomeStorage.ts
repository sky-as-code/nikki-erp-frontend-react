import { DEFAULT_FILTERS, GroupByOption, ModuleViewMode } from './moduleHomeModel';


export const MODULE_HOME_STORAGE_KEY = 'shell:moduleHome';

export type ModuleHomePrefs = {
	viewMode: ModuleViewMode,
	groupBy: GroupByOption,
};

export const DEFAULT_MODULE_HOME_PREFS: ModuleHomePrefs = { viewMode: 'list', groupBy: DEFAULT_FILTERS.groupBy };

const VIEW_MODES: readonly ModuleViewMode[] = ['list', 'grid'];
const GROUP_BY_OPTIONS: readonly GroupByOption[] = ['none', 'category'];


/**
 * Each field is checked on its own, so a value left by an older release, or edited by hand, costs
 * only that field its default.
 */
export function loadModuleHomePrefs(): ModuleHomePrefs {
	const stored = readStored();
	return {
		viewMode: pick(stored?.viewMode, VIEW_MODES, DEFAULT_MODULE_HOME_PREFS.viewMode),
		groupBy: pick(stored?.groupBy, GROUP_BY_OPTIONS, DEFAULT_MODULE_HOME_PREFS.groupBy),
	};
}

export function saveModuleHomePrefs(prefs: ModuleHomePrefs): void {
	try {
		localStorage.setItem(MODULE_HOME_STORAGE_KEY, JSON.stringify(prefs));
	}
	catch {
		// Storage absent, full or blocked: the preference simply is not remembered.
	}
}

function readStored(): Record<string, unknown> | null {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(MODULE_HOME_STORAGE_KEY) ?? 'null');
		return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
	}
	catch {
		return null;
	}
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
	return allowed.includes(value as T) ? value as T : fallback;
}
