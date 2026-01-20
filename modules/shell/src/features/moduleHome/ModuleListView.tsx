import { Accordion, Center, Group, Stack, Text } from '@mantine/core';
import { IconBoxOff } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useEffect, useMemo, useState } from 'react';

import { ModuleCard } from './ModuleCard';
import classes from './ModuleHomePage.module.css';



export const ModuleListView: FC<{ modules: any[] }> = ({ modules }) => {
	const [accordionValue, setAccordionValue] = useState<string[]>([]);

	// Reset accordion when modules change
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
					<Group justify='start' align='start' gap={'xs'}>
						{item?.modules?.map((module: any) => (
							<ModuleCard key={module.slug} module={module} />
						))}
					</Group>
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