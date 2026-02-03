import { Button } from '@mantine/core';
import { IconFilterOff } from '@tabler/icons-react';


export const FilterOffButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			variant='light'
			color='gray'
			size='sm'
			onClick={onClick}
		>
			<IconFilterOff size={20} />
		</Button>
	);
};