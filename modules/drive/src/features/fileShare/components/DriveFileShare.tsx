import { Avatar, Alert, Box, Button, Group, Loader, Paper, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	driveFileShareActions,
	selectDriveFileShareList,
	selectDriveFileShareSearchState,
} from '@/appState/fileShare';
import {
	DriveFileSharePermission,
	DriveFileSharePermissionBadge,
	fileShareService,
} from '@/features/fileShare';
import { useDriveFileSharePermissionValue } from '@/features/fileShare/hooks/enum/useDriveFileSharePermissionValue';

import { ShareUserMultiSelect } from './ShareUserMultiSelect';

import type { DriveFile } from '@/features/files/types';
import type {
	DriveFileShare,
	DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';
import type { IdentityUser } from '@/features/identities/types';


export type DriveFileShareManagerProps = {
	file: DriveFile;
};

type RawDriveFileShare = DriveFileShare & {
	user_ref?: string;
	userId?: string;
	user_id?: string;
};

function resolveUserRef(share: DriveFileShare): string {
	const rawShare = share as RawDriveFileShare;
	return share.userRef ?? rawShare.user_ref ?? rawShare.userId ?? rawShare.user_id ?? '';
}

function getUserInitials(user?: { displayName?: string; email?: string }): string {
	const source = user?.displayName?.trim() || user?.email?.trim() || '';
	if (!source) return '?';
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}

function useSharePermissionOptions() {
	const permissionLabel = useDriveFileSharePermissionValue();
	return React.useMemo(() => {
		return [
			{ value: DriveFileSharePermission.VIEW, label: permissionLabel(DriveFileSharePermission.VIEW) },
			{ value: DriveFileSharePermission.EDIT, label: permissionLabel(DriveFileSharePermission.EDIT) },
			{ value: DriveFileSharePermission.EDIT_TRASH, label: permissionLabel(DriveFileSharePermission.EDIT_TRASH) },
		];
	}, [permissionLabel]);
}

type PermissionSelectorProps = {
	value: DriveFileSharePermissionType;
	options: Array<{ value: DriveFileSharePermissionType; label: string }>;
	onChange: (nextPermission: DriveFileSharePermissionType) => void;
	w?: number;
};

function PermissionSelector({
	value,
	options,
	onChange,
	w,
}: PermissionSelectorProps): React.ReactNode {
	return (
		<Select
			data={options}
			value={value}
			w={w}
			onChange={(nextValue) => {
				if (!nextValue) return;
				onChange(nextValue as DriveFileSharePermissionType);
			}}
			renderOption={({ option }) => (
				<DriveFileSharePermissionBadge
					e={option.value as DriveFileSharePermissionType}
					size='xs'
					variant='light'
				/>
			)}
		/>
	);
}

function useHandleChangePermission(fileId: string) {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	return React.useCallback(async (
		share: DriveFileShare,
		nextPermission: string | null,
	) => {
		if (!nextPermission || nextPermission === share.permission) return;
		const result = await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
			driveFileShareActions.updateFileShare({
				fileId: fileId,
				shareId: share.id,
				req: { etag: share.etag, permission: nextPermission as DriveFileSharePermissionType },
			}),
		);
		if (!result?.type?.endsWith('/fulfilled')) {
			notifications.show({
				title: t('nikki.general.messages.error'),
				message: t('nikki.general.errors.update_failed'),
				color: 'red',
			});
		}
	}, [dispatch, fileId, t]);
}

export function DriveFileShareManager({ file }: DriveFileShareManagerProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const permissionOptions = useSharePermissionOptions();
	const handleChangePermission = useHandleChangePermission(file.id);
	const shares = useMicroAppSelector(selectDriveFileShareList) as DriveFileShare[];
	const searchState = useMicroAppSelector(selectDriveFileShareSearchState);
	const [selectedUsers, setSelectedUsers] = React.useState<IdentityUser[]>([]);
	const [bulkPermission, setBulkPermission] = React.useState<DriveFileSharePermissionType>(
		DriveFileSharePermission.VIEW,
	);
	const [isSharing, setIsSharing] = React.useState(false);

	React.useEffect(() => {
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.searchFileShares({
				fileId: file.id,
				req: {
					page: 0,
					size: 50,
				},
			}),
		);
	}, [dispatch, file.id]);

	const handleShareBulk = React.useCallback(async () => {
		if (isSharing) return;
		if (selectedUsers.length === 0) return;

		setIsSharing(true);
		try {
			await fileShareService.createFileShareBulk(file.id, {
				driveFileRef: file.id,
				userRefs: selectedUsers.map((u) => u.id),
				permission: bulkPermission,
			});

			setSelectedUsers([]);
			(dispatch as (action: unknown) => void)(
				driveFileShareActions.searchFileShares({
					fileId: file.id,
					req: { page: 0, size: 50 },
				}),
			);
		}
		catch (error) {
			notifications.show({
				title: t('nikki.general.messages.error'),
				message: error instanceof Error ? error.message : 'Failed to share users',
				color: 'red',
			});
		}
		finally {
			setIsSharing(false);
		}
	}, [bulkPermission, dispatch, file.id, isSharing, selectedUsers, t]);

	return (
		<Stack gap='md' h={420} w='650px'>
			<Box>
				<Stack gap='xs'>
					<Text size='sm' fw={600}>Chia sẻ file</Text>
					<Group align='flex-start' gap='sm'>
						<div style={{ flex: 1, minWidth: 260 }}>
							<ShareUserMultiSelect
								selectedUsers={selectedUsers}
								setSelectedUsers={setSelectedUsers}
							/>
						</div>
						<PermissionSelector
							options={permissionOptions}
							value={bulkPermission}
							onChange={setBulkPermission}
							w={190}
						/>
					</Group>
					<Group justify='flex-end'>
						<Button
							loading={isSharing}
							disabled={selectedUsers.length === 0}
							onClick={() => void handleShareBulk()}
						>
							Share
						</Button>
					</Group>
				</Stack>
			</Box>
			{searchState.status === 'pending' ? <Loader size='sm' /> : null}
			{searchState.status === 'error' ? (
				<Alert color='red' variant='light'>
					{searchState.error ?? 'Failed to load shares'}
				</Alert>
			) : null}
			{searchState.status !== 'pending' && shares.length === 0 ? (
				<Text size='sm' c='dimmed'>No shares</Text>
			) : null}
			{shares.length > 0 ? (
				<Stack gap='xs' flex={1}>
					<Text size='sm' fw={600}>Danh sách người dùng được chia sẻ</Text>
					<Stack gap='xs' flex={1} style={{ overflowY: 'auto' }}>
						{shares.map((share) => (
							<Paper key={share.id} withBorder radius='md' p='sm' mih={52}>
								<Group justify='space-between' wrap='nowrap'>
									<Group gap={10} wrap='nowrap'>
										<Avatar
											src={share.user?.avatarUrl ?? null}
											size={32}
											radius='xl'
										>
											{getUserInitials({
												displayName: share.user?.displayName,
												email: share.user?.email,
											})}
										</Avatar>
										<div>
											<Text size='sm' fw={500}>
												{share.user?.displayName ?? resolveUserRef(share) ?? '-'}
											</Text>
											<Text size='xs' c='dimmed'>
												{share.user?.email ?? ''}
											</Text>
										</div>
									</Group>
									<PermissionSelector
										value={share.permission}
										options={permissionOptions}
										onChange={(value) => {
											void handleChangePermission(share, value);
										}}
										w={130}
									/>
								</Group>
							</Paper>
						))}
					</Stack>
				</Stack>
			) : null}
		</Stack>
	);
}

