import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	PaymentDetailContent,
	PaymentNotFound,
	usePaymentDetailPageConfig,
} from '@/features/payment/components/PaymentDetail';
import { usePaymentDetail } from '@/features/payment/hooks/usePaymentDetail';


export const PaymentDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { payment, isLoading } = usePaymentDetail(id);
	const pageConfig = usePaymentDetailPageConfig({ payment });
	const { breadcrumbs, actions, ...detailRest } = pageConfig;

	return (
		<PageContainer
			documentTitle={payment?.name ?? translate('nikki.vendingMachine.payment.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='payment-detail-actions' actions={actions} />]}
			isLoading={isLoading && !payment}
			isNotFound={!payment && !isLoading}
			notFoundContent={<PaymentNotFound />}
		>
			{payment ? <PaymentDetailContent payment={payment} {...detailRest} /> : null}
		</PageContainer>
	);
};
