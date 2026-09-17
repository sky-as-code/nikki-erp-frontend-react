import { Center, Stack, Text } from '@mantine/core';
import { IconHomeCancel } from '@tabler/icons-react';


/** Shown when the user belongs to no organization. */
export function NoOrgPage(): React.ReactNode {
	return (
		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<IconHomeCancel size={100} stroke={1.5} />
				<Text c='dimmed'>You don't have any organization assigned to you...</Text>
			</Stack>
		</Center>
	);
}
