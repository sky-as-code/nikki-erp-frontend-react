import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { PageContainer } from '@nikkierp/viewkit-mantine';
import { collapsibleSectionNode } from '@nikkierp/viewkit-mantine/props';
import React from 'react';

import { TaxSimulatorContextProvider } from './taxSimulatorContext';
import { useTaxSimulator } from './useTaxSimulator';
import { TAX_SIMULATOR_FORM, TAX_SIMULATOR_RESULT, TAX_SIMULATOR_TRACE } from '../ids';

import type { TaxSimulatorProps } from '../props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The Tax Simulator (BR-TAX-ESS-051).
 *
 * The page is only a shell — provider, container, and a node tree of registered components. The
 * three pieces are referenced by id and never imported into the tree, so they can be reordered or
 * overridden without editing React.
 *
 * It creates no transaction of any kind. Running it twice with the same inputs produces the same
 * answer and changes nothing (AC-TAX-35), which is what makes it safe to leave open and re-run
 * while working through a configuration problem.
 */
export function TaxSimulatorPage({ props }: { props: TaxSimulatorProps }): React.ReactNode {
	const state = useTaxSimulator(props);

	const nodes = React.useMemo(() => buildNodes(props), [props]);

	return (
		<TaxSimulatorContextProvider value={{ params: props, state }}>
			<PageContainer>
				{nodes.map(node => (
					<MetaComponent key={node.component} node={node} />
				))}
			</PageContainer>
		</TaxSimulatorContextProvider>
	);
}

/**
 * Inputs first, then the answer, then the reasoning.
 *
 * The trace sits below the result rather than above it because a user who already trusts the
 * configuration wants the number; one who does not scrolls for the explanation.
 */
function buildNodes(props: TaxSimulatorProps): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'tax.simulatorInputs', translationNs: props.translationNs, expanded: true },
			[defineComponent({ component: TAX_SIMULATOR_FORM, props: {} })],
		),
		defineComponent({ component: TAX_SIMULATOR_RESULT, props: {} }),
		defineComponent({ component: TAX_SIMULATOR_TRACE, props: {} }),
	];
}
