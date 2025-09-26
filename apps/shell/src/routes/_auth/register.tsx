import { RegisterPage } from '@modules/core/auth/RegisterPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
	component: RegisterPage,
})
