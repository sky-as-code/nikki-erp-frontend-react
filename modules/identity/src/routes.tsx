import { Navigate, Route, Routes } from 'react-router';

import { UserListPage } from './pages/UserListPage';


const ModuleRoutes: React.FC = () => {
	return (
		<Routes>
			<Route index element={<Navigate to='users' relative='path' replace />} />
			<Route path='users' element={<UserListPage />} />
		</Routes>
	);
};

export default ModuleRoutes;