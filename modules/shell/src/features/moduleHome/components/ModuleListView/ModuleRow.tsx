import { Anchor, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Link, ModuleIcon } from '@nikkierp/ui/components';
import { FC } from 'react';

import { ModuleEntryMenu, moduleEntryClasses as classes, useModuleEntry } from '../ModuleEntry';

import type { ModuleCardItem } from '../../moduleHomeModel';


const TEST_ID = 'shell.moduleRow';


/** Same anchor-then-button order and button visibility as the grid card. */
export const ModuleRow: FC<{ module: ModuleCardItem }> = ({ module }) => {
	const entry = useModuleEntry(module, classes.row);

	return (
		<div className={entry.wrapperClassName}>
			<Anchor
				component={Link} isHistoryRoot to={entry.targetPath}
				className={classes.rowAnchor} underline='never'
				{...testAttrs(TEST_ID, module.slug)}
			>
				<ModuleIcon w={32} h={32} radius='sm' className={classes.icon} name={module.slug} alt='' />
				<Text size='sm' fw={500} className={classes.name}>{module.name}</Text>
			</Anchor>
			<ModuleEntryMenu
				module={module} targetPath={entry.targetPath} testIdPrefix={TEST_ID}
				opened={entry.menuOpened} onChange={entry.setMenuOpened}
			/>
		</div>
	);
};
