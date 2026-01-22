import {
	Box,
	Button,
	Text,
	Menu,
	Image,
	Stack,
	Flex,
	Divider,
} from '@mantine/core';
import { IconDots, IconStarFilled, IconAugmentedReality } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import classes from './ModuleCard.module.css';


export const ModuleCard: FC<{ module: any }> = ({ module }) => {
	const navigate = useNavigate();
	const { orgSlug } = useParams();
	const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

	return (
		<Stack
			className={clsx(classes.moduleCard, isActionMenuOpen && classes.moduleCardHover)}
			pos='relative' justify='start' align='center' gap={0} w={110}
			onClick={() => {
				navigate(`/${orgSlug}/${module.slug}`);
			}}
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

type ModuleCardContentProps = {
	module: any,
	isActionMenuOpen: boolean,
	setIsActionMenuOpen: (value: boolean) => void
};
const ModuleCardContent: FC<ModuleCardContentProps> = ({ module, isActionMenuOpen, setIsActionMenuOpen }) => {
	const [imageError, setImageError] = useState(false);

	return (
		<Box
			pos='relative' h={90} w={90} p={5}
			className={clsx(classes.moduleCardInner)}
		>
			{imageError || !module.icon ? (
				<FallbackModuleIcon />
			) : (
				<Image
					h={'100%'} w={'100%'} radius='md' fit='contain' bg='transparent'
					src={module.icon || ''} alt={module.name || 'no image'}
					onError={() => setImageError(true)}
				/>
			)}

			<FavoriteButton />
			<ModuleCardMenu
				module={module}
				isActionMenuOpen={isActionMenuOpen}
				setIsActionMenuOpen={setIsActionMenuOpen}
			/>
		</Box>

	);
};


type ModuleCardMenuProps = {
	module: any,
	isActionMenuOpen: boolean,
	setIsActionMenuOpen: (value: boolean) => void
};
const ModuleCardMenu: FC<ModuleCardMenuProps> = ({ module, isActionMenuOpen, setIsActionMenuOpen }) => {
	const { orgSlug } = useParams();

	return (
		<Menu
			withinPortal shadow='sm' width={200}
			position='bottom-start'
			opened={isActionMenuOpen}
			onChange={setIsActionMenuOpen}
		>
			<Menu.Target>
				<Button
					variant='outline'
					pos='absolute' top={2} right={2}
					h={24} w={24} px={2} py={1}
					style={{ zIndex: 100 }}
					className={clsx(classes.actionBtn)}
					onClick={(e) => {
						e.stopPropagation();
						setIsActionMenuOpen(!isActionMenuOpen);
					}}
				>
					<IconDots size={16} />
				</Button>
			</Menu.Target>

			<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
				<Menu.Item>Unfavorite</Menu.Item>
				<Menu.Item>Disable</Menu.Item>
				<Divider />
				<Menu.Item component='a' href={`/${orgSlug}/${module?.slug}`} target='_blank'>Open in new tab</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

const FavoriteButton: FC = () => {
	return (
		<Button
			variant='transparent'
			pos='absolute' top={1} left={1}
			h={24} w={24} p={0}
		>
			<IconStarFilled size={18} color='var(--mantine-color-yellow-4)' />
		</Button>
	);
};

const FallbackModuleIcon: FC = () => {
	return (
		<Flex
			component='div'
			align='center' justify='center' h={'100%'} w={'100%'}
		>
			<IconAugmentedReality
				size={56}
				color='var(--mantine-color-gray-5)'
			/>
		</Flex>
	);
};


const getModuleName = (name: string) => {
	return name.length > 20 ? name.slice(0, 20) + '...' : name;
};
const ModuleCardFooter: FC<{ module: any }> = ({ module }) => {
	return (
		<Box py={8} px={4}>
			<Text
				size='sm' ta='center'
				c='var(--mantine-color-text)' fw={500}
				// lineClamp={2}
			>
				{getModuleName(module.name)}
			</Text>
		</Box>
	);
};