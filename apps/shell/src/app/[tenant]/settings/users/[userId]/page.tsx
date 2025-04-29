'use client';

import DetailPage from '../../../DetailPage';

export const UserDetailPage: React.FC = () => {
	return (
		<DetailPage
			component={UserDetailInner}
			pageSlug='users'
		/>
	);
};

export default UserDetailPage;

const UserDetailInner: React.FC<{
	id?: string,
	isSplit?: boolean,
}> = ({ id, isSplit }) => {
	return (
		<>
			User detail
		</>
	);
};
