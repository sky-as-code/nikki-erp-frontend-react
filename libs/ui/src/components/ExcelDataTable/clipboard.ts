import { getCellText } from './cells/cellValues';

import type { RowId, SearchData } from './types';


function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function buildClipboardPayload(rows: string[][]) {
	const plainText = rows.map(row => row.join('\t')).join('\n');
	const htmlRows = rows.map(row => `<tr>${row.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`);
	return { plainText, htmlText: `<table><tbody>${htmlRows.join('')}</tbody></table>` };
}

/** The selected rows as cell text, in display order, ready to paste into a spreadsheet. */
export function rowsFromSelection(data: SearchData, order: RowId[], selectedIds: RowId[]): string[][] {
	return order
		.map((id, index) => (selectedIds.includes(id) ? data.items[index] : undefined))
		.filter((item): item is NonNullable<typeof item> => item !== undefined)
		.map(item => data.desired_fields.map(field => getCellText(item, field, data.masked_fields)));
}

export async function copyRowsToClipboard(rows: string[][]): Promise<void> {
	if (rows.length === 0) {
		return;
	}
	const { plainText, htmlText } = buildClipboardPayload(rows);
	try {
		if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
			await navigator.clipboard.write([new ClipboardItem({
				'text/plain': new Blob([plainText], { type: 'text/plain' }),
				'text/html': new Blob([htmlText], { type: 'text/html' }),
			})]);
			return;
		}
	}
	catch { /* fallback below */ }
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(plainText);
	}
}
