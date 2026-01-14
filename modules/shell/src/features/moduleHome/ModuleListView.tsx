import { Accordion, Group } from '@mantine/core';
import clsx from 'clsx';
import { FC, useState } from 'react';

import { ModuleCard } from './ModuleCard';
import classes from './ModuleHomePage.module.css';



export const ModuleListView: FC<{ modules: any[] }> = ({ modules }) => {
	const [accordionValue, setAccordionValue] = useState<string[]>(
		modules.map((itm) => itm.key).slice(0, 2),
	);

	const items = modules.map((item) => (
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
	));

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