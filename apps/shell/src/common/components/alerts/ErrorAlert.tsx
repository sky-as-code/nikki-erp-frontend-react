import { Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

export const ErrorAlert = ({ errors }: { errors: string[] }) =>
	errors.length > 0 && (
		<Alert icon={<IconAlertCircle size={16} />} color='red' mb='lg'>
			{errors.map((error, index) => (
				<div key={index}>{error}</div>
			))}
		</Alert>
	)