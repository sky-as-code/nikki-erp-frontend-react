import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_system/system/'
)({
	component: () => <div>System Settings Page</div>,
})
