import { Button, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface ResourceFormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
	isCreate: boolean;
}

export const ResourceFormActions: React.FC<ResourceFormActionsProps> = ({
	isSubmitting,
	onCancel,
	isCreate,
}) => {
	const { t } = useTranslation();
	return (
		<Group mt='xl'>
			<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
				{isCreate ? t('nikki.general.actions.create') : t('nikki.general.actions.update')}
			</Button>
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{t('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

