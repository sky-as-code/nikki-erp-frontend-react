import { Button, Group } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Entitlement } from '@/features/entitlements/types';


interface FormActionsSectionProps {
	selectedEntitlements: Entitlement[];
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}

export const FormActionsSection: React.FC<FormActionsSectionProps> = ({
	selectedEntitlements,
	onConfirm,
	onCancel,
	isSubmitting,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Group justify='flex-end' mt='md'>
			<Button
				variant='outline'
				onClick={onCancel}
				disabled={isSubmitting}
			>
				{translate('nikki.general.actions.cancel')}
			</Button>
			<Button
				onClick={onConfirm}
				loading={isSubmitting}
				disabled={selectedEntitlements.length === 0}
			>
				{translate('nikki.general.actions.confirm')}
			</Button>
		</Group>
	);
};

