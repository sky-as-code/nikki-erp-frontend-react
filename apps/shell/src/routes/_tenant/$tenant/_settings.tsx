import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ModuleLayout } from '@/components/Tenant/ModuleLayout';
import navItems from '@/modules/settings/navItems';


const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ModuleLayout
			navItems={navItems}
		>
			{children}
		</ModuleLayout>
	)
};

export const Route = createFileRoute('/_tenant/$tenant/_settings')({
	component: () =>  (
		<SettingsLayout>
			<Outlet />
		</SettingsLayout>
	),
})
