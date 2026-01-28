import { Center, Stack, Text } from '@mantine/core';
import { useFirstOrgSlug } from '@nikkierp/shell/userContext';
import { IconHomeCancel } from '@tabler/icons-react';
import { Navigate } from 'react-router';


export function ToDefaultOrg(): React.ReactNode {
	const { slug: firstOrgSlug } = useFirstOrgSlug();

	return firstOrgSlug ?
		<Navigate to={`/${firstOrgSlug}`} replace /> :
		<NoOrg />;
}

function NoOrg(): React.ReactNode {
	return (
		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<IconHomeCancel size={100} stroke={1.5} />
				<Text c='dimmed'>You don't have any organization assigned to you...</Text>
			</Stack>
		</Center>
	);
}
