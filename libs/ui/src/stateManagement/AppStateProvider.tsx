import { createContext, useContext } from 'react';
import { useDispatch, useSelector} from 'react-redux';


export type StateDispatchFn = ReturnType<typeof useDispatch>;

export type ReducerFn = (state: any, action: any) => any;

export type ReducerMap = Record<string, ReducerFn>;

export type RegisterReducersResult = {
	dispatch: StateDispatchFn,
	selectState: () => unknown,
};

export type RegisterReducerFn = (reducer: ReducerFn) => RegisterReducersResult;

export type AppStateContextType = RegisterReducersResult & {
};

const appStateContext = createContext<AppStateContextType>({} as any);

export type AppStateProviderProps = React.PropsWithChildren & {
	registerResult: RegisterReducersResult;
};

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children, registerResult }) => {
	return (
		<appStateContext.Provider value={registerResult}>
			{children}
		</appStateContext.Provider>
	);
};

export type UseStateSelectorFn<T> = <K extends keyof T>(selector: (microRootState: T) => T[K]) => T[K];

/**
 * Invokes `selector` with this micro-app's state, which is a subset of the Shell's state.
 * Use this instead of useSelector from react-redux, because micro-app doesn't have direct access to Shell's root state.
 */
export const useStateSelector: UseStateSelectorFn<any> = (selector) => {
	const ctxVal = useContext(appStateContext);
	if (!ctxVal) {
		throw new Error('useAppSelector must be used within AppStateProvider');
	}
	const appState = useSelector(ctxVal.selectState);
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
