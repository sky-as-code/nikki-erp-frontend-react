import { Center, Stack, Typography } from '@mantine/core';
import { IconFileUnknown } from '@tabler/icons-react';


export function NotFoundPage(): React.ReactNode {
	return (

		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<IconFileUnknown size={100} />
				<Typography>
					<h1>Page not found</h1>
				</Typography>
			</Stack>
		</Center>
	);
}