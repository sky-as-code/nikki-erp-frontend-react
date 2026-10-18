import { Anchor, Box, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ModuleIcon } from '@nikkierp/ui/components';
import { FC } from 'react';
import { Link } from 'react-router';

import { ModuleEntryMenu, moduleEntryClasses as classes, useModuleEntry } from '../ModuleEntry';

import type { ModuleCardItem } from '../../moduleHomeModel';


/** Every card names itself by module slug, so several cards on the grid stay distinguishable. */
const TEST_ID = 'shell.moduleCard';


/** Anchor first, its menu button second: that DOM order is the tab order. */
export const ModuleCard: FC<{ module: ModuleCardItem }> = ({ module }) => {
	const entry = useModuleEntry(module);

	return (
		<div className={entry.wrapperClassName}>
			<Anchor
				component={Link} to={entry.targetPath}
				className={classes.anchor} underline='never'
				{...testAttrs(TEST_ID, module.slug)}
			>
				<Box p={10}>
					<Box mx='auto' maw={90} p={5} className={classes.cardIconBox}>
						<ModuleIcon
							h='100%' w='100%' radius='md' className={classes.icon}
							name={module.slug} alt=''
						/>
					</Box>
				</Box>
				<Text size='sm' ta='center' fw={500} px={4} pb={8} className={classes.name}>
					{module.name}
				</Text>
			</Anchor>
			<ModuleEntryMenu
				module={module} targetPath={entry.targetPath} testIdPrefix={TEST_ID}
				opened={entry.menuOpened} onChange={entry.setMenuOpened}
				className={classes.cardMenuButton}
			/>
		</div>
	);
};
