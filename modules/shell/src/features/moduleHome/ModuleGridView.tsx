import { SimpleGrid } from '@mantine/core';
import { FC } from 'react';

import { ModuleCard } from './ModuleCard';


export const ModuleGridView: FC<{ modules: any[] }> = ({ modules }) => {
	const allModules = modules.flatMap((moduleByCategory: any) =>
		moduleByCategory.modules.map((module: any) => ({
			...module,
			categoryLabel: moduleByCategory.label,
		})),
	);

	return (
		<SimpleGrid
			cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			p={'sm'}
		>
			{allModules.map((module: any) => (
				<ModuleCard key={`${module.categoryLabel}-${module.slug}`} module={module} />
			))}
		</SimpleGrid>
	);
};