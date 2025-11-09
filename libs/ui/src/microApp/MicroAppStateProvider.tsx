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

let appStateContextValue: RegisterReducersResult;
let appStateContext: React.Context<RegisterReducersResult>;

export function initMicroAppStateContext(registerResult: RegisterReducersResult) {
	appStateContext = createContext<MicroAppStateContextType>(registerResult);
	appStateContextValue = registerResult;
}

function useMicroAppStateContext(): MicroAppStateContextType {
	if (!appStateContext) {
		throw new Error('MicroAppStateContext must be initialized with initMicroAppStateContext() before use');
	}
	const ctxVal = useContext<MicroAppStateContextType>(appStateContext);
	return ctxVal;
}

export function useIsMicroApp(): boolean {
	if (!appStateContext) return false;

	const ctxVal = useContext(appStateContext);
	return Boolean(ctxVal);
}

export type MicroAppStateProviderProps = React.PropsWithChildren & {
};

export const MicroAppStateProvider: React.FC<MicroAppStateProviderProps> = ({ children }) => {
	return (
		<appStateContext.Provider value={appStateContextValue}>
			{children}
		</appStateContext.Provider>
	);
};

export type UseStateSelectorFn<T> = <K extends keyof T>(selector: (microRootState: T) => T[K]) => T[K];

/**
 * Invokes `selector` with this micro-app's state, which is a subset of the Shell's state.
 */
export const useMicroAppSelector: UseStateSelectorFn<any> = (selector) => {
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
	const ctxVal = useContext(appStateContext);
	if (!ctxVal) {
		throw new Error('useAppDispatch must be used within MicroAppStateProvider');
	}
	return ctxVal.dispatch;
};
