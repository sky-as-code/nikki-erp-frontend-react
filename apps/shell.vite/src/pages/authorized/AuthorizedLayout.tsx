import { Outlet } from 'react-router';

const AuthorizedLayout: React.FC = () => {
	return (
		<Outlet />
	);
};

export default AuthorizedLayout;
