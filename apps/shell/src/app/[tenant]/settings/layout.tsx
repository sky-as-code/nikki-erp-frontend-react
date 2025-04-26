'use client';

import { ModuleLayout } from '../CommonModuleLayout';

import navItems from '@/modules/settings/navItems';


const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ModuleLayout
			navItems={navItems}
		>
			{children}
		</ModuleLayout>
	);
};

export default SettingsLayout;
