import { UserDetailPage } from '@/components/Tenant/UserDetail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users/users/detail'
)({
	component: UserDetailPage,
});
