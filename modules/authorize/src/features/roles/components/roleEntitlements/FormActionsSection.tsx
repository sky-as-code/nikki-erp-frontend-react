import { Button, Group } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Entitlement } from '@/features/entitlements';


interface FormActionsSectionProps {
	selectedEntitlements: Entitlement[];
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
	confirmLabel?: string;
	disableWhenEmpty?: boolean;
	actionVariant?: 'add' | 'remove';
	showConfirm?: boolean;
}

export const FormActionsSection: React.FC<FormActionsSectionProps> = ({
	selectedEntitlements,
	onConfirm,
	onCancel,
	isSubmitting,
	confirmLabel,
	disableWhenEmpty = true,
	actionVariant = 'add',
	showConfirm = true,
}) => {
	const { t: translate } = useTranslation();
	const isDisabled = disableWhenEmpty ? selectedEntitlements.length === 0 : false;
	const fallbackLabel = actionVariant === 'remove'
		? translate('nikki.general.actions.remove')
		: translate('nikki.general.actions.confirm');

	return (
		<Group justify='flex-start' mb='md'>
			{showConfirm && (
				<Button
					onClick={onConfirm}
					loading={isSubmitting}
					disabled={isDisabled}
				>
					{confirmLabel || fallbackLabel}
				</Button>
			)}

			<Button
				variant='outline'
				onClick={onCancel}
				disabled={isSubmitting}
			>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

