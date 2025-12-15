import { Button, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { GrantRequest } from '@/features/grant_requests';


interface GrantRequestDetailActionsProps {
	grantRequest: GrantRequest;
	isSubmitting: boolean;
	onCancel: () => void;
	onApprove: () => void;
	onReject: () => void;
	onCancelRequest: () => void;
}

export const GrantRequestDetailActions: React.FC<GrantRequestDetailActionsProps> = ({
	grantRequest,
	isSubmitting,
	onCancel,
	onApprove,
	onReject,
	onCancelRequest,
}) => {
	const { t } = useTranslation();
	const isPending = grantRequest.status === 'pending';

	return (
		<Group>
			{isPending && (
				<>
					<Button
						leftSection={<IconCheck size={16} />}
						color='green'
						onClick={onApprove}
						loading={isSubmitting}
					>
						{t('nikki.general.actions.approve')}
					</Button>
					<Button
						leftSection={<IconX size={16} />}
						color='red'
						onClick={onReject}
						loading={isSubmitting}
					>
						{t('nikki.general.actions.reject')}
					</Button>
					<Button
						variant='outline'
						color='orange'
						onClick={onCancelRequest}
						loading={isSubmitting}
					>
						{t('nikki.general.actions.cancel')}
					</Button>
				</>
			)}
			<Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
				{t('nikki.general.actions.back')}
			</Button>
		</Group>
	);
};

