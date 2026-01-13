import {
	Box,
	Button,
	Checkbox,
	Container,
	Flex,
	Input,
	Select,
	Text,
	Accordion,
	Group,
	TextInput,
	createTheme,
	MantineProvider,
	SimpleGrid,
} from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useState } from 'react';

import { mockModules as mockModuleListByCategory } from './mockModules';
import { ModuleCard } from './ModuleCard';
import classes from './ModuleHomePage.module.css';



type ViewMode = 'grid' | 'group-list';

export function ModuleHomePage(): React.ReactNode {
	const [viewMode, setViewMode] = useState<ViewMode>('group-list');

	return (
		<Box className={classes.homeContent}>
			<Container pt={{ xl: 30, sm: 20, base: 10 }} size={'lg'} pb={'xl'} h={'100%'}>
				<Flex gap={'lg'} h={'100%'}>
					<Box px={{ xl: 15, sm: 10 }} display={{ base: 'none', sm: 'block' }}>
						<ModuleFilterPanel viewMode={viewMode} onViewModeChange={setViewMode} />
					</Box>
					<Flex direction='column' gap={'lg'} flex={1}>
						<ModuleSearchPanel />
						<Box h={'100%'} p={'md'}>
							<ModuleList viewMode={viewMode} />
						</Box>
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
}

const ModuleFilterPanel: FC<{ viewMode: ViewMode; onViewModeChange: (mode: ViewMode) => void }> = ({
	viewMode,
	onViewModeChange,
}) => {
	return (
		<Flex
			p={{ xl: 30, sm: 15 }}
			bg={'var(--mantine-color-white)'}
			bdrs={'md'}
			direction={'column'}
			gap={'lg'}
			className={classes.filterPanel}
		>
			<Box>
				<Text className='capitalize' size={'sm'} fw={700} mb={'xs'}>
					View Mode
				</Text>
				<Button.Group>
					<Button
						variant={viewMode === 'group-list' ? 'filled' : 'default'}
						size='sm'
						onClick={() => onViewModeChange('group-list')}
						flex={1}
					>
						<IconList size={16} />
					</Button>
					<Button
						variant={viewMode === 'grid' ? 'filled' : 'default'}
						size='sm'
						onClick={() => onViewModeChange('grid')}
						flex={1}
					>
						<IconLayoutGrid size={16} />
					</Button>
				</Button.Group>
			</Box>
			<Checkbox
				color='var(--mantine-color-black)'
				onChange={() => {}}
				label='Show disabled modules'
			/>
			<Checkbox
				color='var(--mantine-color-black)'
				onChange={() => {}}
				label='Show orphaned modules'
			/>
			<Select
				label={
					<Text className='capitalize' size={'sm'} fw={700}>
						Sort by
					</Text>
				}
				placeholder='Pick value'
				data={['Name', 'Commonly used']}
			/>
			<Select
				label={
					<Text className='capitalize' size={'sm'} fw={700}>
						Group by
					</Text>
				}
				placeholder='Pick value'
				data={['Category', 'Status']}
			/>
		</Flex>
	);
};

const ModuleSearchPanel: FC = () => {
	const theme = createTheme({
		components: {
			Input: Input.extend({
				classNames: {
					input: classes.searchInput,
				},
			}),
		},
	});

	const [value, setValue] = useState<string>('');

	return (
		<Flex gap={'sm'} justify={{ base: 'center', sm: 'flex-center' }} px={'md'}>
			<MantineProvider theme={theme}>
				<TextInput
					placeholder='Search modules'
					size='sm'
					flex={1}
					w={'100%'}
					// maw={500}
					value={value}
					onChange={(event) => setValue(event.currentTarget.value)}
					rightSection={value !== '' ? <Input.ClearButton onClick={() => setValue('')} /> : undefined}
					rightSectionPointerEvents='auto'
				/>
			</MantineProvider>
			<Button size='sm'>Search</Button>
		</Flex>
	);
};

const GridView: FC<{ moduleListByCategory: any[] }> = ({ moduleListByCategory }) => {
	// Flatten all modules from all categories for grid view
	const allModules = moduleListByCategory.flatMap((category) =>
		category.modules.map((module: any) => ({
			...module,
			categoryLabel: category.label,
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

const GroupListView: FC<{ moduleListByCategory: any[] }> = ({ moduleListByCategory }) => {
	const [accordionValue, setAccordionValue] = useState<string[]>(
		moduleListByCategory.map((itm) => itm.key).slice(0, 2),
	);

	// Group list view (default)
	const items = moduleListByCategory.map((item) => (
		<Accordion.Item key={item.key} value={item.key} className={classes.accordionItem}>
			<Accordion.Control className={classes.accordionItemControl}>
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

const ModuleList: FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
	const [moduleListByCategory] = useState<any[]>(
		mockModuleListByCategory,
	);

	if (viewMode === 'grid') {
		return <GridView moduleListByCategory={moduleListByCategory} />;
	}
	return <GroupListView moduleListByCategory={moduleListByCategory} />;
};

