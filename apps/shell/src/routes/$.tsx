import { createFileRoute } from '@tanstack/react-router'

import { NotFoundPage } from '@/modules/core/page/NotFoundPage'


export const Route = createFileRoute('/$')({
	component: () => <NotFoundPage />,
})


