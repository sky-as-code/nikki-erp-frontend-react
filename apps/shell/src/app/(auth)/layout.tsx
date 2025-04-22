import { Box } from '@mantine/core';

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	return (
		<Box className='w-full h-screen dark:text-[--mantine-colors-dark] flex flex-col items-center justify-center'>
			{children}
		</Box>
	);
}
