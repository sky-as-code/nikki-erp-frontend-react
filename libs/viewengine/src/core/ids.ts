/**
 * Contribution ids are `{vendor}.{kit}.{kind}.{name}.v{major}`, e.g.
 *   `nikkierp.mantine.pages.templates.resourceList.v1`
 *   `acme.crm.components.dealPipeline.v1`
 *
 * The engine parses only `{vendor}` (segment 0) to apply the conflict policy;
 * everything after it is opaque. Ids are compared verbatim -- no normalization,
 * no aliasing. A breaking props change means a new id ending in `.v2`, never a
 * mutation of the `.v1` schema.
 */
export type ContributionId = string;

/** Vendor prefix reserved for first-party contributions. */
export const RESERVED_VENDOR = 'nikkierp';

export function vendorOf(id: ContributionId): string {
	return id.split('.')[0] ?? '';
}
