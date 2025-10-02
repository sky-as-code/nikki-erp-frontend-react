import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_organizations/organizations/'
)({
	component: () => <div>Organizations Settings Page</div>,
})
