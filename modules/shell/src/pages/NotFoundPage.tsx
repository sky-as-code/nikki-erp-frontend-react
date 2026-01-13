import { Button, Center, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useFirstOrgSlug } from '@nikkierp/shell/userContext';
import { IconArrowLeft, IconHome, IconMoodSad } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';


export function NotFoundPage(): React.ReactNode {
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
		<Center h='100%'>
			<Stack align='center' gap='xl' p='xl'>
				<NotFoundContent theme={theme} />
				<ActionButtons
					theme={theme}
					onGoHome={handleGoHome}
					onGoBack={() => navigate(-1)}
				/>
			</Stack>
		</Center>
	);
}

function NotFoundContent({ theme }: { theme: ReturnType<typeof useMantineTheme> }): React.ReactNode {
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

function ActionButtons({
	theme,
	onGoHome,
	onGoBack,
}: {
	theme: ReturnType<typeof useMantineTheme>;
	onGoHome: () => void;
	onGoBack: () => void;
}): React.ReactNode {
	return (
		<Group gap='md' mt='xl'>
			<Button
				leftSection={<IconHome size={20} />}
				size='lg'
				variant='filled'
				onClick={onGoHome}
				style={{
					background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.cyan[6]} 100%)`,
				}}
			>
				Go Home
			</Button>
			<Button
				leftSection={<IconArrowLeft size={20} />}
				size='lg'
				variant='outline'
				onClick={onGoBack}
			>
				Go Back
			</Button>
		</Group>
	);
}