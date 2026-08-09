import { Button, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFormActionTestAttrs } from './formTestIds';


export interface FormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
	children?: React.ReactNode;
	additionalActions?: React.ReactNode;
	showSubmit?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
	children,
	additionalActions,
	showSubmit = true,
}) => {
	const { t: translate } = useTranslation();
	const tid = useFormActionTestAttrs();

	return (
		<Group>
			{showSubmit && (
				<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting} {...tid('submit')}>
					{isCreate ? translate('nikki.general.actions.create') : translate('nikki.general.actions.update')}
				</Button>
			)}
			{additionalActions}
			{children}
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting} {...tid('cancel')}>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

