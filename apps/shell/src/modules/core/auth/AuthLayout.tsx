import { Box, Text } from '@mantine/core'
import { FC } from 'react'

import authBackground from '@/assets/images/backgrounds/auth-background.jpg'

interface Props {
	children: React.ReactNode;
}

export const AuthLayout: FC<Props> = ({ children }) => {
	return (
		<Box
			className='w-full h-screen dark:text-[--mantine-colors-dark] flex flex-col'
			style={{
				backgroundImage: `url(${authBackground})`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
				backgroundSize: 'cover',
			}}
		>
			<Box className='overflow-auto grid place-items-center flex-1'>
				{children}
			</Box>
			<Footer/>
		</Box>
	)
}


const Footer: React.FC = () => (
	<Text
		component='footer'
		size='sm'
		c='gray'
		p='md'
		className='backdrop-blur-sm bg-white/30 w-full'
		style={{
			borderRadius: 'var(--mantine-radius-md)',
			borderTop: '1px solid var(--app-shell-border-color)',
		}}
	>
		Copyright © 2025 Nikki ERP
	</Text>
)