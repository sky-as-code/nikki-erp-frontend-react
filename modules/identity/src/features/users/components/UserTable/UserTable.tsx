import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { InitialAvatar } from '../../../../components/Avatar';
import { StatusBadge, StatusConfig } from '../../../../components/StatusBadge';
import { TextBadge } from '../../../../components/TextBadge';
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
			return <InitialAvatar avatarUrl={user.avatarUrl} displayName={user.displayName || user.email} />;
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
				<TextBadge
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
