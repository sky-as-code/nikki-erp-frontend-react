import { createFileRoute, Outlet } from '@tanstack/react-router'


export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_organizations'
)({
	component: () => <div><Outlet/></div>,
})

