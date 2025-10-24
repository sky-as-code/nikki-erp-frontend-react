import { Button, Paper } from '@mantine/core';

import { withPageTitle } from '@/common/components/withPageTitle';
import { useConfig } from '@/common/context/ConfigProvider';
import { UIProviders } from '@/common/context/UIProviders';

import '@/styles/index.css';


export const UserListPage: React.FC = withPageTitle('User List', () => {
	const { envVars } = useConfig();
	return (
		<UIProviders>
			<Paper className='p-4'>
				User List: {envVars.BASE_API_URL}
				<p>
					<Button>Click me</Button>
				</p>
			</Paper>
		</UIProviders>
	);
});
