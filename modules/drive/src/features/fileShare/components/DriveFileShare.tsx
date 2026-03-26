/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Box,
	Button,
	Group,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessDetailModal } from './DriveFileShareAccessDetailModal';
import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';
import { DriveFileShareInheritedSection } from './DriveFileShareInheritedSection';
import { DriveFileShareResolvedSection } from './DriveFileShareResolvedSection';
import { SharePermissionHelpModal } from './permissionHelp';
import { PermissionSelector } from './PermissionSelector';
import { ShareUserMultiSelect } from './ShareUserMultiSelect';

import type { DriveFile } from '@/features/files/types';
import type { DriveFileShare, DriveFileSharePermission as DriveFileSharePermissionType } from '@/features/fileShare/type';
import type { IdentityUser } from '@/features/identities/types';

import { driveFileActions } from '@/appState/file';
import {
	driveFileShareActions,
	selectDriveFileShareAncestorsState,
	selectDriveFileShareResolvedState,
} from '@/appState/fileShare';
import { DriveFileSharePermission, fileShareService } from '@/features/fileShare';
import { createOwnerFileShareStub } from '@/features/fileShare/driveFileShareUserUtils';
import { useHandleChangeDriveFileSharePermission } from '@/features/fileShare/hooks/useHandleChangeDriveFileSharePermission';
import { useSharePermissionOptions } from '@/features/fileShare/hooks/useSharePermissionOptions';


export type DriveFileShareManagerProps = {
	file: DriveFile;
};

export function DriveFileShareManager({ file }: DriveFileShareManagerProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const permissionOptions = useSharePermissionOptions();
	const handleChangePermission = useHandleChangeDriveFileSharePermission(file.id);
	const ancestorsState = useMicroAppSelector(selectDriveFileShareAncestorsState);
	const ancestorShares = ancestorsState.data ?? [];
	const resolvedState = useMicroAppSelector(selectDriveFileShareResolvedState);
	const resolvedShareItems = resolvedState.data?.items ?? [];
	const [selectedUsers, setSelectedUsers] = React.useState<IdentityUser[]>([]);
	const [bulkPermission, setBulkPermission] = React.useState<DriveFileSharePermissionType>(
		DriveFileSharePermission.VIEW,
	);
	const [isSharing, setIsSharing] = React.useState(false);
	const [permissionHelpOpened, setPermissionHelpOpened] = React.useState(false);
	const [accessDetailAnchor, setAccessDetailAnchor] = React.useState<DriveFileShare | null>(null);

	const ownerShareStub = React.useMemo(() => createOwnerFileShareStub(file), [file]);

	const closeAllModals = React.useCallback(() => {
		setAccessDetailAnchor(null);
		(dispatch as (action: unknown) => void)(driveFileActions.resetDriveFileModal());
	}, [dispatch]);

	React.useEffect(() => {
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.getFileShareAncestors({ fileId: file.id }),
		);
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.getResolvedFileShares({
				fileId: file.id,
				params: { page: 0, size: 50 },
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
				driveFileShareActions.getResolvedFileShares({
					fileId: file.id,
					params: { page: 0, size: 50 },
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
					<Group justify='space-between' align='center' wrap='nowrap'>
						<Text size='sm' fw={600}>{t('nikki.drive.share.panelTitle')}</Text>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='lg'
							aria-label={t('nikki.drive.share.permissionHelpAria')}
							onClick={() => setPermissionHelpOpened(true)}
						>
							<IconInfoCircle size={20} />
						</ActionIcon>
					</Group>
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
			{!ownerShareStub
				&& ancestorsState.status !== 'pending'
				&& ancestorShares.length === 0
				&& resolvedState.status !== 'pending'
				&& resolvedState.status !== 'error'
				&& resolvedShareItems.length === 0 ? (
					<Text size='sm' c='dimmed'>{t('nikki.drive.share.accessListEmpty')}</Text>
				) : null}
			{(ownerShareStub
				|| ancestorShares.length > 0
				|| ancestorsState.status === 'pending'
				|| resolvedShareItems.length > 0
				|| resolvedState.status === 'pending'
				|| resolvedState.status === 'error') ? (
					<Stack gap='xs' flex={1} style={{ minWidth: 0, overflow: 'hidden' }}>
						<Text size='sm' fw={600}>{t('nikki.drive.share.accessListTitle')}</Text>
						<Stack
							gap='xs'
							flex={1}
							style={{
								minWidth: 0,
								overflowX: 'hidden',
								overflowY: 'auto',
								scrollbarGutter: 'stable',
							}}
						>
							{ownerShareStub ? (
								<DriveFileShareAccessItem
									key={ownerShareStub.id}
									share={ownerShareStub}
									readOnly
								/>
							) : null}
							<DriveFileShareInheritedSection
								ancestorsState={ancestorsState}
								ancestorShares={ancestorShares}
								onOpenShareDetail={(share) => setAccessDetailAnchor(share)}
							/>
							<DriveFileShareResolvedSection
								resolvedState={resolvedState}
								onOpenShareDetail={(share) => setAccessDetailAnchor(share)}
							/>
						</Stack>
					</Stack>
				) : null}
			<DriveFileShareAccessDetailModal
				fileId={file.id}
				opened={accessDetailAnchor !== null}
				anchorShare={accessDetailAnchor}
				onClose={() => setAccessDetailAnchor(null)}
				permissionOptions={permissionOptions}
				onPermissionChange={handleChangePermission}
				onNavigateAway={closeAllModals}
			/>
			<SharePermissionHelpModal
				opened={permissionHelpOpened}
				onClose={() => setPermissionHelpOpened(false)}
			/>
		</Stack>
	);
}
