import { createFileRoute, Outlet } from '@tanstack/react-router'

import { VendingMachineLayout } from '@/modules/vendingMachine/layout'

export const Route = createFileRoute('/_tenant/$tenant/_vending-machine')({
	component: () => (
		<VendingMachineLayout>
			<Outlet />
		</VendingMachineLayout>
	),
})


