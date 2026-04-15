import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { PaymentMethod } from '@/features/payment/types';


export const usePaymentDetailBreadcrumbs = ({ payment }: { payment?: PaymentMethod }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();
	const pathname = useLocation().pathname;
	const id = pathname.split('/').pop() ?? '';

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.payment.title'), href: '../payment' },
		{
			title: payment
				? payment.name || translate('nikki.vendingMachine.payment.detail.title')
				: id,
			href: '#',
		},
	], [payment, id, translate]);
};
