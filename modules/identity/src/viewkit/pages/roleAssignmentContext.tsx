import React from 'react';

import { RoleAssignmentState } from './useRoleAssignment';

import type { RoleAssignmentProps } from '../props';


/**
 * Everything the wizard's components need, in one place.
 *
 * They read it instead of taking props because behaviour cannot survive `JSON.stringify`: a
 * page node can say *that* a Save button belongs here, never *what* it saves. Page JSON carries
 * placement; this context carries data and callbacks.
 */
export type RoleAssignmentContextValue = RoleAssignmentState & {
	/** The validated page params, for the commands and namespaces the components need. */
	params: RoleAssignmentProps,
	acknowledged: boolean,
	setAcknowledged: (value: boolean) => void,
	/** Stage-aware Back: step back within the wizard, or leave it. */
	onBack: () => void,
};

const RoleAssignmentContext = React.createContext<RoleAssignmentContextValue | undefined>(undefined);

export type RoleAssignmentContextProviderProps = {
	value: RoleAssignmentContextValue,
	children: React.ReactNode,
};

export function RoleAssignmentContextProvider({
	value, children,
}: RoleAssignmentContextProviderProps): React.ReactNode {
	return <RoleAssignmentContext.Provider value={value}>{children}</RoleAssignmentContext.Provider>;
}

export function useRoleAssignmentContext(): RoleAssignmentContextValue {
	const value = React.useContext(RoleAssignmentContext);
	if (value === undefined) {
		throw new Error('useRoleAssignmentContext must be used within RoleAssignmentPage');
	}
	return value;
}
