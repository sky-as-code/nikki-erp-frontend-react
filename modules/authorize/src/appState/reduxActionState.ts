export type ReduxActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ReduxActionState<T = unknown> {
	status: ReduxActionStatus;
	error: string | null;
	data?: T;
	requestId?: string;
}

export const createInitialReduxActionState = <T>(): ReduxActionState<T> => ({
	status: 'idle',
	error: null,
});
