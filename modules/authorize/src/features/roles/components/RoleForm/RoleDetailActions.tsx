import { Button, Group } from '@mantine/core';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/features/roles';


interface RoleDetailActionsProps {
	role: Role;
	isSubmitting: boolean;
	onAddEntitlements: () => void;
	onRemoveEntitlements: () => void;
	onCancel: () => void;
}

export const RoleDetailActions: React.FC<RoleDetailActionsProps> = ({
	role,
	isSubmitting,
	onAddEntitlements,
	onRemoveEntitlements,
	onCancel,
}) => {
	const { t: translate } = useTranslation();
	const hasEntitlements = (role.entitlementsCount ?? 0) > 0;

	return (
		<Group mt='lg' gap='md'>
			<Button
				type='submit'
				leftSection={<IconCheck size={16} />}
				loading={isSubmitting}
			>
				{translate('nikki.general.actions.update')}
			</Button>
			<Button
				type='button'
				variant='outline'
				leftSection={<IconPlus size={16} />}
				onClick={onAddEntitlements}
				disabled={isSubmitting}
			>
				{translate('nikki.authorize.role.entitlements.add')}
			</Button>
			<Button
				type='button'
				variant='outline'
				color='red'
				leftSection={<IconTrash size={16} />}
				onClick={onRemoveEntitlements}
				disabled={isSubmitting || !hasEntitlements}
			>
				{translate('nikki.authorize.role.entitlements.remove')}
			</Button>
			<Button
				type='button'
				variant='outline'
				onClick={onCancel}
				disabled={isSubmitting}
			>
				{translate('nikki.general.actions.cancel')}
			</Button>
		</Group>
	);
};

