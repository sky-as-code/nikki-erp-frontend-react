import { Center, Stack, Text } from '@mantine/core';
import { IconFolderOpen } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


export function EmptyFilesState(): React.ReactNode {
	const {t} = useTranslation();

	return (
		<Center
			h='100%'
			w='100%'
			pos={'absolute'}
			top={0}
			left={0}
			opacity={0.3}
			style={{
				pointerEvents: 'none',
			}}
		>
			<Stack gap='xs' align='center'>
				<IconFolderOpen
					size={96}
					stroke={2.5}
					color='var(--mantine-color-gray-6)'
				/>
				<Text size='lg' c='dimmed' fw={500}>
					{t('nikki.drive.view.folderEmpty')}
				</Text>
			</Stack>
		</Center>
	);
}
