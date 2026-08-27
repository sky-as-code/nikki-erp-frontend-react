/**
 * Contribution ids owned by the accounting module's own view kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}`, same as the Mantine kit. The vendor is
 * `nikkierp` and so is the kit id, which is what the engine's vendor policy checks: a kit may
 * freely create ids under its own vendor, and only a *foreign* vendor is blocked from minting
 * `nikkierp.*` ids. A breaking props change ships as a new `.v2` id, never as a mutation.
 *
 * These live here rather than in `viewkit-mantine` because they are tax-specific: a simulator that
 * explains a determination pipeline is not a general-purpose page template.
 */
export const ACCOUNTING_VIEW_KIT_ID = 'nikkierp.accounting';

export const TAX_SIMULATOR_TEMPLATE = 'nikkierp.accounting.pages.templates.taxSimulator.v1';

/*
 * The simulator's own pieces. They are registered rather than composed as JSX because a page — and
 * a page template — must not import a custom component directly: everything visual resolves
 * through the registry, so it can be placed, reordered or overridden without editing React.
 */
export const TAX_SIMULATOR_FORM = 'nikkierp.accounting.components.taxSimulator.form.v1';
export const TAX_SIMULATOR_TRACE = 'nikkierp.accounting.components.taxSimulator.trace.v1';
export const TAX_SIMULATOR_RESULT = 'nikkierp.accounting.components.taxSimulator.result.v1';
