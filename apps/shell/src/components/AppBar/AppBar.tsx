'use client';

import {
	Group,
	Menu,
	Button,
	rem,
	Box,
	Container,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { FC } from 'react';

export const AppBar: FC = () => {
	return (
		<Box visibleFrom='md'>
			<Container size='lg'>
				<Group justify='space-between'>
					<Group gap='md'>
						<ProductsMenu />
						<ServicesMenu />
						<Button variant='subtle'>About</Button>
						<Button variant='subtle'>Contact</Button>
					</Group>
				</Group>
			</Container>
		</Box>
	);
};

const ProductsMenu: FC = () => (
	<Menu shadow='md' width={200} position='bottom-start'>
		<Menu.Target>
			<Button variant='subtle' rightSection={<IconChevronDown style={{ width: rem(16) }} />}>
				Products
			</Button>
		</Menu.Target>
		<Menu.Dropdown>
			<Menu.Item>Product A</Menu.Item>
			<Menu.Item>Product B</Menu.Item>
			<Menu.Item>Product C</Menu.Item>
		</Menu.Dropdown>
	</Menu>
);

const ServicesMenu: FC = () => (
	<Menu shadow='md' width={200} position='bottom-start'>
		<Menu.Target>
			<Button variant='subtle' rightSection={<IconChevronDown style={{ width: rem(16) }} />}>
				Services
			</Button>
		</Menu.Target>
		<Menu.Dropdown>
			<Menu.Item>Consulting</Menu.Item>
			<Menu.Item>Implementation</Menu.Item>
			<Menu.Item>Support</Menu.Item>
		</Menu.Dropdown>
	</Menu>
);
