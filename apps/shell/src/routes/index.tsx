import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '@/modules/core/landing/LandingPage'



export const Route = createFileRoute('/')({
	component: LandingPage,
})
