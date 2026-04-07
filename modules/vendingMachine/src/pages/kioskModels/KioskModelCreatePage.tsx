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
import { KioskModelFormFields, kioskModelCreateSchema, useKioskModelCreate } from '@/features/kioskModels';


const FORM_ID = 'kiosk-model-create-form';

const defaultFormValues = {
	status: 'active' as const,
};

export const KioskModelCreatePage: React.FC = () => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const schema = kioskModelCreateSchema as ModelSchema;
	const { isSubmitting, handleCancel, handleSubmit } = useKioskModelCreate();

	React.useEffect(() => {
		document.title = translate('nikki.vendingMachine.kioskModels.title_create');
	}, [translate]);

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '../kiosk-models' },
		{ title: translate('nikki.vendingMachine.kioskModels.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosk-models'),
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

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelValue={defaultFormValues} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<>
								<form
									id={FORM_ID}
									onSubmit={formHandleSubmit((data) => handleSubmit(data))}
									noValidate
									style={{ display: 'contents' }}
								/>
								<KioskModelFormFields key='kiosk-model-form-fields' mode='create' />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};
