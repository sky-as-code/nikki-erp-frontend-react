import { Avatar, Badge, Checkbox, Table, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { UserInGroup } from './types';


interface UserRowProps {
	user: UserInGroup;
	isSelected: boolean;
	onToggle: (userId: string, checked: boolean) => void;
	disabled?: boolean;
}

function UserRow({ user, isSelected, onToggle, disabled }: UserRowProps) {
	return (
		<Table.Tr>
			<Table.Td>
				<Checkbox
					checked={isSelected}
					onChange={(e) => onToggle(user.id, e.currentTarget.checked)}
					disabled={disabled}
				/>
			</Table.Td>
			<Table.Td>
				<Avatar src={user.avatarUrl} size='sm' radius='xl' />
			</Table.Td>
			<Table.Td>
				<Text size='sm' fw={500}>
					{user.displayName || '-'}
				</Text>
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{user.email}</Text>
			</Table.Td>
			<Table.Td>
				{user.status && (
					<Badge color={user.status === 'active' ? 'green' : 'gray'} variant='light' size='sm'>
						{user.status}
					</Badge>
				)}
			</Table.Td>
		</Table.Tr>
	);
}

interface UserTableViewProps {
	users: UserInGroup[];
	selectedIds: string[];
	onToggleUser: (userId: string, checked: boolean) => void;
	onToggleAll: (checked: boolean) => void;
	isLoading: boolean;
	isRemoving: boolean;
}

export function UserTableView({
	users,
	selectedIds,
	onToggleUser,
	onToggleAll,
	isLoading,
	isRemoving,
}: UserTableViewProps) {
	const { t } = useTranslation();
	const isAllSelected = users.length > 0 && selectedIds.length === users.length;
	const isIndeterminate = selectedIds.length > 0 && selectedIds.length < users.length;

	return (
		<Table highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th w={50}>
						<Checkbox
							checked={isAllSelected}
							indeterminate={isIndeterminate}
							onChange={(e) => onToggleAll(e.currentTarget.checked)}
							disabled={isLoading || isRemoving}
						/>
					</Table.Th>
					<Table.Th w={50}></Table.Th>
					<Table.Th>{t('nikki.identity.user.fields.displayName')}</Table.Th>
					<Table.Th>{t('nikki.identity.user.fields.email')}</Table.Th>
					<Table.Th>{t('nikki.identity.user.fields.status')}</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{users.map((user) => (
					<UserRow
						key={user.id}
						user={user}
						isSelected={selectedIds.includes(user.id)}
						onToggle={onToggleUser}
						disabled={isLoading || isRemoving}
					/>
				))}
			</Table.Tbody>
		</Table>
	);
}
