import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { PaymentDetailFormFields } from '@/features/payment/components/PaymentDetail/PaymentDetailFormFields';
import { PaymentCreateFormData, usePaymentCreate } from '@/features/payment/hooks/usePaymentCreate';
import { paymentSchema } from '@/features/payment/schemas';


const FORM_ID = 'payment-create-form';

const defaultFormValues: Partial<PaymentCreateFormData> = {
	method: 'momo',
	name: '',
	isArchived: false,
};

export const PaymentCreatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const schema = paymentSchema as ModelSchema;
	const { isSubmitting, handleCancel, handleSubmit } = usePaymentCreate();
	const { breadcrumbs, actions } = usePaymentCreatePageConfig({
		handleCancel,
		isSubmitting,
	});

	return (
		<PageContainer
			documentTitle={translate('nikki.vendingMachine.payment.title_create')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='create'
						modelSchema={schema}
						modelValue={defaultFormValues}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<>
								<form
									id={FORM_ID}
									onSubmit={formHandleSubmit((data) => handleSubmit(data as PaymentCreateFormData))}
									noValidate
									style={{ display: 'contents' }}
								/>
								<PaymentDetailFormFields mode='create' />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};


interface UsePaymentCreatePageConfigProps {
	handleCancel: () => void;
	isSubmitting: boolean;
}

function usePaymentCreatePageConfig({
	handleCancel,
	isSubmitting,
}: UsePaymentCreatePageConfigProps) {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.payment.title'), href: '../payment' },
		{ title: translate('nikki.vendingMachine.payment.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../payment'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline' as const,
		},
		{
			label: translate('nikki.general.actions.create'),
			leftSection: <IconDeviceFloppy size={16} />,
			variant: 'filled' as const,
			type: 'submit' as const,
			form: FORM_ID,
			loading: isSubmitting,
		},
		{
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
			disabled: isSubmitting,
		},
	], [translate, navigate, handleCancel, isSubmitting]);

	return { breadcrumbs, actions };
}
