import { createFileRoute } from '@tanstack/react-router';

import { LandingPage } from '@/modules/core/Landing/LandingPage';




export const Route = createFileRoute('/')({
	component: LandingPage,
});


