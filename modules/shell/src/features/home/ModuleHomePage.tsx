import { Box, Image, Button, Checkbox, Container, Flex, Input, Select, Text, Accordion, Card, Group, Menu, ActionIcon} from '@mantine/core';
import { IconDots, IconEye, IconFileZip, IconTrash } from '@tabler/icons-react';
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
				<Group>
					{item?.modules?.map((module: any) => (
					// <Link key={module.slug} to={module.slug} className='block' style={{ textDecoration: 'none' }}>
					// 	<Text className='text-blue-500 py-4 border-b border-blue-500'>{module.name}</Text>
					// </Link>
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
		<Card withBorder shadow='sm' radius='md' className={classes.cardHover} w={100} h={100}>
			<Card.Section withBorder inheritPadding py='xs'>
				<Group justify='space-between' align='center'>
					<Menu withinPortal position='bottom-end' shadow='sm'>
						<Menu.Target>
							<ActionIcon variant='subtle' color='gray' className={classes.actionBtn}>
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item leftSection={<IconFileZip size={14} />}>
								Download zip
							</Menu.Item>
							<Menu.Item leftSection={<IconEye size={14} />}>
								Preview all
							</Menu.Item>
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								color='red'
							>
								Delete all
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Card.Section>


			<Card.Section mt='sm'>
				<Image width={50} height={50} alt='no image' src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png' />
			</Card.Section>

			<Text mt='sm' c='dimmed' size='sm'>
				{module.name}
			</Text>
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
