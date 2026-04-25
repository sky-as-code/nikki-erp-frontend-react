import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';
import { useLocation } from 'react-router';


import { StatusConfig, StatusBadge } from '../../../../components/Badge/StatusBadge';
import { ORGANIZATION_SCHEMA_NAME } from '../../../../constants';
import { Organization } from '../../types';


export interface OrganizationTableProps {
	organizations: Organization[];
	isLoading: boolean;
}

export function OrganizationTable({
	organizations,
	isLoading,
}: OrganizationTableProps): React.ReactElement {
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
				schemaName={ORGANIZATION_SCHEMA_NAME}
				columnAsLink='displayName'
				columnAsLinkHref={(row) => `${location.pathname}/${row.slug}`}
				columnRenderers={columnRenderers}
				data={organizations}
				isLoading={isLoading}
			/>
		</Paper>
	);
}
