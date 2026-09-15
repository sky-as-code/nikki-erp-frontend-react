import { SegmentedControl, Tooltip } from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import React from 'react';

import { writeStoredViewMode } from './DataTable';
import { useDataTableContext } from './DataTableContext';
import { isDataTableViewMode } from './types';
import { useTranslate } from '../../i18n';

import type { DataTableViewMode } from './types';


/**
 * The list/grid switch, beside the pagination controls.
 *
 * Icon-only to keep the controls row short, so each item carries both a tooltip and an
 * `aria-label`: the tooltip is a pointer affordance and never reaches a screen reader as the
 * control's name.
 *
 * Unlike the settings modal's controls this applies immediately rather than on an Apply — it is a
 * view switch, not a setting, and the result is visible the moment it is clicked.
 */
export function ViewModeToggle(): React.ReactNode {
	const context = useDataTableContext();
	const t = useTranslate('common');

	const onChange = React.useCallback((value: string) => {
		if (!isDataTableViewMode(value)) {
			return;
		}
		context.setViewMode(value);
		writeStoredViewMode(value);
	}, [context]);

	const data = React.useMemo(() => [
		viewModeItem('list', t('datatable.list'), <IconList size={16} />),
		viewModeItem('grid', t('datatable.grid'), <IconLayoutGrid size={16} />),
	], [t]);

	return (
		<SegmentedControl
			data={data}
			onChange={onChange}
			size='xs'
			value={context.viewMode}
			{...context.tid.settingsViewMode(context.viewMode)}
		/>
	);
}

function viewModeItem(mode: DataTableViewMode, label: string, icon: React.ReactNode) {
	return {
		value: mode,
		label: (
			<Tooltip label={label}>
				<span aria-label={label} className='flex items-center justify-center' role='img'>
					{icon}
				</span>
			</Tooltip>
		),
	};
}
