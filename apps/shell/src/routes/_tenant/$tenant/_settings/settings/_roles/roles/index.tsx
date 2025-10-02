import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_roles/roles/'
)({
	component: () => <div>Roles - Permissions Settings Page</div>,
})
