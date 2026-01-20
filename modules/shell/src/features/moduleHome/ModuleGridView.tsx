import { Center, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBoxOff } from '@tabler/icons-react';
import { FC, useMemo } from 'react';

import { ModuleCard } from './ModuleCard';


export const ModuleGridView: FC<{ modules: any[] }> = ({ modules }) => {
	const allModules = useMemo(
		() => modules.flatMap((moduleByCategory: any) =>
			moduleByCategory.modules.map((module: any) => ({
				...module,
				categoryLabel: moduleByCategory.label,
			})),
		),
		[modules],
	);

	if (allModules.length === 0) {
		return (
			<Center h={'100%'} p={'xl'}>
				<Stack align='center' gap='md'>
					<IconBoxOff size={64} stroke={1.5} style={{ color: 'var(--mantine-color-gray-5)' }} />
					<Text c='dimmed' size='lg' fw={500}>
						No modules found
					</Text>
					<Text c='dimmed' size='sm' ta='center'>
						Try adjusting your search or filter criteria
					</Text>
				</Stack>
			</Center>
		);
	}

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