import { Center, Stack, Text } from '@mantine/core';
import { IconFileSadFilled } from '@tabler/icons-react';
import React from 'react';


export function EmptyFilesState(): React.ReactNode {
	return (
		<Center h='100%' w='100%'>
			<Stack gap='xs' align='center'>
				<IconFileSadFilled
					size={96}
					stroke={2.5}
					color='var(--mantine-color-gray-6)'
				/>
				<Text size='lg' c='dimmed' fw={500}>
					No files
				</Text>
			</Stack>
		</Center>
	);
}

