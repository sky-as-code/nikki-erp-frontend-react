
import { createFileRoute } from '@tanstack/react-router'
const UserListPage: React.FC = () => {
	return (
		<>
		</>
	)
};

export const Route = createFileRoute('/_tenant/$tenant/_settings/settings/_users/users/')({
	component: UserListPage,
});

export default UserListPage;
