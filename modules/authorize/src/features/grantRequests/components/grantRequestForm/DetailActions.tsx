import { Button, Group } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';
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

	return (
		<Group justify='space-between' wrap='nowrap'>
			{isPending && (
				<Group gap='sm'>
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
				</Group>
			)}

			<Button
				variant='subtle'
				leftSection={<IconArrowLeft size={16} />}
				onClick={onCancel}
				disabled={isSubmitting}
			>
				{translate('nikki.general.actions.back')}
			</Button>
		</Group>
	);
};

