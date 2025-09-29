import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '@/modules/core/page/LandingPage'


export const Route = createFileRoute('/')({
	component: LandingPage,
})
