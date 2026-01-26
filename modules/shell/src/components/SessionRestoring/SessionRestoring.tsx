import { Center, Loader, Text } from '@mantine/core';


export const SessionRestoring: React.FC = () => {
	return (
		<Center w='100%' h='90vh'>
			<Loader />
			<Text c='dimmed'>Restoring your session...</Text>
		</Center>
	);
};