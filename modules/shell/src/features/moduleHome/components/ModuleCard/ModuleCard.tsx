import { Anchor, Box, Button, Text, Menu, Stack, Flex } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useModuleAccess } from '@nikkierp/shell/erpModules';
import { ModuleIcon } from '@nikkierp/ui/components';
import { IconDots } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router';

import classes from './ModuleCard.module.css';

import type { ModuleCardItem } from '../../hooks/useQueryModule';


/** Every card names itself by module slug, so several cards on the grid stay distinguishable. */
const TEST_ID = 'shell.moduleCard';
const UNAUTHORIZED_PATH = '/unauthorized';


/** A module the user holds nothing in stays listed, but opens the No Permission page. */
function useModuleTargetPath(module: ModuleCardItem): string {
	const { isPending, canAccess } = useModuleAccess();
	const modulePath = `/${module.slug}`;
	// While the user context loads, the route guard in ShellRoutes makes the same decision.
	if (isPending || canAccess({ name: module.slug, model_prefix: module.modelPrefix })) {
		return modulePath;
	}
	return UNAUTHORIZED_PATH;
}

export const ModuleCard: FC<{ module: ModuleCardItem }> = ({ module }) => {
	const navigate = useNavigate();
	const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
	const targetPath = useModuleTargetPath(module);

	return (
		<Anchor
			href={targetPath}
			className={clsx(classes.moduleCard, isActionMenuOpen && classes.moduleCardHover)}
			pos='relative' w='100%' underline='never'
			onClick={(evt) => {
				evt.preventDefault();
				navigate(targetPath);
			}}
			{...testAttrs(TEST_ID, module.slug)}
		>
			<Stack justify='start' align='center' gap={0} w='100%'>
				<ModuleCardContent
					module={module}
					targetPath={targetPath}
					isActionMenuOpen={isActionMenuOpen}
					setIsActionMenuOpen={setIsActionMenuOpen}
				/>
				<ModuleCardFooter module={module} />
			</Stack>
		</Anchor>
	);
};

type ModuleCardContentProps = {
	module: ModuleCardItem,
	targetPath: string,
	isActionMenuOpen: boolean,
	setIsActionMenuOpen: (value: boolean) => void,
};
const ModuleCardContent: FC<ModuleCardContentProps> = ({
	module, targetPath, isActionMenuOpen, setIsActionMenuOpen,
}) => {
	return (
		<Flex justify='center' align='start' w={'100%'} p={10}>
			<Box
				pos='relative' w={'100%'} maw={90} p={5}
				className={clsx(classes.moduleCardInner)}
			>
				<ModuleIcon h={'100%'} w={'100%'} radius='md' name={module.slug} alt={module.name} />

				<ModuleCardMenu
					module={module}
					targetPath={targetPath}
					isActionMenuOpen={isActionMenuOpen}
					setIsActionMenuOpen={setIsActionMenuOpen}
				/>
			</Box>
		</Flex>
	);
};


type ModuleCardMenuProps = {
	module: ModuleCardItem,
	targetPath: string,
	isActionMenuOpen: boolean,
	setIsActionMenuOpen: (value: boolean) => void,
};
// Favorite and disable are not offered: the backend module list carries neither.
const ModuleCardMenu: FC<ModuleCardMenuProps> = ({
	module, targetPath, isActionMenuOpen, setIsActionMenuOpen,
}) => {
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
					{...testAttrs(TEST_ID, module.slug, 'actionMenu')}
				>
					<IconDots size={16} />
				</Button>
			</Menu.Target>

			<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
				<Menu.Item
					component='a' href={targetPath} target='_blank'
					{...testAttrs(TEST_ID, module.slug, 'openInNewTab')}
				>
					Open in new tab
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

const ModuleCardFooter: FC<{ module: ModuleCardItem }> = ({ module }) => {
	return (
		<Box py={8} px={4} w='100%'>
			<Text
				size='sm' ta='center' fw={500}
				c='var(--mantine-color-text)'
				style={{
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				}}
			>
				{module.name}
			</Text>
		</Box>
	);
};