import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useLocation } from 'react-router';

import { StatusBadge, StatusConfig } from '../../../../components/StatusBadge';
import { Organization } from '../../types';


export interface OrganizationTableProps {
	columns: string[];
	organizations: Organization[];
	isLoading: boolean;
	schema: ModelSchema;
}

export function OrganizationTable({ columns, organizations, isLoading, schema }: OrganizationTableProps): React.ReactElement {
	const statusConfig: Record<string, StatusConfig> = {
		active: { color: 'green', translationKey: 'nikki.identity.organization.status.active' },
		inactive: { color: 'gray', translationKey: 'nikki.identity.organization.status.inactive' },
	};

	const columnRenderers = {
		status: (row: Record<string, unknown>) => (
			<StatusBadge
				value={String(row.status)}
				configMap={statusConfig}
				variant='light'
				size='sm'
			/>
		),
	};

	const location = useLocation();

	return (
		<Paper className='p-4'>
			<AutoTable
				columns={columns}
				columnAsLink='displayName'
				columnAsLinkHref={(row) => `${location.pathname}/${row.slug}`}
				columnRenderers={columnRenderers}
				data={organizations}
				isLoading={isLoading}
				schema={schema}
			/>
		</Paper>
	);
}
