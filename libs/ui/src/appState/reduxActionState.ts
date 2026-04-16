export type ReduxActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ReduxActionState<T =  any> {
	status: ReduxActionStatus;
	error: string | null;
	data?: T;
	requestId?: string | null;
}

export const baseReduxActionState : ReduxActionState = {
	status: 'idle',
	error: null,
};
