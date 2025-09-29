import { ModuleLayout } from '@/common/components/layout/ModuleLayout'
import navItems from '@/modules/settings/components/navItems'

export const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
	<ModuleLayout navItems={navItems}>
		{children}
	</ModuleLayout>)
}