import { Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AddUserModal } from './AddUserModal';
import { ListUserHeader } from './ListUserHeader';
import { AvailableUser, UserInGroup } from './types';
import { UserTableView } from './UserTableView';


function useListUserLogic(
	users: UserInGroup[],
	availableUsers: AvailableUser[],
	onAddUsers: (userIds: string[]) => Promise<void>,
	onRemoveUsers: (userIds: string[]) => Promise<void>,
) {
	const [selectedAddUserIds, setSelectedAddUserIds] = React.useState<string[]>([]);
	const [selectedRemoveUserIds, setSelectedRemoveUserIds] = React.useState<string[]>([]);
	const [isAdding, setIsAdding] = React.useState(false);
	const [isRemoving, setIsRemoving] = React.useState(false);

	const usersNotInGroup = React.useMemo(() => {
		const userIdsInGroup = new Set(users.map(u => u.id));
		return availableUsers.filter(user => !userIdsInGroup.has(user.id));
	}, [users, availableUsers]);

	const selectOptions = React.useMemo(() => {
		return usersNotInGroup.map(user => ({
			value: user.id,
			label: `${user.displayName || user.email} (${user.email})`,
		}));
	}, [usersNotInGroup]);

	const handleToggleUser = React.useCallback((userId: string, checked: boolean) => {
		setSelectedRemoveUserIds(prev => {
			if (checked) {
				return [...prev, userId];
			}
			return prev.filter(id => id !== userId);
		});
	}, []);

	const handleToggleAll = React.useCallback((checked: boolean) => {
		if (checked) {
			setSelectedRemoveUserIds(users.map(u => u.id));
		}
		else {
			setSelectedRemoveUserIds([]);
		}
	}, [users]);

	const handleAddUsers = React.useCallback(async () => {
		if (selectedAddUserIds.length === 0) return;

		setIsAdding(true);
		try {
			await onAddUsers(selectedAddUserIds);
			setSelectedAddUserIds([]);
		}
		catch (error) {
			console.error('Failed to add users:', error);
		}
		finally {
			setIsAdding(false);
		}
	}, [selectedAddUserIds, onAddUsers]);

	const handleRemoveSelectedUsers = React.useCallback(async () => {
		if (selectedRemoveUserIds.length === 0) return;

		setIsRemoving(true);
		try {
			await onRemoveUsers(selectedRemoveUserIds);
			setSelectedRemoveUserIds([]);
		}
		catch (error) {
			console.error('Failed to remove users:', error);
		}
		finally {
			setIsRemoving(false);
		}
	}, [selectedRemoveUserIds, onRemoveUsers]);

	return {
		selectedAddUserIds,
		setSelectedAddUserIds,
		selectedRemoveUserIds,
		isAdding,
		isRemoving,
		usersNotInGroup,
		selectOptions,
		handleToggleUser,
		handleToggleAll,
		handleAddUsers,
		handleRemoveSelectedUsers,
	};
}

export interface ListUserProps {
	users: UserInGroup[];
	availableUsers: AvailableUser[];
	isLoading?: boolean;
	onAddUsers: (userIds: string[]) => any;
	onRemoveUsers: (userIds: string[]) => any;
	title?: string;
	emptyMessage?: string;
}


export const ListUser: React.FC<ListUserProps> = ({
	users = [],
	availableUsers = [],
	isLoading = false,
	onAddUsers,
	onRemoveUsers,
	title,
	emptyMessage,
}) => {
	const { t } = useTranslation();
	const [opened, { open, close }] = useDisclosure(false);

	const {
		selectedAddUserIds,
		setSelectedAddUserIds,
		selectedRemoveUserIds,
		isAdding,
		isRemoving,
		usersNotInGroup,
		selectOptions,
		handleToggleUser,
		handleToggleAll,
		handleAddUsers,
		handleRemoveSelectedUsers,
	} = useListUserLogic(users, availableUsers, onAddUsers, onRemoveUsers);

	const handleAddUsersSubmit = async () => {
		await handleAddUsers();
		close();
	};

	return (
		<>
			<Paper p='md'>
				<Stack gap='md'>
					<ListUserHeader
						userCount={users.length}
						selectedCount={selectedRemoveUserIds.length}
						onRemove={handleRemoveSelectedUsers}
						onAdd={open}
						isLoading={isLoading}
						isRemoving={isRemoving}
						hasAvailable={usersNotInGroup.length > 0}
						title={title}
					/>

					{users.length === 0 ? (
						<Text c='dimmed' ta='center' py='xl'>
							{emptyMessage || t('nikki.identity.group.messages.noUsers')}
						</Text>
					) : (
						<UserTableView
							users={users}
							selectedIds={selectedRemoveUserIds}
							onToggleUser={handleToggleUser}
							onToggleAll={handleToggleAll}
							isLoading={isLoading}
							isRemoving={isRemoving}
						/>
					)}
				</Stack>
			</Paper>

			<AddUserModal
				opened={opened}
				onClose={close}
				selectOptions={selectOptions}
				selectedIds={selectedAddUserIds}
				onSelectedChange={setSelectedAddUserIds}
				onSubmit={handleAddUsersSubmit}
				isAdding={isAdding}
			/>
		</>
	);
};


