import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export interface KioskSettingTableProps extends AutoTableProps {
	onViewDetail: (settingId: string) => void;
	onEdit?: (settingId: string) => void;
	onDelete?: (settingId: string) => void;
}

const NameColumn: React.FC<{ row: Record<string, unknown>; onView: (id: string) => void }> = ({ row, onView }) => {
	const navigate = useNavigate();
	const id = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (id) {
			navigate(`../kiosk-settings/${id}`);
		}
	};

	return (
		<Text
			c='light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))'
			fw={500}
			style={{ cursor: 'pointer' }}
			onClick={handleClick}
			td='underline'
		>
			{name}
		</Text>
	);
};

export const KioskSettingTable: React.FC<KioskSettingTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	return (
		<div style={{ position: 'relative' }}>
			<style>
				{`table th:last-child, table td:last-child { min-width: 120px; width: 120px; }`}
			</style>
			<AutoTable
				columns={columns}
				data={data}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={{
					code: (row) => <Text fw={500}>{String(row.code || '')}</Text>,
					name: (row) => <NameColumn row={row} />,
					description: (row) => <span style={{ maxWidth: 300, display: 'block' }}>{String(row.description || '-')}</span>,
					status: (row) => {
						const status = row.status as string;
						const statusMap: Record<string, { color: string; label: string }> = {
							active: { color: 'green', label: translate('nikki.general.status.active') },
							inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
						};
						const info = statusMap[status] || { color: 'gray', label: status };
						return <Badge color={info.color} size='sm'>{info.label}</Badge>;
					},
					actions: (row) => {
						const id = row.id as string;
						return (
							<Box style={{ minWidth: 120 }}>
								<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
									{onViewDetail && (
										<Tooltip label={translate('nikki.general.actions.view')}>
											<ActionIcon variant='subtle' color='blue' onClick={() => onViewDetail(id)}>
												<IconEye size={16} />
											</ActionIcon>
										</Tooltip>
									)}
									{onEdit && (
										<Tooltip label={translate('nikki.general.actions.edit')}>
											<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(id)}>
												<IconEdit size={16} />
											</ActionIcon>
										</Tooltip>
									)}
									{onDelete && (
										<Tooltip label={translate('nikki.general.actions.delete')}>
											<ActionIcon variant='subtle' color='red' onClick={() => onDelete(id)}>
												<IconTrash size={16} />
											</ActionIcon>
										</Tooltip>
									)}
								</Group>
							</Box>
						);
					},
				}}
				headerRenderers={{
					actions: (_c, _s) => <Text fw={600} fz='sm' ta='end'>{translate('nikki.general.actions.title')}</Text>,
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					onViewDetail(row.id as string);
					return '#';
				}}
			/>
		</div>
	);
};
