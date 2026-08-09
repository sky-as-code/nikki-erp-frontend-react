/**
 * `data-testid` attributes that give end-to-end automation a stable handle on every interactive
 * element. They complete the self-describing-DOM family started by the view engine's
 * `data-component` / `data-page` / `data-command`: those three name the contribution and the
 * command behind a rendered subtree, while `data-testid` names the individual leaf a test clicks
 * or types into.
 *
 * The id format is `{module}.{component}.{element}`, camelCase segments joined by dots, with an
 * optional trailing discriminator for elements that repeat (`identity.userList.row.01H8...`).
 * The discriminator must be stable across runs — a record id, field name or action command, never
 * an array index in a list that can be sorted or filtered.
 *
 * These live in `libs/common` rather than the view engine because every layer needs them: the
 * engine, `libs/ui`, view kits, and modules in both products. They are plain objects with no React
 * dependency, so a non-React caller can build an id too.
 */
export type TestIdAttributes = { 'data-testid'?: string };

/** Mix into a component's props to let its consumer namespace the ids it emits. */
export type TestIdProps = { testId?: string };

/**
 * Joins the segments of a test id, skipping the empty ones so a caller can pass an optional
 * prefix or discriminator without branching. Returns undefined when nothing is left to join.
 */
export function joinTestId(...segments: Array<string | number | undefined | null>): string | undefined {
	const kept = segments
		.filter((segment) => segment !== undefined && segment !== null && segment !== '')
		.map((segment) => String(segment));
	return kept.length > 0 ? kept.join('.') : undefined;
}

/**
 * Spread onto an interactive element. Emits nothing when the id is empty, so an element whose
 * prefix has not been threaded yet carries no misleading blank attribute — the same contract as
 * the view engine's `commandAttrs`.
 */
export function testAttrs(...segments: Array<string | number | undefined | null>): TestIdAttributes {
	const testId = joinTestId(...segments);
	return testId ? { 'data-testid': testId } : {};
}
