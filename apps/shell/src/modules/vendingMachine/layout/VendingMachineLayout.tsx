import navItems from '../configs/navItems'

import { ModuleLayout } from '@/common/components/layout/ModuleLayout'

export const VendingMachineLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ModuleLayout navItems={navItems}>
			{children}
		</ModuleLayout>)
}