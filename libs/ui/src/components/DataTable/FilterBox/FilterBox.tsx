import { Badge, Box, Group } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconFilter } from '@tabler/icons-react';
import React from 'react';

import { useTranslate } from '../../../i18n';
import { Button } from '../../Button';

import type { DataTableTestIds } from '../testIds';


export type FilterBoxProps = {
	/** Total active conditions. Drives the applied-state chip. */
	activeCount: number,
	expanded: boolean,
	onToggle: () => void,
	tid: DataTableTestIds,
};

/**
 * The Filters trigger button.
 *
 * Only the button: the pane it controls is rendered by `DataTableLayout`, between the controls
 * row and the table, so it pushes the rows down instead of overlapping them. Keeping the two
 * apart is what lets the pane span the table's full width while the button stays in the
 * right-aligned controls group.
 */
export function FilterBox(props: FilterBoxProps): React.ReactNode {
	const t = useTranslate('common');
	const hasFilters = props.activeCount > 0;

	return (
		<Box className='relative grow basis-0'>
			<Group justify='flex-end' gap='xs'>
				<Button
					variant={props.expanded || hasFilters ? 'light' : 'default'}
					onClick={props.onToggle}
					leftSection={hasFilters
						? <Badge size='sm' circle variant='filled'>{props.activeCount}</Badge>
						: <IconFilter size={16} />}
					rightSection={props.expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
					aria-expanded={props.expanded}
					{...props.tid.filterToggle()}
				>
					{hasFilters ? t('search.filtersApplied') : t('search.filters')}
				</Button>
			</Group>
		</Box>
	);
}
