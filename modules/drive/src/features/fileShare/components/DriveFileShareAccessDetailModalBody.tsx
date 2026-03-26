import { Anchor, Button, Divider, Group, Stack, Text } from '@mantine/core';
import { IconCornerDownRight } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


import { DriveFileShareRevokeConfirmModal } from './DriveFileShareRevokeConfirmModal';
import { PermissionSelector } from './PermissionSelector';

import type {
	DriveFileShare,
	DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';

import { DriveFileSharePermissionDisplay } from '@/features/fileShare';
import {
	getAssignableOptions,
	mapDirectToInheritedPermission,
} from '@/features/fileShare/driveFileShareAccessDetailUtils';
import { PERMISSION_RANK } from '@/features/fileShare/sharePermissionConstants';
import { useOrgModulePath } from '@/hooks/useRootPath';


export function AncestorShareRow({ row, basePath, onNavigate }: {
	row: DriveFileShare;
	basePath: string;
	onNavigate?: () => void;
}): React.ReactNode {
	const inherited = mapDirectToInheritedPermission(row.permission);
	const targetId = row.file?.id ?? row.driveFileRef;
	const href = targetId ? `${basePath}/management/folder/${targetId}` : undefined;
	return (
		<Group gap='sm' wrap='nowrap' align='flex-start'>
			{href ? (
				<Anchor component={Link} to={href} size='sm' style={{ minWidth: 0 }} onClick={onNavigate}>
					{row.file?.name ?? row.driveFileRef ?? '—'}
				</Anchor>
			) : (
				<Text size='sm' style={{ minWidth: 0 }}>
					{row.file?.name ?? row.driveFileRef ?? '—'}
				</Text>
			)}
			<div style={{ flexShrink: 0 }}>
				<DriveFileSharePermissionDisplay e={row.permission} textProps={{ size: 'xs' }} />
				{inherited ? (
					<Group gap={4} wrap='nowrap' align='center' mt={2} ml={1}>
						<IconCornerDownRight
							size={14}
							stroke={1.75}
							color='var(--mantine-color-dimmed)'
							aria-hidden
						/>
						<DriveFileSharePermissionDisplay e={inherited} textProps={{ size: 'xs' }} />
					</Group>
				) : null}
			</div>
		</Group>
	);
}

/**
 * Tìm ancestor share có quyền kế thừa cao nhất.
 * Trả về cả permission lẫn row để dùng cho filter options + confirm modal.
 */
function getMaxInheritedAncestor(
	restRows: DriveFileShare[],
): { permission: DriveFileSharePermissionType; row: DriveFileShare } | null {
	if (restRows.length === 0) return null;
	let best: { permission: DriveFileSharePermissionType; row: DriveFileShare } | null = null;
	let maxRank = 0;
	for (const row of restRows) {
		const rank = PERMISSION_RANK[row.permission] ?? 0;
		if (rank > maxRank) {
			maxRank = rank;
			best = { permission: row.permission, row };
		}
	}
	return best;
}

function PermissionEditForm({
	currentRow, availableOptions, isDirectPermission,
	onUpdatePermission, onCreatePermission, onRevokePermission, inheritedAncestorRow,
}: {
	currentRow: DriveFileShare;
	availableOptions: Array<{ value: DriveFileSharePermissionType; label: string }>;
	isDirectPermission: boolean;
	onUpdatePermission: (share: DriveFileShare, next: DriveFileSharePermissionType) => void;
	onCreatePermission: (userRef: string, permission: DriveFileSharePermissionType) => void;
	onRevokePermission: (share: DriveFileShare) => void;
	inheritedAncestorRow: DriveFileShare | null;
}): React.ReactNode {
	const { t } = useTranslation();
	const canEdit = availableOptions.length > 0;
	const defaultSelected = canEdit
		? (isDirectPermission ? currentRow.permission : availableOptions[0].value)
		: currentRow.permission;

	const [selectedPermission, setSelectedPermission] = React.useState(defaultSelected);
	const [revokeConfirmOpened, setRevokeConfirmOpened] = React.useState(false);

	React.useEffect(() => { setSelectedPermission(defaultSelected); }, [defaultSelected]);

	const isDirty = selectedPermission !== currentRow.permission;

	const handleSubmit = () => {
		if (isDirectPermission) onUpdatePermission(currentRow, selectedPermission);
		else onCreatePermission(currentRow.userRef, selectedPermission);
	};

	return (
		<>
			{canEdit ? (
				<Group gap='sm' wrap='nowrap'>
					<div style={{ flex: 1, minWidth: 0 }}>
						<PermissionSelector value={selectedPermission} options={availableOptions} w='100%' onChange={setSelectedPermission} />
					</div>
					<Button size='sm' disabled={!isDirty} style={{ flexShrink: 0 }} onClick={handleSubmit}>
						{t('nikki.drive.share.accessDetailUpdatePermission')}
					</Button>
				</Group>
			) : (
				<Text size='sm' c='dimmed'>{t('nikki.drive.share.accessDetailCannotEditPermission')}</Text>
			)}
			{isDirectPermission ? (
				<Button size='sm' color='red' variant='light' onClick={() => setRevokeConfirmOpened(true)}>
					{t('nikki.drive.share.accessDetailRevokeButton')}
				</Button>
			) : null}
			<DriveFileShareRevokeConfirmModal
				opened={revokeConfirmOpened}
				onClose={() => setRevokeConfirmOpened(false)}
				onConfirm={() => { setRevokeConfirmOpened(false); onRevokePermission(currentRow); }}
				inheritedAncestorRow={inheritedAncestorRow}
			/>
		</>
	);
}

export type DriveFileShareAccessDetailModalBodyProps = {
	fileId: string;
	currentRow: DriveFileShare;
	restRows: DriveFileShare[];
	isDirectPermission: boolean;
	permissionOptions: Array<{ value: DriveFileSharePermissionType; label: string }>;
	onUpdatePermission: (share: DriveFileShare, next: DriveFileSharePermissionType) => void;
	onCreatePermission: (userRef: string, permission: DriveFileSharePermissionType) => void;
	onRevokePermission: (share: DriveFileShare) => void;
	onClose?: () => void;
};

export function DriveFileShareAccessDetailModalBody({
	currentRow, restRows, isDirectPermission, permissionOptions,
	onUpdatePermission, onCreatePermission, onRevokePermission, onClose,
}: DriveFileShareAccessDetailModalBodyProps): React.ReactNode {
	const { t } = useTranslation();
	const basePath = useOrgModulePath();

	const maxInheritedResult = React.useMemo(() => getMaxInheritedAncestor(restRows), [restRows]);
	const availableOptions = React.useMemo(
		() => getAssignableOptions(permissionOptions, maxInheritedResult?.permission ?? null),
		[permissionOptions, maxInheritedResult],
	);

	return (
		<Stack gap='sm'>
			<Divider label={t('nikki.drive.share.accessDetailCurrentFilePermission')} labelPosition='left' />
			<PermissionEditForm
				currentRow={currentRow}
				availableOptions={availableOptions}
				isDirectPermission={isDirectPermission}
				onUpdatePermission={onUpdatePermission}
				onCreatePermission={onCreatePermission}
				onRevokePermission={onRevokePermission}
				inheritedAncestorRow={maxInheritedResult?.row ?? null}
			/>
			{restRows.length > 0 ? (
				<>
					<Divider label={t('nikki.drive.share.accessDetailAncestorChain')} labelPosition='left' />
					<Stack gap='md'>
						{restRows.map((row) => (
							<AncestorShareRow key={row.id} row={row} basePath={basePath} onNavigate={onClose} />
						))}
					</Stack>
				</>
			) : null}
		</Stack>
	);
}
