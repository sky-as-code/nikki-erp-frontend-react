import { Button, Center, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useFirstOrgSlug } from '@nikkierp/shell/userContext';
import { IconArrowLeft, IconHome, IconMoodSad } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';


export function NotFoundPage(): React.ReactNode {
	return (
		<Center h='100%'>
			<Stack align='center' gap={'lg'} p={{ base: 'md', sm: 'xl' }}>
				<NotFoundContent />
				<ActionButtons />
			</Stack>
		</Center>
	);
}

function NotFoundContent(): React.ReactNode {
	const theme = useMantineTheme();

	return (
		<>
			<Stack align='center' gap={0}>
				<Title
					order={1}
					size='8rem'
					fw={900}
					style={{
						background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.cyan[6]} 100%)`,
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text',
						lineHeight: 1,
						fontFamily: 'Space Grotesk, sans-serif',
					}}
				>
					404
				</Title>
			</Stack>

			<IconMoodSad
				size={80}
				stroke={1.5}
				style={{
					color: theme.colors.blue[6],
					opacity: 0.8,
				}}
			/>

			<Stack align='center' gap='xs'>
				<Title order={2} size='2rem' fw={600} ta='center'>
					Oops! Page Not Found
				</Title>
				<Text size='lg' c='dimmed' ta='center' maw={500}>
					The page you're looking for doesn't exist or has been moved.
					Let's get you back on track.
				</Text>
			</Stack>
		</>
	);
}

function ActionButtons(): React.ReactNode {
	const theme = useMantineTheme();
	const navigate = useNavigate();
	const { slug: firstOrgSlug } = useFirstOrgSlug();

	const handleGoHome = () => {
		if (firstOrgSlug) {
			navigate(`/${firstOrgSlug}`);
		}
		else {
			navigate('/');
		}
	};

	return (
		<Group gap='md' mt='xl'>
			<Button
				leftSection={<IconHome size={20} />}
				size={'md'}
				variant='filled'
				onClick={handleGoHome}
				style={{
					background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.cyan[6]} 100%)`,
				}}
			>
				Go Home
			</Button>
			<Button
				leftSection={<IconArrowLeft size={20} />}
				size={'md'}
				variant='outline'
				onClick={() => navigate(-1)}
			>
				Go Back
			</Button>
		</Group>
	);
}