import {
	Box,
	Button,
	Text,
	Menu,
	Image,
	Stack,
	Flex,
} from '@mantine/core';
import { IconDots, IconStarFilled, IconAugmentedReality } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useState } from 'react';

import classes from './ModuleHomePage.module.css';


export const ModuleCard: FC<{ module: any }> = ({ module }) => {
	const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

	return (
		<Stack
			className={clsx(classes.moduleCard, isActionMenuOpen && classes.moduleCardHover)}
			pos='relative'
			justify='start'
			align='center'
			w={110}
			gap={0}
		>
			<ModuleCardContent
				module={module}
				isActionMenuOpen={isActionMenuOpen}
				setIsActionMenuOpen={setIsActionMenuOpen}
			/>
			<ModuleCardFooter module={module} />
		</Stack>
	);
};

const ModuleCardContent: FC<{
	module: any,
	isActionMenuOpen: boolean,
	setIsActionMenuOpen: (value: boolean) => void }>
	= ({ module, isActionMenuOpen, setIsActionMenuOpen }) => {
		const [imageError, setImageError] = useState(false);

		return (
			<Box
				className={clsx(classes.moduleCardInner)}
				pos='relative'
				h={90}
				w={90}
				p={5}
			>
				{imageError || !module.icon ? (
					<FallbackModuleIcon />
				) : (
					<Image
						w={'100%'}
						h={'100%'}
						radius='md'
						fit='contain'
						bg='transparent'
						src={module.icon || ''}
						alt={module.name || 'no image'}
						onError={() => setImageError(true)}
					/>
				)}

				<Button
					pos='absolute'
					top={1}
					left={1}
					variant='transparent'
					h={24}
					w={24}
					p={0}
					size='xs'
				>
					<IconStarFilled size={18} color='var(--mantine-color-yellow-4)' />
				</Button>

				<Menu
					withinPortal
					shadow='sm'
					position='bottom-start'
					opened={isActionMenuOpen}
					onChange={setIsActionMenuOpen}
					// trigger='hover'
				>
					<Menu.Target>
						<Button
							onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
							pos='absolute'
							top={2}
							right={2}
							h={24}
							w={24}
							px={2}
							py={1}
							variant='outline'
							size='xs'
							style={{ zIndex: 100 }}
							className={clsx(classes.actionBtn)}
						>
							<IconDots size={16} />
						</Button>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item>Unfavorite</Menu.Item>
						<Menu.Item>Disable</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Box>

		);
	};

const FallbackModuleIcon: FC = () => {
	return (
		<Flex
			w={'100%'}
			h={'100%'}
			component='div'
			align='center'
			justify='center'
		>
			<IconAugmentedReality
				size={56}
				color='var(--mantine-color-gray-5)'
			/>
		</Flex>
	);
};

const ModuleCardFooter: FC<{ module: any }> = ({ module }) => {
	return (
		<Box py={8} px={4}>
			<Text
				c='var(--mantine-color-text)'
				size='sm'
				ta='center'
				fw={500}
				// lineClamp={2}
			>
				{module.name.length > 20 ? module.name.slice(0, 20) + '...' : module.name}
			</Text>
		</Box>
	);
};