import { createFileRoute } from '@tanstack/react-router'

import { RegisterPage } from '@/modules/core/page/RegisterPage'

export const Route = createFileRoute('/_auth/register')({
	component: RegisterPage,
})
