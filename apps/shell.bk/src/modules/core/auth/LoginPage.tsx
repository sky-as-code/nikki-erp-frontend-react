'use client'

import { Logo } from '@components/Logo/Logo'
import { Box, Card, Stack } from '@mantine/core'
import { useSearchParams } from 'next/navigation'

import { LoginWizard } from './LoginWizard'

export const LoginPage: React.FC = () => {
	const searchParams = useSearchParams()
	const returnUrl = searchParams.get('to') || '/'

	return (
		<Box className='w-full max-w-[500px] min-w-[400px] p-10' mx='auto'>
			<Card withBorder shadow='md' radius='md' p={50} className='backdrop-blur-sm bg-white/50'>
				<Stack gap='xs' mb='md' align='center'>
					<Logo enableLink={false} />
				</Stack>

				<LoginWizard returnUrl={returnUrl} />
			</Card>
		</Box>
	)
}
