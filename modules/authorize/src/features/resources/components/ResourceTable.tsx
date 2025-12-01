import {
	ActionIcon,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Resource } from '../types';


export interface ResourceTableProps {
	columns: string[];
	resources: Resource[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (resourceName: string) => void;
	onEdit: (resourceName: string) => void;
	onDelete: (resourceId: string) => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
	columns,
	resources,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();
	return (
		<AutoTable
			columns={columns}
			data={resources as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row: Record<string, unknown>) => {
					const resourceName = row.name as string;
					return (
						<Text
							style={{ cursor: 'pointer', textDecoration: 'underline' }}
							onClick={(e) => {
								e.preventDefault();
								onViewDetail(resourceName);
							}}
						>
							{String(row.name || '')}
						</Text>
					);
				},
				actions: (row: Record<string, unknown>) => {
					const resourceId = row.id as string;
					const resourceName = row.name as string;
					return (
						<Group gap='xs' justify='flex-end'>
							<Tooltip label={translate('nikki.general.actions.edit')}>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onEdit(resourceName)}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={translate('nikki.general.actions.delete')}>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onDelete(resourceId)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			}}
		/>
	);
};


