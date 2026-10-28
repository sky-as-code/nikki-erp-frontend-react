import type { ResourceHistoryItem } from '@nikkierp/common/service';


export type HistoryDayGroup = {
	/** `YYYY-MM-DD` in the viewer's time zone. */
	dayKey: string,
	/** The divider's text, e.g. "Oct 9, 2026". */
	label: string,
	items: ResourceHistoryItem[],
};

/** Actions the panel words as a message of its own (`common:audit.message.{action}`). */
const MESSAGE_ACTIONS: ReadonlySet<string> = new Set([
	'create', 'update', 'delete', 'archive', 'unarchive', 'link', 'unlink', 'get', 'search',
]);

/** A creation lists every field it set and a deletion every field it held: the message says it all. */
const MESSAGE_ONLY_ACTIONS: ReadonlySet<string> = new Set(['create', 'delete', 'get', 'search']);

export type HistoryEntryContent = {
	/** `common:audit.message.*` key, or none when the change list says it alone (a plain update). */
	messageKey: string | null,
	/** A custom action code (`suspend`), named in the `custom` message. */
	customAction?: string,
	showChanges: boolean,
};

/** What one entry shows: a message ("User created"), a change list, or a custom action's name with its changes. */
export function historyEntryContent(item: ResourceHistoryItem): HistoryEntryContent {
	const hasChanges = (item.changes ?? []).length > 0;
	if (item.action === 'update' && hasChanges) {
		return { messageKey: null, showChanges: true };
	}
	if (MESSAGE_ACTIONS.has(item.action)) {
		return {
			messageKey: `audit.message.${item.action}`,
			showChanges: hasChanges && !MESSAGE_ONLY_ACTIONS.has(item.action),
		};
	}
	return { messageKey: 'audit.message.custom', customAction: item.action, showChanges: hasChanges };
}

/**
 * Splits a newest-first list into one group per calendar day, in the viewer's time zone. An entry
 * with an unreadable timestamp joins the day before it rather than opening a divider of its own.
 */
export function groupHistoryByDay(items: ResourceHistoryItem[], locale: string): HistoryDayGroup[] {
	const dayFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
	const groups: HistoryDayGroup[] = [];
	for (const item of items) {
		const date = new Date(item.created_at);
		const isValid = !Number.isNaN(date.getTime());
		const dayKey = isValid ? localDayKey(date) : (groups.at(-1)?.dayKey ?? '');
		const last = groups.at(-1);
		if (last && last.dayKey === dayKey) {
			last.items.push(item);
			continue;
		}
		groups.push({ dayKey, label: isValid ? dayFormat.format(date) : '', items: [item] });
	}
	return groups;
}

/** The time of day an entry happened, e.g. "10:32 AM"; empty for an unreadable timestamp. */
export function formatHistoryTime(createdAt: string, locale: string): string {
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

function localDayKey(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}
