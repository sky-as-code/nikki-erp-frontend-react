import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listPayments,
	getPayment,
	createPayment,
	updatePayment,
	deletePayment,
	setArchivedPayment,
	PaymentState,
	initialPaymentState,
} from '@/features/payment/paymentSlice';


const STATE_KEY = 'payment';

export const paymentReducer = {
	[STATE_KEY]: reducer,
};

export const paymentActions = {
	listPayments,
	getPayment,
	createPayment,
	updatePayment,
	deletePayment,
	setArchivedPayment,
	...actions,
};

export const selectPaymentState =
	(state: { [STATE_KEY]?: PaymentState }) => state?.[STATE_KEY] ?? initialPaymentState;

export const selectPaymentList = createSelector(
	selectPaymentState,
	(state) => state.list,
);

export const selectPaymentDetail = createSelector(
	selectPaymentState,
	(state) => state.detail,
);

export const selectCreatePayment = createSelector(
	selectPaymentState,
	(state) => state.create,
);

export const selectUpdatePayment = createSelector(
	selectPaymentState,
	(state) => state.update,
);

export const selectDeletePayment = createSelector(
	selectPaymentState,
	(state) => state.delete,
);

export const selectSetArchivedPayment = createSelector(
	selectPaymentState,
	(state) => state.archive,
);
