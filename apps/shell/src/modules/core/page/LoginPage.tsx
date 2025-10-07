import { Box, Card, Stack } from '@mantine/core'

import { LoginWizard } from '../components/auth/LoginWizard'
import { AuthLayout } from '../layout/AuthLayout'

import { Logo } from '@/common/components/Logo/Logo'

export const LoginPage: React.FC = () => {
	return (
		<AuthLayout>
			<Box className='w-full max-w-[500px] min-w-[400px] p-10' mx='auto'>
				<Card withBorder shadow='md' radius='md' p={50} className='backdrop-blur-sm bg-white/50'>
					<Stack gap='xs' mb='md' align='center'>
						<Logo enableLink={false} />
					</Stack>

					<LoginWizard returnUrl={'/'} />
				</Card>
			</Box>
		</AuthLayout>
	)
}
