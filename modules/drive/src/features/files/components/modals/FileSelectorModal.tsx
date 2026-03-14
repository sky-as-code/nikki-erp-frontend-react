import { Button, Flex } from '@mantine/core';
import { useState } from 'react';

import { FileSelector } from '../FileSelector';


type FileSelectorModalProps = {
	onClose: () => void;
	afterSelectFn?: (selectedId: string[] | string) => void;
	mode?: 'file' | 'folder';
	multiple?: boolean;
	action?: string;
};

export function FileSelectorModal({ onClose, afterSelectFn, action, mode = 'folder', multiple = false }: FileSelectorModalProps) {
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
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (afterSelectFn) afterSelectFn(selectedId);
						onClose();
					}}
					disabled={Array.isArray(selectedId) && selectedId.length === 0}
				>
					{action || 'Select'}
				</Button>
			</Flex>
		</Flex>
	);
}
