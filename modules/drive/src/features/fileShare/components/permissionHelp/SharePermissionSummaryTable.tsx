import { Group, Stack, Table, Text } from '@mantine/core';
import { IconArrowDown, IconCheck, IconFile, IconFolder } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PERMISSION_ICON } from '../EnumDisplay/DriveFileSharePermissionDisplay';

import {
	PERMISSION_SUMMARY_ROWS,
	SHARE_PERMISSION_INFO_ORDER,
	type PermissionSummaryCellKind,
} from '@/features/fileShare/sharePermissionConstants';


function renderPermissionSummaryCell(t: (key: string) => string, kind: PermissionSummaryCellKind): React.ReactNode {
	const base = 'nikki.drive.share.permissionSummary.cells';
	switch (kind) {
		case 'yes':
			return (
				<Group justify='center' gap={0}>
					<IconCheck
						size={18}
						stroke={2.5}
						color='var(--mantine-color-green-6)'
						aria-label={t(`${base}.yes`)}
					/>
				</Group>
			);
		case 'na':
			return <Text size='sm' component='span'>{t(`${base}.notApplicable`)}</Text>;
		case 'folderOnly':
			return (
				<Group justify='center' gap={0}>
					<IconFolder
						size={18}
						stroke={2.5}
						color='var(--mantine-color-yellow-6)'
						aria-label={t(`${base}.folderOnly`)}
					/>
				</Group>
			);
		case 'fileOrChild':
			return (
				<Group justify='center' gap={0}>
					<IconFile
						size={18}
						stroke={2.5}
						color='var(--mantine-color-gray-6)'
						aria-label={t(`${base}.fileOrChild`)}
					/>
					<IconArrowDown
						size={18}
						stroke={2.5}
						color='var(--mantine-color-gray-6)'
						aria-hidden
					/>
				</Group>
			);
	}
}

export function SharePermissionSummaryTable(): React.ReactNode {
	const { t } = useTranslation();
	return (
		<Stack gap='sm'>
			<Text size='sm' fw={600}>{t('nikki.drive.share.permissionSummary.title')}</Text>
			<Table striped highlightOnHover withTableBorder withColumnBorders w='100%'>
				<Table.Thead>
					<Table.Tr>
						<Table.Th miw={140} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
							{t('nikki.drive.share.permissionSummary.actionColumn')}
						</Table.Th>
						{SHARE_PERMISSION_INFO_ORDER.map((perm) => (
							<Table.Th key={perm} ta='center' style={{ verticalAlign: 'middle' }}>
								<Group justify='center' wrap='nowrap'>
									{PERMISSION_ICON[perm]}
								</Group>
							</Table.Th>
						))}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{PERMISSION_SUMMARY_ROWS.map((row) => (
						<Table.Tr key={row.rowKey}>
							<Table.Td fw={500} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
								{t(`nikki.drive.share.permissionSummary.rows.${row.rowKey}`)}
							</Table.Td>
							{row.cells.map((cell, index) => (
								<Table.Td key={index} ta='center' style={{ verticalAlign: 'middle' }}>
									{renderPermissionSummaryCell(t, cell)}
								</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</Stack>
	);
}
