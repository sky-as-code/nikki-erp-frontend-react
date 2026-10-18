import { Stack } from '@mantine/core';
import { FC } from 'react';

import { ModuleRow } from './ModuleRow';
import { ModuleGroups } from '../ModuleGroups/ModuleGroups';

import type { ModuleGroup } from '../../moduleHomeModel';


export const ModuleListView: FC<{ groups: ModuleGroup[] }> = ({ groups }) => (
	<ModuleGroups
		groups={groups}
		renderGroup={(group) => (
			<Stack gap={2}>
				{group.modules.map((module) => <ModuleRow key={module.slug} module={module} />)}
			</Stack>
		)}
	/>
);
