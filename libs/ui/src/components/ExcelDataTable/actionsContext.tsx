import React from 'react';

import type { SearchItem } from './types';


/**
 * What an action needs from the bar it sits in: whether it is being rendered as a menu item (in
 * a `CollapsedActions` dropdown or the compact fold) and the rows it would act on.
 */
export type ActionsContextValue = {
	inMenu: boolean,
	selectedItems: SearchItem[],
};

export const ActionsContext = React.createContext<ActionsContextValue>({ inMenu: false, selectedItems: [] });

export function useActionsContext(): ActionsContextValue {
	return React.useContext(ActionsContext);
}
