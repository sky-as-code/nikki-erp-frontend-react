import { Container } from '@mantine/core';
import { Outlet } from 'react-router';


export const VendingMachineLayout: React.FC = () => {
	return (
		<Container fluid>
			<Outlet />
		</Container>
	);
};