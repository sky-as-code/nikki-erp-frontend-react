import { Button } from '@mantine/core';
import { IconFilterX } from '@tabler/icons-react';


export const FilterOffButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			variant='subtle'
			color='gray'
			size='sm'
			px='md'
			bd='solid 1px var(--mantine-color-gray-4)'
			onClick={onClick}
		>
			<IconFilterX size={20} />
		</Button>
	);
};