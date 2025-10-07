import { createFileRoute, Outlet } from '@tanstack/react-router'


export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_system'
)({
	component: () => <div><Outlet/></div>,
})

