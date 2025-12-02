import { Box, Image, Button, Checkbox, Container, Flex,
	Input, Select, Text, Accordion, Card, Group, Menu, ActionIcon,
} from '@mantine/core';
import { IconDots, IconEye, IconFileZip, IconStar, IconStarFilled, IconTrash } from '@tabler/icons-react';
import { FC, useState } from 'react';


import classes from './ModuleHomePage.module.css';


export function ModuleHomePage(): React.ReactNode {
	return (
		<Box bg={`linear-gradient(135deg, var(--nikki-color-page-background), var(--nikki-color-page-background), var(--nikki-color-white))`} mih={'100%'} style={{}}>
			<Container pt={{'xl': 50, 'sm': 30, 'base': 20}} size={'lg'}>
				<Flex gap={'xl'}>
					<Box px={{'xl': 15, 'sm': 10}} display={{'base': 'none', 'sm': 'block'}}>
						<ModuleFilterPanel />
					</Box>
					<Box flex={1}>
						<ModuleSearchPanel />
						<ModuleList />
						<ModuleList />
						<ModuleList />
						<ModuleList />
						<ModuleList />
					</Box>
				</Flex>
			</Container>
		</Box>
	);
}

const ModuleFilterPanel: FC = () => {
	return (
		<Flex p={{'xl': 20, 'sm': 10}} bg={'var(--mantine-color-white)'} bdrs={'md'} direction={'column'} gap={'md'} className={classes.filterPanel}>
			<Checkbox color='var(--mantine-color-black)' onChange={() => {}} label='Show disabled modules' />
			<Checkbox color='var(--mantine-color-black)' onChange={() => {}} label='Show orphaned modules' />
			<Select
				label={<Text className='capitalize' size={'sm'} fw={700}>Sort by</Text>}
				placeholder='Pick value'
				data={['Name', 'Vue', 'Svelte']}
			/>
			<Select
				label={<Text className='capitalize' size={'sm'} fw={700}>Group by</Text>}
				placeholder='Pick value'
				data={['Category', 'Vue', 'Svelte']}
			/>
		</Flex>
	);
};

const ModuleSearchPanel: FC = () => {
	return (
		<Flex gap={'sm'} mb={20} justify={{'base': 'center', 'sm': 'flex-start'}}>
			<Input placeholder='Search modules' w={'100%'} maw={500} bd={'1px solid #868e96'} bdrs={'sm'} />
			<Button>Search</Button>
		</Flex>
	);
};

const ModuleList: FC = () => {
	const [moduleListByCategory, setModuleListByCategory] = useState<any[]>(mockModuleListByCategory);
	const [value, setValue] = useState<string[]>(moduleListByCategory.map(itm=>itm.key));


	const items = moduleListByCategory.map((item) => (
		<Accordion.Item key={item.key} value={item.key}>
			<Accordion.Control>{item.label}</Accordion.Control>
			<Accordion.Panel>
				<Group justify='start' align='start' gap={'lg'}>
					{item?.modules?.map((module: any) => (
						<ModuleCard key={module.slug} module={module} />
					))}
				</Group>
			</Accordion.Panel>
		</Accordion.Item>
	));

	return (
		<Accordion multiple chevronPosition='left' variant='unstyled' value={value} onChange={setValue}>
			{items}
		</Accordion>
	);
};



const ModuleCard: FC<{ module: any }> = ({ module }) => {

	return (
		<Card radius='sm' className={classes.cardHover} w={100} mih={100} p={0} bg={'transparent'}>
			<Button pos='absolute' top={-5} left={0} variant='transparent' p={2}>
				<IconStarFilled size={18} color='var(--mantine-color-yellow-4)' />
			</Button>

			<Box pos='absolute' top={0} right={0} style={{zIndex: 100}}>
				<Menu withinPortal position='bottom-start' shadow='sm'>
					<Menu.Target>
						<ActionIcon variant='subtle' color='gray' className={classes.actionBtn}>
							<IconDots size={16} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item>
							Unfavorite
						</Menu.Item>
						<Menu.Item>
							Disable
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Box>

			<Card.Section>
				<Box>
					<Image mx='auto' w={80} h={80} alt='no image' src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png' />
				</Box>
			</Card.Section>

			<Box p={5} bg={'red'}>
				<Text c='var(--mantine-color-text)' size='sm' ta='center' bg={'blue'} lineClamp={2}>
					{module.name}
				</Text>
			</Box>
		</Card>
	);
};



const mockModuleListByCategory: any[] = [
	{
		key: 'favouritesAndRecentlyUsed',
		label: 'Favourites and Recently Used',
		modules: [
			{
				name: 'Essential',
				slug: 'essential',
				category: 'Essential',
				icon: 'icon-essential',
				isDisabled: false,
				isOrphaned: false,
				isFavourite: true,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Identity',
				slug: 'identity',
				category: 'Identity',
				icon: 'icon-identity',
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Inventory',
				slug: 'inventory',
				category: 'Inventory',
				icon: 'icon-inventory',
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Sales',
				slug: 'sales',
				category: 'Sales',
				icon: 'icon-sales',
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Purchase',
				slug: 'purchase',
				category: 'Purchase',
				icon: 'icon-purchase',
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'coreBusiness',
		label: 'Core Business Operations (2)',
		modules: [
			{
				name: 'File Drive',
				slug: 'file-drive',
				category: 'File Drive',
				icon: 'icon-file-drive',
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'HR Management',
				slug: 'hr-management',
				category: 'HR Management',
				icon: 'icon-hr-management',
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Asset Management',
				slug: 'asset-management',
				category: 'Asset Management',
				icon: 'icon-asset-management',
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
];
