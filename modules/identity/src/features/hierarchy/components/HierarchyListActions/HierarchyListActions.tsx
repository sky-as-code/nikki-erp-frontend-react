import { Button, Group, SegmentedControl } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React from 'react';


interface HierarchyListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
	view: 'table' | 'orgChart';
	onViewChange: (view: 'table' | 'orgChart') => void;
}

export function HierarchyListActions({
	onCreate, onRefresh, view, onViewChange,
}: HierarchyListActionsProps): React.ReactElement {
	return (
		<Group justify='space-between'>
			<Group>
				<Button
					size='compact-md'
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
				>
					Create
				</Button>
				<Button
					size='compact-md'
					variant='outline'
					leftSection={<IconRefresh size={16} />}
					onClick={onRefresh}
				>
					Refresh
				</Button>
			</Group>
			<SegmentedControl
				value={view}
				onChange={(value) => onViewChange(value as 'table' | 'orgChart')}
				data={[
					{ label: 'Table', value: 'table' },
					{ label: 'Org Chart', value: 'orgChart' },
				]}
			/>
		</Group>
	);
}
