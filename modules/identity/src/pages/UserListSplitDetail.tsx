import { Grid } from '@mantine/core';
import { useParams } from 'react-router';

import { UserDetailPageBody } from './UserDetailPage';
import { UserListPageBody } from './UserListPage';


export const UserListSplitDetail: React.FC = () => {
	const { userId } = useParams();

	// If userId is not specified, show only UserListPageBody
	if (!userId) {
		return (
			<Grid gutter={0}>
				<Grid.Col span={12} className='p-4 overflow-auto'>
					<UserListPageBody />
				</Grid.Col>
			</Grid>
		);
	}

	// If userId is specified, show only UserDetailPageBody
	return (
		<Grid gutter={0}>
			<Grid.Col span={12} className='p-4 h-full overflow-auto'>
				<UserDetailPageBody />
			</Grid.Col>
		</Grid>
	);
};