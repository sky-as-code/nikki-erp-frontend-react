import { useState } from 'react';

import { PaymentMethod } from '../types';
import { usePaymentDetail } from './usePaymentDetail';


export function usePaymentPreview() {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>();

	const { payment: selectedPayment, isLoading } = usePaymentDetail(selectedPaymentId);

	const handlePreview = (payment: PaymentMethod) => {
		setSelectedPaymentId(payment.id);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setSelectedPaymentId(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedPayment,
		isLoadingPreview: isLoading,
	};
}
