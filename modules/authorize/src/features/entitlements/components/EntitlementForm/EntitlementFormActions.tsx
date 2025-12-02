import { Button, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface EntitlementFormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
}

export const EntitlementFormActions: React.FC<EntitlementFormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
}) => {
	const { t: translate } = useTranslation();
	return (
		<Group mt='xl'>
			<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
				{isCreate ? translate('nikki.general.actions.create') : translate('nikki.general.actions.update')}
			</Button>
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

