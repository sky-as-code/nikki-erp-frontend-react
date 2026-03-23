/* eslint-disable max-lines-per-function */
import {
	Avatar,
	Combobox,
	Group,
	Loader,
	Pill,
	PillsInput,
	Text,
	useCombobox,
} from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { DriveFileShare } from '@/features/fileShare/type';
import type { IdentityUser } from '@/features/identities/types';

import { selectDriveFileShareList } from '@/appState/fileShare';
import {
	identityActions,
	selectIdentityListUsersState,
	selectIdentityUsers,
} from '@/appState/identity';



export type ShareUserMultiSelectProps = {
	selectedUsers: IdentityUser[];
	setSelectedUsers: React.Dispatch<React.SetStateAction<IdentityUser[]>>;
};

function getUserInitials(user: IdentityUser): string {
	const source = user.displayName?.trim() || user.email?.trim() || '';
	if (!source) return '?';
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}

function resolveShareUserId(share: DriveFileShare): string {
	return (
		share.user?.id
		?? share.userRef
		?? (share as any).user_ref
		?? (share as any).userId
		?? (share as any).user_id
		?? ''
	);
}

function useSearchUsers(search: string) {
	const dispatch = useMicroAppDispatch();
	React.useEffect(() => {
		const trimmed = search.trim();
		if (trimmed.length <= 3) return;

		const timer = window.setTimeout(() => {
			(dispatch as (action: unknown) => void)(
				identityActions.listUsers({
					q: trimmed,
					page: 0,
					size: 20,
				}),
			);
		}, 300);

		return () => {
			window.clearTimeout(timer);
		};
	}, [dispatch, search]);
}

function SelectedUserPill(
	{ user, onRemove }: { user: IdentityUser; onRemove: (id: string) => void },
): React.ReactNode {
	return (
		<Pill
			key={user.id}
			withRemoveButton
			onRemove={() => onRemove(user.id)}
		>
			<Group gap={6} wrap='nowrap'>
				<Avatar src={user.avatarUrl ?? null} size={20} radius='xl'>
					{getUserInitials(user)}
				</Avatar>
				<Text size='xs'>{user.email}</Text>
			</Group>
		</Pill>
	);
}

function UserOption({ user }: { user: IdentityUser }): React.ReactNode {
	return (
		<Combobox.Option key={user.id} value={user.id}>
			<Group gap='xs' wrap='nowrap'>
				<Avatar src={user.avatarUrl ?? null} size={24} radius='xl'>
					{getUserInitials(user)}
				</Avatar>
				<div>
					<Text size='sm' fw={500}>{user.displayName}</Text>
					<Text size='xs' c='dimmed'>{user.email}</Text>
				</div>
			</Group>
		</Combobox.Option>
	);
}

export function ShareUserMultiSelect({
	selectedUsers,
	setSelectedUsers,
}: ShareUserMultiSelectProps): React.ReactNode {
	const { t } = useTranslation();
	const listUsersState = useMicroAppSelector(selectIdentityListUsersState);
	const users = useMicroAppSelector(selectIdentityUsers) as IdentityUser[];
	const shares = useMicroAppSelector(selectDriveFileShareList) as DriveFileShare[];
	const [search, setSearch] = React.useState('');
	const combobox = useCombobox();

	const canSearch = search.trim().length > 3;
	useSearchUsers(search);

	const selectedIds = React.useMemo(
		() => new Set(selectedUsers.map((user) => user.id)),
		[selectedUsers],
	);

	const sharedUserIds = React.useMemo(() => (
		new Set(
			(shares ?? []).map(resolveShareUserId).filter((id): id is string => Boolean(id)),
		)
	), [shares]);

	const selectableUsers = React.useMemo(() => {
		if (!canSearch) return [];
		return users.filter((user) => !selectedIds.has(user.id) && !sharedUserIds.has(user.id));
	}, [users, selectedIds, sharedUserIds, canSearch]);

	const handleRemoveUser = (id: string) => {
		setSelectedUsers((prev) => prev.filter((user) => user.id !== id));
	};

	const handleSelectUser = (value: string) => {
		const user = users.find((item) => item.id === value);
		if (!user) return;
		setSelectedUsers((prev) => (prev.some((item) => item.id === user.id) ? prev : [...prev, user]));
		setSearch('');
		combobox.closeDropdown();
	};

	return (
		<Combobox store={combobox} onOptionSubmit={handleSelectUser} withinPortal>
			<Combobox.DropdownTarget>
				<PillsInput onClick={() => combobox.openDropdown()}>
					<Pill.Group>
						{selectedUsers.map((user) => (
							<SelectedUserPill key={user.id} user={user} onRemove={handleRemoveUser} />
						))}
						<Combobox.EventsTarget>
							<PillsInput.Field
								value={search}
								onFocus={() => combobox.openDropdown()}
								onBlur={() => combobox.closeDropdown()}
								onChange={(event) => setSearch(event.currentTarget.value)}
								placeholder={t('nikki.drive.share.searchUserPlaceholder')}
							/>
						</Combobox.EventsTarget>
					</Pill.Group>
				</PillsInput>
			</Combobox.DropdownTarget>
			<Combobox.Dropdown>
				<Combobox.Options
					style={{
						maxHeight: 240,
						overflowY: 'auto',
					}}
				>
					{listUsersState.status === 'pending' ? (
						<Combobox.Empty>
							<Group justify='center' p='xs'>
								<Loader size='xs' />
							</Group>
						</Combobox.Empty>
					) : null}
					{listUsersState.status !== 'pending' && !canSearch ? (
						<Combobox.Empty>Nhập trên 3 ký tự để tìm kiếm người dùng</Combobox.Empty>
					) : null}
					{listUsersState.status !== 'pending' && canSearch && selectableUsers.length === 0 ? (
						<Combobox.Empty>{t('nikki.drive.share.noUsersFound')}</Combobox.Empty>
					) : null}
					{selectableUsers.map((user) => (
						<UserOption key={user.id} user={user} />
					))}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
}

