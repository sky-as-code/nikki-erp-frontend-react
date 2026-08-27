import { defineTemplateRef } from '@nikkierp/viewengine/metadata';
import { z } from 'zod';

import { TAX_SIMULATOR_TEMPLATE } from './ids';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * Authoring surface for the accounting kit. Deliberately React-free, like
 * `@nikkierp/viewkit-mantine/props`: a page definition is plain JSON that must survive a bundle
 * boundary, so it may not pull components in. The builder parses eagerly so a bad page fails
 * where it is authored rather than at render time.
 *
 * Every prop is a command name or a string — never a function. Metadata crosses a bundle boundary
 * and a function does not survive the trip.
 */
export const taxSimulatorPropsSchema = z.object({
	translationNs: z.string().min(1),
	/** i18n key for the page title. */
	titleKey: z.string().min(1).default('menu_taxSimulator'),

	/**
	 * Runs the pipeline and returns the trace alongside the amounts.
	 *
	 * Simulate rather than calculate: the simulator's whole purpose is the explanation, and it is
	 * gated on its own `accounting_tax:simulate` entitlement because it discloses the entire rule
	 * base rather than the outcome for one order (BR-TAX-ESS-051).
	 */
	simulateCommand: z.string().min(1),

	/** Lists taxes, to populate the candidate-tax picker. */
	taxSearchCommand: z.string().min(1),
	/** Lists jurisdictions, for the ship-from and ship-to pickers. */
	jurisdictionSearchCommand: z.string().min(1),
	/** Lists product tax classifications, which is what rules actually test. */
	classificationSearchCommand: z.string().min(1),
	/** Lists rounding policies, so the user can choose which one governs the run. */
	roundingPolicySearchCommand: z.string().min(1),

	/**
	 * Currency the simulated document is denominated in.
	 *
	 * A default rather than a picker: V1 has no FX capability, and a fixed tax quoted in another
	 * currency fails explicitly rather than converting (AC-TAX-SUP-14). Offering a free choice
	 * would invite that failure without explaining it.
	 */
	defaultCurrencyCode: z.string().min(1).default('VND'),
}).strict();

export type TaxSimulatorProps = z.infer<typeof taxSimulatorPropsSchema>;
export type TaxSimulatorPropsInput = z.input<typeof taxSimulatorPropsSchema>;

export function taxSimulatorProps(input: TaxSimulatorPropsInput): TemplateRef<TaxSimulatorProps> {
	return defineTemplateRef(TAX_SIMULATOR_TEMPLATE, taxSimulatorPropsSchema.parse(input));
}

export * from './ids';
