import { DEFAULT_VIEW_MODE } from './types';

import type { ExcelViewMode } from './types';


const storagePrefix = 'ui:ExcelDataTable';

export const allowedPageSizes = [50, 100, 200] as const;
export type AllowedPageSize = (typeof allowedPageSizes)[number];
export const defaultPageSize: AllowedPageSize = 50;

function hasWindow(): boolean {
	return typeof window !== 'undefined';
}

/** The page size is one global preference: a user who wants 100 rows wants them everywhere. */
function pageSizeKey(): string {
	return `${storagePrefix}:pagesize`;
}

/** The view mode is remembered per page: cards suit products, not invoices. */
function viewModeKey(): string {
	return `${storagePrefix}:viewmode:${window.location.pathname}`;
}

export function parseStoredPageSize(raw: string | null): AllowedPageSize | null {
	const n = Number(raw);
	return allowedPageSizes.includes(n as AllowedPageSize) ? (n as AllowedPageSize) : null;
}

export function readStoredPageSize(): AllowedPageSize | null {
	return hasWindow() ? parseStoredPageSize(window.localStorage.getItem(pageSizeKey())) : null;
}

export function writeStoredPageSize(size: number): void {
	if (hasWindow()) {
		window.localStorage.setItem(pageSizeKey(), String(size));
	}
}

export function readStoredViewMode(): ExcelViewMode | null {
	if (!hasWindow()) {
		return null;
	}
	const raw = window.localStorage.getItem(viewModeKey());
	return raw && raw.trim() !== '' ? raw : null;
}

export function writeStoredViewMode(mode: ExcelViewMode): void {
	if (hasWindow()) {
		window.localStorage.setItem(viewModeKey(), mode);
	}
}

/** The stored mode wins only when the page still offers it; otherwise the page's initial mode. */
export function resolveInitialViewMode(initial: ExcelViewMode | undefined, allowed?: ExcelViewMode[]): ExcelViewMode {
	const stored = readStoredViewMode();
	if (stored && (!allowed || allowed.includes(stored))) {
		return stored;
	}
	return initial ?? DEFAULT_VIEW_MODE;
}
