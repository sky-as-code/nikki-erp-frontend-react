import { createFileRoute } from '@tanstack/react-router'

import { PageNotFound } from '@/common/components/PageNotFound'

export const Route = createFileRoute('/$')({
  component: () => <PageNotFound />,
})


