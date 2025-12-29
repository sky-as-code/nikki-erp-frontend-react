import { Button, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface RevokeRequestFormActionsProps {
	isSubmitting: boolean;
	onCancel: () => void;
}

export const RevokeRequestFormActions: React.FC<RevokeRequestFormActionsProps> = ({
	isSubmitting,
	onCancel,
}) => {
	const { t } = useTranslation();
	return (
		<Group>
			<Button type='submit' leftSection={<IconCheck size={16} />} loading={isSubmitting}>
				{t('nikki.general.actions.create')}
			</Button>
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{t('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

