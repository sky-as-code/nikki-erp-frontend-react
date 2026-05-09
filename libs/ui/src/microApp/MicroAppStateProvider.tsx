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

function getAppStateContext(): React.Context<RegisterReducersResult> {
	if (!appStateContextValue) {
		throw new Error('MicroAppStateContext must be initialized with initMicroAppStateContext() before use');
	}
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
	const ctx = getAppStateContext();
	return (
		<ctx.Provider value={appStateContextValue!}>
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
		throw new Error('useMicroAppDispatch must be used within MicroAppStateProvider');
	}
	return ctxVal.dispatch;
};
