import { Button, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface FormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
	children?: React.ReactNode;
	additionalActions?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
	children,
	additionalActions,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Group>
			<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
				{isCreate ? translate('nikki.general.actions.create') : translate('nikki.general.actions.update')}
			</Button>
			{additionalActions}
			{children}
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

