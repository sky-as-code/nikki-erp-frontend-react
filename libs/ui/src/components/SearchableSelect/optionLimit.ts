/** How many options a `SearchableSelect` fetches and shows unless told otherwise. */
export const DEFAULT_MAX_OPTIONS = 10;

/** The backend's `MODEL_RULE_PAGE_MAX_SIZE`: the most an "unlimited" select can fetch in one search. */
const MAX_SEARCH_PAGE_SIZE = 500;

/**
 * The page size a caller fetching a select's options should request for its `maxOptions`; `0`
 * (unlimited) asks for as much as one search returns.
 */
export function searchPageSize(maxOptions: number = DEFAULT_MAX_OPTIONS): number {
	return maxOptions > 0 ? maxOptions : MAX_SEARCH_PAGE_SIZE;
}

/**
 * The first `maxOptions` items, `0` meaning all of them. The selected item is kept even past the
 * cut, in place of the last one: a field must always be able to show its own value.
 */
export function limitOptions<TItem extends { value: string }>(
	items: TItem[], maxOptions: number, selectedValue?: string | null,
): TItem[] {
	if (maxOptions <= 0 || items.length <= maxOptions) {
		return items;
	}
	const head = items.slice(0, maxOptions);
	if (!selectedValue || head.some(item => item.value === selectedValue)) {
		return head;
	}
	const selected = items.find(item => item.value === selectedValue);
	return selected ? [...head.slice(0, maxOptions - 1), selected] : head;
}
