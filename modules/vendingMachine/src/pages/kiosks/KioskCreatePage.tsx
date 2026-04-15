import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { KioskFormFields, kioskCreateSchema, useKioskCreate } from '@/features/kiosks';
import { KioskMode, UIMode } from '@/features/kiosks/types';


const FORM_ID = 'kiosk-create-form';

const defaultFormValues = {
	mode: KioskMode.PENDING,
	uiMode: UIMode.NORMAL,
	paymentRefs: [] as string[],
};

interface UseKioskCreatePageConfigProps {
	handleCancel: () => void;
	isSubmitting: boolean;
}

interface UseKioskCreatePageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
}

function useKioskCreatePageConfig({ handleCancel, isSubmitting }:
UseKioskCreatePageConfigProps): UseKioskCreatePageConfigReturn {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: translate('nikki.vendingMachine.kiosk.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosks'),
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

export const KioskCreatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const schema = kioskCreateSchema as ModelSchema;

	const { isSubmitting, handleCancel, handleSubmit } = useKioskCreate();
	const { breadcrumbs, actions } = useKioskCreatePageConfig({ handleCancel, isSubmitting });

	return (
		<PageContainer
			documentTitle={translate('nikki.vendingMachine.kiosk.title_create')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelValue={defaultFormValues} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form
								id={FORM_ID}
								onSubmit={formHandleSubmit((data) => handleSubmit(data))}
								noValidate
								style={{ display: 'contents' }}
							>
								<KioskFormFields key='kiosk-form-fields' mode='create' />
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};
