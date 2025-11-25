import { Navigate, Route, Routes } from 'react-router';

import { GroupCreatePage } from './pages/group/GroupCreatePage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { GroupListPage } from './pages/group/GroupListPage';
import { OrganizationCreatePage } from './pages/organization/OrganizationCreatePage';
import { OrganizationDetailPage } from './pages/organization/OrganizationDetailPage';
import { OrganizationListPage } from './pages/organization/OrganizationListPage';
import { UserCreatePage } from './pages/user/UserCreatePage';
import { UserDetailPage } from './pages/user/UserDetailPage';
import { UserListPage } from './pages/user/UserListPage';


const ModuleRoutes: React.FC = () => {
	return (
		<Routes>
			<Route index element={<Navigate to='users' relative='path' replace />} />
			<Route path='users' element={<UserListPage />} />
			<Route path='users/create' element={<UserCreatePage />} />
			<Route path='users/:userId' element={<UserDetailPage />} />
			<Route path='groups' element={<GroupListPage />} />
			<Route path='groups/create' element={<GroupCreatePage />} />
			<Route path='groups/:groupId' element={<GroupDetailPage />} />
			<Route path='organizations' element={<OrganizationListPage />} />
			<Route path='organizations/create' element={<OrganizationCreatePage />} />
			<Route path='organizations/:slug' element={<OrganizationDetailPage />} />
		</Routes>
	);
};

export default ModuleRoutes;