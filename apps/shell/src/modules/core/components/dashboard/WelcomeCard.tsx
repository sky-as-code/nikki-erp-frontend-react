

import { Card, List, ListItem, Space, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';

export function WelcomeCard() {
	return (
		<Card radius='md'>
			<Title order={5}>Welcome back!</Title>
			<Text fz='sm' c='dimmed' fw='500'>
				Mantine Crypto Dashboard
			</Text>
			<Space h='sm' />
			<List
				center
				size='sm'
				spacing='sm'
				icon={
					<ThemeIcon color='green.3' size={22} radius='xl'>
						<IconCircleCheck size='1rem' />
					</ThemeIcon>
				}
			>
				<ListItem>If several languages coalesce</ListItem>
				<ListItem>Sed ut perspiciatis unde</ListItem>
				<ListItem>It would be necessary</ListItem>
			</List>
		</Card>
	);
}
