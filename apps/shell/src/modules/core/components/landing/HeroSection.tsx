

import { Button, Container, Group, Title } from '@mantine/core'
import { IconArrowRight, IconStar } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

import classes from './HeroSection.module.css'

import { useConfig } from '@/common/context/ConfigProvider'

export function HeroSection() {
	const navigate = useNavigate()

	const {  activeOrg } = useConfig()

	return (
		<Container pt='sm' size='lg' className={classes.wrapper}>
			<div className={classes.inner}>
				<Title className={classes.title}>NikkiERP</Title>
				<Title className={classes.subtitle}>
					Modern ERP for the modern enterprise
				</Title>

				<Group mt={60}>
					<Button
						size='lg'
						variant='gradient'
						gradient={{ from: 'primary', to: 'pink' }}
						className={classes.control}
						onClick={() => {
							navigate({ to: `/${activeOrg?.slug}` })
						}}
						rightSection={<IconArrowRight size={16} />}
					>
						Get started
					</Button>
					<Button
						variant='default'
						color='dark'
						size='lg'
						className={classes.control}
						rightSection={<IconStar size={16} />}
					>
						Give a Star
					</Button>
				</Group>
			</div>
		</Container>
	)
}
