import { Accordion, Center, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBoxOff } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useEffect, useMemo, useState } from 'react';

import { ModuleCard } from '../ModuleCard';
import classes from './ModuleListView.module.css';



export const ModuleListView: FC<{ modules: any[] }> = ({ modules }) => {
	const [accordionValue, setAccordionValue] = useState<string[]>([]);

	useEffect(() => {
		if (modules.length > 0) {
			setAccordionValue(modules.map((itm) => itm.key).slice(0, 2));
		}
		else {
			setAccordionValue([]);
		}
	}, [modules]);

	const items = useMemo(
		() => modules.map((item) => (
			<Accordion.Item key={item.key} value={item.key} className={clsx(classes.accordionItem)}>
				<Accordion.Control className={clsx(classes.accordionItemControl)}>
					{item.label}
				</Accordion.Control>
				<Accordion.Panel>
					<SimpleGrid
						cols={{ base: 3, xs: 4, sm: 5, md: 6}}
						// spacing={{ base: 'md', md: 'lg' }}
						spacing={3}
					>
						{item?.modules?.map((module: any, mIndex: number) => (
							<ModuleCard key={mIndex} module={module} />
						))}
					</SimpleGrid>
				</Accordion.Panel>
			</Accordion.Item>
		)),
		[modules],
	);

	if (modules.length === 0) {
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
		<Accordion
			multiple
			chevronPosition='left'
			variant='unstyled'
			value={accordionValue}
			onChange={setAccordionValue}
		>
			{items}
		</Accordion>
	);
};