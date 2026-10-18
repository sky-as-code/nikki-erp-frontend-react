import { SimpleGrid } from '@mantine/core';
import { FC } from 'react';

import { ModuleCard } from '../ModuleCard';
import { ModuleGroups } from '../ModuleGroups/ModuleGroups';

import type { ModuleGroup } from '../../moduleHomeModel';


export const ModuleGridView: FC<{ groups: ModuleGroup[] }> = ({ groups }) => (
	<ModuleGroups
		groups={groups}
		renderGroup={(group) => (
			<SimpleGrid cols={{ base: 3, xs: 4, sm: 5, md: 6 }} spacing={3}>
				{group.modules.map((module) => <ModuleCard key={module.slug} module={module} />)}
			</SimpleGrid>
		)}
	/>
);
