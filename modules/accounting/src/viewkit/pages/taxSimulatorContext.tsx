import React from 'react';

import { SimulatorState } from './useTaxSimulator';

import type { TaxSimulatorProps } from '../props';


/**
 * The simulator's state, shared with its registered components.
 *
 * A context rather than props threaded through the node tree, because the components are resolved
 * by id from the registry: the page never holds a reference to them, so it has nowhere to pass
 * props to. This is the same shape identity's role-assignment wizard uses.
 */
export type TaxSimulatorContextValue = {
	params: TaxSimulatorProps,
	state: SimulatorState,
};

const TaxSimulatorContext = React.createContext<TaxSimulatorContextValue | null>(null);

export function TaxSimulatorContextProvider({ value, children }: {
	value: TaxSimulatorContextValue,
	children: React.ReactNode,
}): React.ReactNode {
	return (
		<TaxSimulatorContext.Provider value={value}>
			{children}
		</TaxSimulatorContext.Provider>
	);
}

export function useTaxSimulatorContext(): TaxSimulatorContextValue {
	const value = React.useContext(TaxSimulatorContext);
	if (!value) {
		throw new Error(
			'A tax simulator component was rendered outside the simulator page. Its components are '
			+ 'registered by id and must only be placed in the simulator template\'s node tree.',
		);
	}
	return value;
}
