// authErrorListener.ts
import { ClientErrors } from '@nikkierp/common/types';
import { actions as routingActions } from '@nikkierp/ui/appState/routingSlice';
import { createListenerMiddleware, isRejectedWithValue } from '@reduxjs/toolkit';


export const authorizationErrorListener = createListenerMiddleware();

authorizationErrorListener.startListening({
	matcher: isRejectedWithValue,
	effect: async (action, api) => {
		if (! (action.payload instanceof ClientErrors)) {
			return;
		}
		const payload = action.payload;

		for (const item of payload.items) {
			if (item.key === 'authorize.err_invalid_access_token') {
				api.dispatch(routingActions.navigateTo('/signin'));
				return;
			}
		}
	},
});