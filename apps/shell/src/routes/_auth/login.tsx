import { LoginPage } from '@modules/core/auth/LoginPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
	component: LoginPage,
})
