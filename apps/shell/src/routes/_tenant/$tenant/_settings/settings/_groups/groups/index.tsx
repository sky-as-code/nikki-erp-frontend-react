import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_groups/groups/'
)({
	component: () => <div>Groups Settings Page</div>,
})
