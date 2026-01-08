import { Grid } from '@mantine/core';
import { useParams } from 'react-router';

import { GroupDetailPageBody } from './GroupDetailPage';
import { GroupListPageBody } from './GroupListPage';


export const GroupListSplitDetail: React.FC = () => {
	const { groupId } = useParams();

	// If groupId is not specified, show only GroupListPageBody
	if (!groupId) {
		return (
			<Grid gutter={0}>
				<Grid.Col span={12} className='p-4 overflow-auto'>
					<GroupListPageBody />
				</Grid.Col>
			</Grid>
		);
	}

	// If groupId is specified, show only GroupDetailPageBody
	return (
		<Grid gutter={0}>
			<Grid.Col span={12} className='p-4 h-full overflow-auto'>
				<GroupDetailPageBody />
			</Grid.Col>
		</Grid>
	);
};
