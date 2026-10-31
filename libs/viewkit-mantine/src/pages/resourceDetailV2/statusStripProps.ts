import type { StatusOption } from '../resourceDetail/props';


/** The statuses of a detail page's flow. */
export type StatusStripSpec = {
	/** Every status value, in the order of the flow. */
	statuses: readonly string[],
	/** Translation key prefix: a status's label is `{prefix}{value}`. */
	prefix: string,
	/** Statuses reached instead of finishing the flow (cancelled, rejected, …), shown apart from the steps. */
	alternativeEnds?: readonly string[],
};

export type StatusStripProps = {
	allStatuses: StatusOption[],
	currentStatus: { schemaField: string },
	statusPlacement: 'firstSectionHeader',
};

/**
 * A detail page's status strip props. A page that also lists the field as a badge passes the
 * badge's own order and prefix (`statuses: Object.keys(STATUS_BADGE.colorMap)`), so both read the
 * same statuses; the strip takes no colours. Spread into `resourceDetailV2Props`; a page that wants
 * another placement overrides `statusPlacement` after the spread.
 */
export function statusStripProps(spec: StatusStripSpec, schemaField = 'status'): StatusStripProps {
	const alternativeEnds = new Set(spec.alternativeEnds);
	return {
		allStatuses: spec.statuses.map(value => ({
			value,
			label: `${spec.prefix}${value}`,
			...(alternativeEnds.has(value) ? { alternativeEnd: true } : {}),
		})),
		currentStatus: { schemaField },
		statusPlacement: 'firstSectionHeader',
	};
}
