import { Button } from '@mantine/core';
import { IconFilterX } from '@tabler/icons-react';


export const FilterOffButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			variant='light'
			color='gray'
			size='sm'
			px='md'
			bd='solid 1px var(--mantine-color-gray-3)'
			onClick={onClick}
		>
			<IconFilterX size={20} />
		</Button>
	);
};