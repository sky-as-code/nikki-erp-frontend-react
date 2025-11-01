import { Button, Paper } from '@mantine/core';

// export const UserListPage: React.FC = withPageTitle('User List', () => {
export const UserListPage: React.FC = () => {
	// const { envVars } = useConfig();
	return (
		<Paper className='p-4'>
			User List: envVars.BASE_API_URL
			<p>
				<Button>Click me</Button>
			</p>
		</Paper>
	);
};
