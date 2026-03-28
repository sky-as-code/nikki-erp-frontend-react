/* eslint-disable max-lines-per-function */
import {
	Accordion,
	ActionIcon,
	Box,
	Button,
	Group,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector, useRootSelector } from '@nikkierp/ui/microApp';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessDetailModal } from './DriveFileShareAccessDetailModal';
import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';
import { DriveFileShareInheritedSection } from './DriveFileShareInheritedSection';
import { DriveFileShareResolvedSection } from './DriveFileShareResolvedSection';
import { DriveFileShareViewerSection } from './DriveFileShareViewerSection';
import { SharePermissionHelpModal } from './permissionHelp';
import { PermissionSelector } from './PermissionSelector';
import { shareAccessAccordionStyles } from './shareAccessAccordionStyles';
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
import { DriveFileSharePermission } from '@/features/fileShare';
import {
	canManageShareInDetail,
} from '@/features/fileShare/driveFileShareAccessDetailUtils';
import { createOwnerFileShareStub } from '@/features/fileShare/driveFileShareUserUtils';
import { useDriveFileSharesByUser } from '@/features/fileShare/hooks/useDriveFileSharesByUser';
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

	const shellUser = useRootSelector(
		(s: { shellUserContext?: { user?: { id: string; displayName: string; email: string; avatarUrl?: string } } }) =>
			s.shellUserContext?.user,
	);
	const currentUserId = shellUser?.id;
	const isFileOwner = Boolean(currentUserId && file.ownerRef && file.ownerRef === currentUserId);

	const viewerShares = useDriveFileSharesByUser({
		fileId: file.id,
		userId: currentUserId,
		enabled: Boolean(currentUserId) && !isFileOwner,
	});

	const viewerAppliedPermission = viewerShares.appliedShare?.permission ?? null;

	const canManageShareInDetailModal = React.useMemo(
		() => canManageShareInDetail({
			file,
			currentUserId,
			viewerAppliedPermission,
		}),
		[file, currentUserId, viewerAppliedPermission],
	);

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
			const result = await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
				driveFileShareActions.createFileShareBulk({
					fileId: file.id,
					req: {
						driveFileRef: file.id,
						userRefs: selectedUsers.map((u) => u.id),
						permission: bulkPermission,
					},
				}),
			);
			if (!result?.type?.endsWith('/fulfilled')) {
				notifications.show({
					title: t('nikki.general.messages.error'),
					message: t('nikki.general.errors.update_failed'),
					color: 'red',
				});
				return;
			}

			setSelectedUsers([]);
			(dispatch as (action: unknown) => void)(
				driveFileShareActions.getResolvedFileShares({
					fileId: file.id,
					params: { page: 0, size: 50 },
				}),
			);
			if (currentUserId && file.ownerRef !== currentUserId) {
				void viewerShares.refetch();
			}
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
	}, [
		bulkPermission,
		currentUserId,
		dispatch,
		file.id,
		file.ownerRef,
		isSharing,
		selectedUsers,
		t,
		viewerShares.refetch,
	]);

	const viewerBlockVisible = !isFileOwner && Boolean(currentUserId);

	const showAccessList =
		Boolean(ownerShareStub)
		|| viewerBlockVisible
		|| ancestorShares.length > 0
		|| ancestorsState.status === 'pending'
		|| ancestorsState.status === 'error'
		|| resolvedShareItems.length > 0
		|| resolvedState.status === 'pending'
		|| resolvedState.status === 'error';

	const showAccessListEmpty =
		!ownerShareStub
		&& !viewerBlockVisible
		&& ancestorsState.status !== 'pending'
		&& ancestorsState.status !== 'error'
		&& ancestorShares.length === 0
		&& resolvedState.status !== 'pending'
		&& resolvedState.status !== 'error'
		&& resolvedShareItems.length === 0;

	return (
		<Stack gap='md' h={630} w='650px'>
			{isFileOwner ? (
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
			) : null}
			{showAccessListEmpty ? (
				<Text size='sm' c='dimmed'>{t('nikki.drive.share.accessListEmpty')}</Text>
			) : null}
			{showAccessList ? (
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
							<Accordion
								defaultValue='owner-section'
								variant='default'
								radius={0}
								styles={shareAccessAccordionStyles}
							>
								<Accordion.Item value='owner-section'>
									<Accordion.Control>
										<Text size='xs' fw={400} c='dimmed'>
											{t('nikki.drive.share.ownerSectionTitle')}
										</Text>
									</Accordion.Control>
									<Accordion.Panel>
										<Stack gap='xs'>
											<DriveFileShareAccessItem
												key={ownerShareStub.id}
												share={ownerShareStub}
												readOnly
												allowOpenDetail={false}
											/>
										</Stack>
									</Accordion.Panel>
								</Accordion.Item>
							</Accordion>
						) : null}
						{!isFileOwner && currentUserId ? (
							<DriveFileShareViewerSection
								viewerShares={viewerShares}
								shellUser={shellUser}
								detailReadOnly={!canManageShareInDetailModal}
								onOpenShareDetail={(share) => setAccessDetailAnchor(share)}
							/>
						) : null}
						<DriveFileShareInheritedSection
							file={file}
							currentUserId={currentUserId}
							viewerAppliedPermission={viewerAppliedPermission}
							ancestorsState={ancestorsState}
							ancestorShares={ancestorShares}
							detailReadOnly={!canManageShareInDetailModal}
							onOpenShareDetail={(share) => setAccessDetailAnchor(share)}
						/>
						<DriveFileShareResolvedSection
							file={file}
							currentUserId={currentUserId}
							viewerAppliedPermission={viewerAppliedPermission}
							resolvedState={resolvedState}
							detailReadOnly={!canManageShareInDetailModal}
							onOpenShareDetail={(share) => setAccessDetailAnchor(share)}
						/>
					</Stack>
				</Stack>
			) : null}
			<DriveFileShareAccessDetailModal
				fileId={file.id}
				opened={accessDetailAnchor !== null}
				anchorShare={accessDetailAnchor}
				canManageShare={canManageShareInDetailModal}
				onClose={() => setAccessDetailAnchor(null)}
				permissionOptions={permissionOptions}
				onPermissionChange={handleChangePermission}
				onNavigateAway={closeAllModals}
				onAccessUpdated={(userId) => {
					if (currentUserId && userId === currentUserId) {
						void viewerShares.refetch();
					}
				}}
			/>
			<SharePermissionHelpModal
				opened={permissionHelpOpened}
				onClose={() => setPermissionHelpOpened(false)}
			/>
		</Stack>
	);
}
