import { useStateSelector, UseStateSelectorFn } from '@nikkierp/ui/stateManagement';

import { actions, EssentialState } from './essentialSlice';


export { actions, reducer } from './essentialSlice';

actions.setModules([1, 2, 3]);

export const useMicroStateSelector: UseStateSelectorFn<EssentialState> = useStateSelector;
