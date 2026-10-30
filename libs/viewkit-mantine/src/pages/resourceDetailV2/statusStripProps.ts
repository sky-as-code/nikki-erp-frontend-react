import type { StatusOption } from '../resourceDetail/props';


/** The part of a list's `badge` field renderer the status strip needs. */
export type StatusBadgeSpec = {
	/** Status value → Mantine colour, in the order the strip shows the statuses. */
	colorMap: Record<string, string>,
	/** Translation key prefix: a status's label is `{prefix}{value}`. */
	prefix: string,
};

export type StatusStripProps = {
	allStatuses: StatusOption[],
	currentStatus: { schemaField: string },
	statusPlacement: 'firstSectionHeader',
};

/**
 * A detail page's status strip props, derived from the badge renderer its list already declares
 * for the same field: one colour map for both, so the strip's badges read like the list's. Spread
 * into `resourceDetailV2Props`; a page that wants another placement overrides `statusPlacement`
 * after the spread.
 */
export function statusStripProps(badge: StatusBadgeSpec, schemaField = 'status'): StatusStripProps {
	return {
		allStatuses: Object.entries(badge.colorMap).map(([value, color]) => ({
			value, color, label: `${badge.prefix}${value}`,
		})),
		currentStatus: { schemaField },
		statusPlacement: 'firstSectionHeader',
	};
}
