import { createFileRoute } from '@tanstack/react-router'
import { SimpleForm } from '@/components/forms/SimpleForm';
import { PageContainer } from '@/components/PageContainer/PageContainer';


export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/form/')({
	component: Form,
})

function Form() {
	return (
		<PageContainer title='Forms'>
			<SimpleForm />
		</PageContainer>
	)
}
