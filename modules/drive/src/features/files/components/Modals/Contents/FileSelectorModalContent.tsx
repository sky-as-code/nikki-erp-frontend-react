import { Button, Flex } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileSelector } from '../../FileSelector';


type FileSelectorModalProps = {
	onClose: () => void;
	afterSelectFn?: (selectedId: string[] | string) => void;
	mode?: 'file' | 'folder';
	multiple?: boolean;
	action?: string;
};

export function FileSelectorModalContent({ onClose, afterSelectFn, action, mode = 'folder', multiple = false }: FileSelectorModalProps) {
	const { t } = useTranslation();
	const [selectedId, setSelectedId] = useState<string[] | string>('');

	return (
		<Flex direction='column'>
			<FileSelector
				mode={mode}
				multiple={multiple}
				onSelect={(id) => { setSelectedId(id); }}
			/>
			<Flex justify='flex-end' gap='xs'>
				<Button variant='subtle' onClick={onClose}>
					{t('nikki.drive.modals.cancel')}
				</Button>
				<Button
					onClick={() => {
						if (afterSelectFn) afterSelectFn(selectedId);
						onClose();
					}}
					disabled={Array.isArray(selectedId) && selectedId.length === 0}
				>
					{action ?? t('nikki.drive.modals.select')}
				</Button>
			</Flex>
		</Flex>
	);
}
