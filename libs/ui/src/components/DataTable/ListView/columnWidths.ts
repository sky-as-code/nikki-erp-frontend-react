import React from 'react';

import { getCellText } from '../cellValues';

import type { ColumnWidths, ResizeState, SearchData } from '../types';


export const rowNumberColumnWidth = 64;
export const defaultColumnWidth = 200;
export const minimumColumnWidth = 80;
const maximumAutoColumnWidth = 500;
const characterPixelWidth = 8;
const cellHorizontalPadding = 32;

const storagePrefix = 'ui:DataTable';

function getColWidthStorageKey(): string {
	return typeof window === 'undefined' ? '' : `${storagePrefix}:colwidths:${window.location.pathname}`;
}

function createDefaultWidths(fields: string[]): ColumnWidths {
	return Object.fromEntries(fields.map(field => [field, defaultColumnWidth]));
}

function readStoredWidths(fields: string[]): ColumnWidths {
	const fallback = createDefaultWidths(fields);
	if (typeof window === 'undefined') {
		return fallback;
	}
	const raw = window.localStorage.getItem(getColWidthStorageKey());
	if (!raw) {
		return fallback;
	}
	try {
		const parsed = JSON.parse(raw) as Record<string, number>;
		return Object.fromEntries(fields.map(field => [
			field,
			typeof parsed[field] === 'number' ? parsed[field] : defaultColumnWidth,
		]));
	}
	catch {
		return fallback;
	}
}

function writeStoredWidths(widths: ColumnWidths): void {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(getColWidthStorageKey(), JSON.stringify(widths));
	}
}

export function getColumnWidth(field: string, widths: ColumnWidths): number {
	return widths[field] ?? defaultColumnWidth;
}

export function getColumnStyle(width: number): React.CSSProperties {
	return { width, minWidth: 0, maxWidth: 'none' };
}

export function getAutoColumnWidth(field: string, searchData: SearchData): number {
	const longest = searchData.items.reduce((max, item) => {
		const value = getCellText(item, field, searchData.masked_fields);
		return Math.max(max, value.length);
	}, field.length);
	const estimated = (longest * characterPixelWidth) + cellHorizontalPadding;
	return Math.min(maximumAutoColumnWidth, Math.max(minimumColumnWidth, estimated));
}

export function useColumnWidthsState(fields: string[]) {
	const [widths, setWidths] = React.useState<ColumnWidths>({});
	const [resizing, setResizing] = React.useState<ResizeState | null>(null);

	React.useEffect(() => {
		setWidths(readStoredWidths(fields));
	}, [fields]);

	React.useEffect(() => {
		if (!resizing) {
			return undefined;
		}
		const onMove = (e: MouseEvent) => setWidths(prev => ({
			...prev,
			[resizing.field]: Math.max(minimumColumnWidth, resizing.startWidth + e.clientX - resizing.startX),
		}));
		const onUp = () => setResizing(null);
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, [resizing]);

	React.useEffect(() => {
		if (!resizing && Object.keys(widths).length > 0) {
			writeStoredWidths(widths);
		}
	}, [resizing, widths]);

	return { widths, setWidths, resizing, setResizing };
}
