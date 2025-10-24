// import { zodResolver } from '@hookform/resolvers/zod'
// import { Box, Button, PasswordInput, Pill, Stack, Text, TextInput } from '@mantine/core'
// import { useRouter } from '@tanstack/react-router'
// import { FC, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'

// import { loginUser } from '../../services'

// import { useAuth } from './AuthProvider'
// import { AuthPayload } from './LoginWizard'


// export const LoginPassword: FC<{
// 	handleNextStep: (method?: string) => void;
// 	setAuthPayload: (data: AuthPayload) => void;
// 	authPayload: AuthPayload;
// }> = ({ authPayload }) => {
// 	const searchParams = new URLSearchParams(window.location.search)
// 	const returnUrl = searchParams.get('to') || '/'

// 	const { form, onSubmit } = useLoginForm(decodeURIComponent(returnUrl))
// 	const { register, handleSubmit, formState: { errors } } = form

// 	return (
// 		<Box>
// 			<Stack gap='xs' mb='md' align='center'>
// 				<Pill className='px-5' bg={'var(--mantine-color-gray-3)'} size='lg'>
// 					{authPayload.username}
// 				</Pill>
// 			</Stack>
// 			<Text size='xl' my='xl' className='text-center'>
// 				Enter Your Password
// 			</Text>

// 			<form onSubmit={handleSubmit(onSubmit)}>
// 				<PasswordInput
// 					label='Password'
// 					required
// 					size='md'
// 					placeholder='Your password'
// 					labelProps={{ className: 'text-gray-600' }}
// 					error={errors.password?.message}
// 					{...register('password')}
// 				/>

// 				<TextInput
// 					className='hidden'
// 					value={authPayload.username}
// 					{...register('email')}
// 				/>

// 				<Button type='submit' fullWidth mt='xl' size='md'>
// 					Sign In
// 				</Button>
// 			</form>
// 		</Box>
// 	)
// }


// const loginSchema = z.object({
// 	email: z.string().email('Invalid email address'),
// 	password: z.string().min(6, 'Password must be at least 6 characters'),
// })

// type LoginFormData = z.infer<typeof loginSchema>

// const useLoginForm = (returnUrl: string) => {

// 	const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
// 	const router = useRouter()
// 	const { login } = useAuth()
// 	const [apiErrors, setApiErrors] = useState<string[]>([])

// 	const onSubmit = async (data: LoginFormData) => {
// 		const authData = await loginUser(data)
// 		if (authData.errors) {
// 			setApiErrors(authData.errors)
// 			return
// 		}
// 		login(authData.data!)
// 		router.navigate({ to: returnUrl })
// 	}

// 	return { form, apiErrors, onSubmit }
// }