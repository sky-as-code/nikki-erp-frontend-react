import { Button } from '@mantine/core';
import { FormActions } from '@nikkierp/ui/components/form';
import { IconCheck, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { GrantRequest } from '@/features/grantRequests';


interface DetailActionsProps {
	grantRequest: GrantRequest;
	isSubmitting: boolean;
	onCancel: () => void;
	onApprove: () => void;
	onReject: () => void;
}

export const DetailActions: React.FC<DetailActionsProps> = ({
	grantRequest,
	isSubmitting,
	onCancel,
	onApprove,
	onReject,
}) => {
	const { t: translate } = useTranslation();
	const isPending = grantRequest.status === 'pending';

	const additionalActions = isPending ? (
		<>
			<Button
				leftSection={<IconCheck size={16} />}
				color='green'
				onClick={onApprove}
				loading={isSubmitting}
				type='button'
			>
				{translate('nikki.general.actions.approve')}
			</Button>
			<Button
				leftSection={<IconX size={16} />}
				color='red'
				onClick={onReject}
				loading={isSubmitting}
				type='button'
			>
				{translate('nikki.general.actions.reject')}
			</Button>
		</>
	) : null;

	return (
		<FormActions
			isSubmitting={isSubmitting}
			onCancel={onCancel}
			isCreate={false}
			additionalActions={additionalActions}
		/>
	);
};

