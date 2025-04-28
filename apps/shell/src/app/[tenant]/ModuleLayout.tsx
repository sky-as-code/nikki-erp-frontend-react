'use client';

import { Box, Breadcrumbs } from '@mantine/core';
import clsx from 'classnames';

import classes from './ModuleLayout.module.css';

import { useUIState } from '@/common/context/UIProviders';
import { MenuBar } from '@/components/MenuBar';
import { ModuleSwitchDropdown } from '@/modules/core/organization/ModuleSwitchDropdown';
import { OrgSwitchDropdown } from '@/modules/core/organization/OrgSwitchDropdown';
import { NavItem } from '@/types/navItem';


// export type ModuleLayoutContextType = {
// 	// TODO: Use later
// };

// const ModuleLayoutContext = createContext<ModuleLayoutContextType | undefined>(undefined);

// export const useModuleLayout = (): ModuleLayoutContextType => {
// 	const context = useContext(ModuleLayoutContext);
// 	if (!context) {
// 		throw new Error('useModuleLayout must be used within ModuleLayoutProvider');
// 	}
// 	return context;
// };

export type ModuleLayoutProps = React.PropsWithChildren<{
	navItems: NavItem[];
}>;

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
	children,
	navItems,
}) => {
	const { backgroundColor } = useUIState();

	// const contextValue: ModuleLayoutContextType = {
	// };

	return (
		// <ModuleLayoutContext.Provider value={contextValue}>
		<Box
			component='div'
			bg={backgroundColor}
			className='flex flex-col h-screen overflow-hidden'
		>
			<Header navItems={navItems} />
			<Box
				component='section'
				bg={backgroundColor}
				className='flex flex-row overflow-hidden'
			>
				{children}
			</Box>
		</Box>
		// </ModuleLayoutContext.Provider>
	);
};

const Header: React.FC<{ navItems: NavItem[] }> = ({ navItems }) => {
	const { isMobile } = useUIState();

	if (isMobile) return null;

	return (
		<Box
			component='header'
			className={clsx(
				'w-full h-[50px] shrink-0 z-20',
				'flex flex-row items-center justify-start',
				classes.headerRow,
				classes.menuBar,
			)}
		>
			<Breadcrumbs separatorMargin='xs'>
				<OrgSwitchDropdown dropdownWidth={300} />
				<ModuleSwitchDropdown dropdownWidth={300} />
			</Breadcrumbs>
			<MenuBar items={navItems} />
		</Box>
	);
};
