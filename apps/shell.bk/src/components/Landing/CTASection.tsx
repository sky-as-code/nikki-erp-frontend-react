import { Container, Title, Text, Button, Group } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'

import classes from './CTASection.module.css'

export function CTASection() {
	return (
		<Container size='lg' py={120} className={classes.wrapper}>
			<Title className={classes.title} ta='center'>
				Ready to transform your business?
			</Title>

			<Text c='dimmed' ta='center' size='lg' maw={580} mx='auto' mt='xl'>
				Join thousands of satisfied users who have already taken their
				projects to the next level. Start your journey today.
			</Text>

			<Group justify='center' mt={40}>
				<Button
					size='lg'
					className={classes.button}
					rightSection={<IconArrowRight size={20} />}
				>
					Get Started Now
				</Button>
			</Group>
		</Container>
	)
}
