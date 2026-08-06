import { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';


export type MicroAppDispatchFn = ReturnType<typeof useDispatch>;

export type ReducerFn = (state: any, action: any) => any;

export type ReducerMap = Record<string, ReducerFn>;

export type RegisterReducersResult = {
	dispatch: MicroAppDispatchFn,
	selectMicroAppState: () => unknown,
	selectRootState: () => unknown,
};

export type RegisterReducerFn = (reducer: ReducerFn) => RegisterReducersResult;

type MicroAppStateContextType = RegisterReducersResult & {
};

const appStateContext = createContext<MicroAppStateContextType>(null as any);
let appStateContextValue: RegisterReducersResult | undefined;

/**
 * The context, whether or not `initMicroAppStateContext` was ever called.
 *
 * A module that keeps its state in its own store (`createModuleStore`) never calls
 * `registerReducer`, so there is nothing to initialize. Rendering must still work for
 * it — only the hooks that actually read Shell state below need to complain.
 */
function getAppStateContext(): React.Context<RegisterReducersResult> {
	return appStateContext;
}

export function initMicroAppStateContext(registerResult: RegisterReducersResult) {
	appStateContextValue = registerResult;
}

function useMicroAppStateContext(): MicroAppStateContextType {
	const ctxVal = useContext<MicroAppStateContextType>(getAppStateContext());
	return ctxVal;
}

export function useIsMicroApp(): boolean {
	if (!appStateContextValue) return false;

	const ctxVal = useContext(appStateContext);
	return Boolean(ctxVal);
}

export type MicroAppStateProviderProps = React.PropsWithChildren & {
};

export const MicroAppStateProvider: React.FC<MicroAppStateProviderProps> = ({ children }) => {
	// A module owning its state through `createModuleStore` never initializes this, and
	// renders through untouched. The hooks below are what report the missing context, and
	// only to a caller that actually tried to read Shell state.
	if (!appStateContextValue) return children;

	const ctx = getAppStateContext();
	return (
		<ctx.Provider value={appStateContextValue}>
			{children}
		</ctx.Provider>
	);
};

export type UseStateSelectorFn<TState> = <TSelected>(
	selector: ((microRootState: TState) => TSelected) | null,
) => TSelected | null;

/**
 * Auto switches to the appropriate selector based on whether the current component is a micro-app or not.
 */
export const useSmartSelector: UseStateSelectorFn<any> = (selector) => {
	if (!selector) return null;

	const microAppCtx = useContext<MicroAppStateContextType>(appStateContext);
	if (appStateContextValue && microAppCtx) {
		const appState = useSelector(microAppCtx.selectMicroAppState);
		return selector(appState);
	}
	return useSelector(selector);
};

/**
 * Invokes `selector` with this micro-app's state, which is a subset of the Shell's state.
 */
export const useMicroAppSelector: UseStateSelectorFn<any> = (selector) => {
	if (!selector) return null;

	const ctxVal = useMicroAppStateContext();
	if (!ctxVal) {
		throw new Error('useMicroAppSelector must be used within MicroAppStateProvider');
	}
	const appState = useSelector(ctxVal.selectMicroAppState);
	return selector(appState);
};

/**
 * Invokes `selector` with the Shell's root state.
 */
export const useRootSelector: UseStateSelectorFn<any> = (selector) => {
	if (!selector) return null;

	const ctxVal = useMicroAppStateContext();
	if (!ctxVal) {
		throw new Error('useRootSelector must be used within MicroAppStateProvider');
	}
	const appState = useSelector(ctxVal.selectRootState);
	return selector(appState);
};

/**
 * Dispatches an action to Shell's store.
 * Micro-apps must use this instead of useDispatch from react-redux.
 */
export const useMicroAppDispatch = (): MicroAppDispatchFn => {
	const ctxVal = useContext(getAppStateContext());
	if (!ctxVal) {
		throw new Error(
			'useMicroAppDispatch needs the Shell store, which this module never registered. '
			+ 'Call registerReducer() in init, or — preferably — use the module\'s own store '
			+ 'via createModuleStore() and useServiceLayer().',
		);
	}
	return ctxVal.dispatch;
};
