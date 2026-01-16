import { Paper, Select, Stack, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Group as GroupType } from '@/features/identities';
import type { User } from '@/features/identities';


interface RevokeRequestFilterProps {
	receiverType: 'user' | 'group' | null;
	onReceiverTypeChange: (type: 'user' | 'group' | null) => void;
	receiverId: string | null;
	onReceiverIdChange: (id: string | null) => void;
	users?: User[];
	groups?: GroupType[];
}

export const RevokeRequestFilter: React.FC<RevokeRequestFilterProps> = ({
	receiverType,
	onReceiverTypeChange,
	receiverId,
	onReceiverIdChange,
	users,
	groups,
}) => {
	const { t: translate } = useTranslation();

	const receiverTypeOptions = [
		{ value: 'user', label: translate('nikki.authorize.grant_request.fields.receiver_type_user') },
		{ value: 'group', label: translate('nikki.authorize.grant_request.fields.receiver_type_group') },
	];

	const receiverOptions = React.useMemo(() => {
		if (receiverType === 'user' && users) {
			return users.map((u) => ({ value: u.id, label: u.displayName }));
		}
		if (receiverType === 'group' && groups) {
			return groups.map((g) => ({ value: g.id, label: g.name }));
		}
		return [];
	}, [receiverType, users, groups]);

	return (
		<Paper p='md' withBorder>
			<Stack gap='md'>
				<Title order={5}>{translate('nikki.authorize.revoke_request.filter.title')}</Title>
				<Select
					label={translate('nikki.authorize.revoke_request.filter.receiver_type')}
					data={receiverTypeOptions}
					value={receiverType || null}
					onChange={(val) => {
						onReceiverTypeChange(val as 'user' | 'group' | null);
						onReceiverIdChange(null);
					}}
					clearable
				/>
				{receiverType && (
					<Select
						label={translate('nikki.authorize.revoke_request.filter.receiver')}
						data={receiverOptions}
						value={receiverId || null}
						onChange={(val) => onReceiverIdChange(val || null)}
						searchable
						clearable
					/>
				)}
			</Stack>
		</Paper>
	);
};

