import { read, utils } from 'xlsx';


/** Client-side copy of the backend defaults (`CORE.IMPORT.*`); the server is the authority. */
export const IMPORT_ACCEPTED_EXTENSIONS = ['xlsx', 'csv'] as const;
export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;
export const IMPORT_PREVIEW_ROWS = 5;

export type ParsedHeaders = {
	headers: string[],
	/** The first data rows, padded to the header width, for a tooltip or a preview. */
	preview: string[][],
	rowCount: number,
};

/** Translation key suffix (`import.*`) naming why a file is refused before upload, or null. */
export type FileRefusal = 'unsupportedFile' | 'fileTooLarge' | null;

export function fileExtension(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

export function validateImportFile(file: { name: string, size: number }, maxBytes = IMPORT_MAX_BYTES): FileRefusal {
	if (!(IMPORT_ACCEPTED_EXTENSIONS as readonly string[]).includes(fileExtension(file.name))) {
		return 'unsupportedFile';
	}
	if (file.size > maxBytes) {
		return 'fileTooLarge';
	}
	return null;
}

/**
 * Reads the header row (and a few preview rows) of the first sheet. Only the browser-side half of
 * the parse: the server re-reads the whole file, so this needs to be right about headers, not
 * about every cell.
 */
export async function parseHeaders(file: File): Promise<ParsedHeaders> {
	const buffer = await file.arrayBuffer();
	return parseHeadersFromData(buffer);
}

/** Same as {@link parseHeaders} over raw bytes (xlsx) or text (csv), for callers without a File. */
export function parseHeadersFromData(data: ArrayBuffer | string): ParsedHeaders {
	const workbook = typeof data === 'string'
		? read(data, { type: 'string', raw: true })
		: read(data, { type: 'array', raw: false, cellDates: false });
	const sheetName = workbook.SheetNames[0];
	if (!sheetName) {
		return { headers: [], preview: [], rowCount: 0 };
	}
	const rows = utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
		header: 1, blankrows: false, raw: false, defval: '',
	});
	return tableFromRows(rows.map(row => row.map(cellText)));
}

/**
 * Mirrors the backend's `tabular` package: the first non-empty row is the header, trailing empty
 * header cells are dropped, inner whitespace is collapsed, and every row is fitted to the width.
 */
export function tableFromRows(rows: string[][]): ParsedHeaders {
	const headerIndex = rows.findIndex(row => row.some(cell => cell.trim() !== ''));
	if (headerIndex < 0) {
		return { headers: [], preview: [], rowCount: 0 };
	}
	const headers = trimTrailingEmpty(rows[headerIndex].map(normalizeHeader));
	const dataRows = rows.slice(headerIndex + 1).filter(row => row.some(cell => cell.trim() !== ''));
	const preview = dataRows.slice(0, IMPORT_PREVIEW_ROWS).map(row => fitRow(row, headers.length));
	return { headers, preview, rowCount: dataRows.length };
}

export function normalizeHeader(cell: string): string {
	return cell.split(/\s+/u).filter(Boolean).join(' ');
}

function cellText(cell: unknown): string {
	if (cell === null || cell === undefined) {
		return '';
	}
	return String(cell);
}

function trimTrailingEmpty(cells: string[]): string[] {
	let end = cells.length;
	while (end > 0 && cells[end - 1] === '') {
		end -= 1;
	}
	return cells.slice(0, end);
}

function fitRow(row: string[], width: number): string[] {
	const fitted = new Array<string>(width).fill('');
	for (let i = 0; i < width && i < row.length; i += 1) {
		fitted[i] = row[i].trim();
	}
	return fitted;
}
