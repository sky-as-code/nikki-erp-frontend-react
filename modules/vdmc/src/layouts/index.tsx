import { Container } from '@mantine/core';
import { Outlet } from 'react-router';


export const VendingMachineLayout: React.FC = () => {
	return <Container fluid px={{ base: 'xs', xs: 'sm', sm: 'md' }}>
		<Outlet />
	</Container>;
};