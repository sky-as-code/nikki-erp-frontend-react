import { createContext, useContext } from 'react';
import { useDispatch, useSelector} from 'react-redux';


export type StateDispatchFn = ReturnType<typeof useDispatch>;

export type ReducerFn = (state: any, action: any) => any;

export type ReducerMap = Record<string, ReducerFn>;

export type RegisterReducersResult = {
	dispatch: StateDispatchFn,
	selectMicroAppState: () => unknown,
	selectRootState: () => unknown,
};

export type RegisterReducerFn = (reducer: ReducerFn) => RegisterReducersResult;

export type AppStateContextType = RegisterReducersResult & {
};

let appStateContextValue: RegisterReducersResult;
let appStateContext: React.Context<RegisterReducersResult>;
// const appStateContext = createContext<AppStateContextType>({} as any);

export function initAppStateContext(registerResult: RegisterReducersResult) {
	appStateContext = createContext<RegisterReducersResult>(registerResult);
	appStateContextValue = registerResult;
}

function useAppStateContext() {
	if (!appStateContext) {
		throw new Error('AppStateContext must be initialized with initAppStateContext() before use');
	}
	const ctxVal = useContext(appStateContext);
	return ctxVal;
}

export type AppStateProviderProps = React.PropsWithChildren & {
};

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
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
	const ctxVal = useAppStateContext();
	if (!ctxVal) {
		throw new Error('useMicroAppSelector must be used within AppStateProvider');
	}
	const appState = useSelector(ctxVal.selectMicroAppState);
	return selector(appState);
};

/**
 * Invokes `selector` with the Shell's root state.
 */
export const useRootSelector: UseStateSelectorFn<any> = (selector) => {
	const ctxVal = useAppStateContext();
	if (!ctxVal) {
		throw new Error('useRootSelector must be used within AppStateProvider');
	}
	const appState = useSelector(ctxVal.selectMicroAppState);
	return selector(appState);
};

/**
 * Dispatches an action to Shell's store.
 * Use this instead of useDispatch from react-redux.
 */
export const useStateDispatch = (): StateDispatchFn => {
	const ctxVal = useContext(appStateContext);
	if (!ctxVal) {
		throw new Error('useAppDispatch must be used within AppStateProvider');
	}
	return ctxVal.dispatch;
};
