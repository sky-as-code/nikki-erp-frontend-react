import { Avatar, Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { ListBadge, StatusBadge } from '../../../../components/Badge';
import { StatusConfig } from '../../../../components/Badge/StatusBadge';
import { User } from '../../types';


interface UserTableProps {
	columns: string[];
	users: User[];
	isLoading: boolean;
	schema: ModelSchema;
}

export function UserTable({ columns, users, isLoading, schema }: UserTableProps): React.ReactElement {
	const statusConfig: Record<string, StatusConfig> = {
		active: { color: 'green', translationKey: 'nikki.identity.user.status.active' },
		locked: { color: 'red', translationKey: 'nikki.identity.user.status.locked' },
		archived: { color: 'yellow', translationKey: 'nikki.identity.user.status.archived' },
	};

	const columnRenderers = {
		avatar: (row: Record<string, unknown>) => {
			const user = row as User;
			return <Avatar src={user.avatarUrl} name={user.displayName} size={40} radius='xl' />;
		},
		status: (row: Record<string, unknown>) => {
			const user = row as User;
			return (
				<StatusBadge
					value={user.status}
					configMap={statusConfig}
					variant='light'
					size='sm'
				/>
			);
		},
		groups: (row: Record<string, unknown>) => {
			const user = row as User;
			return (
				<ListBadge
					items={user.groups}
					color='blue'
					variant='light'
					size='sm'
					emptyText='-'
				/>
			);
		},
	};

	return (
		<Paper className='p-4'>
			<AutoTable
				columns={columns}
				columnAsLink='email'
				data={users}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={columnRenderers}
			/>
		</Paper>
	);
}
