import { Button, Center, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { IconArrowLeft, IconHome, IconLock } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useFirstOrgSlug } from '../../../../shell/src/userContext/userContextSelectors';



export interface UnauthorizedProps {
	onGoHome?: () => void;
	onGoBack?: () => void;
}

// eslint-disable-next-line max-lines-per-function
export const Unauthorized: React.FC<UnauthorizedProps> = ({
	onGoHome,
	onGoBack,
}) => {
	const theme = useMantineTheme();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const { slug: firstOrgSlug } = useFirstOrgSlug();

	const handleGoHome = () => {
		if (onGoHome) {
			onGoHome();
		}
		else if (firstOrgSlug) {
			navigate(`/${firstOrgSlug}`);
		}
		else {
			navigate('/');
		}
	};

	const handleGoBack = () => {
		if (onGoBack) {
			onGoBack();
		}
		else {
			navigate(-1);
		}
	};

	return (
		<Center h='100%'>
			<Stack align='center' gap='xl' p='xl'>
				<Stack align='center' gap={0}>
					<Title
						order={1}
						size='8rem'
						fw={900}
						style={{
							background: `linear-gradient(135deg, ${theme.colors.red[6]} 0%, ${theme.colors.orange[6]} 100%)`,
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							lineHeight: 1,
							fontFamily: 'Space Grotesk, sans-serif',
						}}
					>
						403
					</Title>
				</Stack>

				<IconLock
					size={80}
					stroke={1.5}
					style={{
						color: theme.colors.red[6],
						opacity: 0.8,
					}}
				/>

				<Stack align='center' gap='xs'>
					<Title order={2} size='2rem' fw={600} ta='center'>
						{translate('nikki.shell.unauthorized.title')}
					</Title>
					<Text size='lg' c='dimmed' ta='center' maw={500}>
						{translate('nikki.shell.unauthorized.hint')}
					</Text>
				</Stack>

				<Group gap='md' mt='xl'>
					<Button
						leftSection={<IconHome size={20} />}
						size='lg'
						variant='filled'
						onClick={handleGoHome}
						style={{
							background: `linear-gradient(135deg, ${theme.colors.red[6]} 0%, ${theme.colors.orange[6]} 100%)`,
						}}
					>
						{translate('nikki.shell.unauthorized.go_home')}
					</Button>
					<Button
						leftSection={<IconArrowLeft size={20} />}
						size='lg'
						variant='outline'
						onClick={handleGoBack}
					>
						{translate('nikki.shell.unauthorized.go_back')}
					</Button>
				</Group>
			</Stack>
		</Center>
	);
};
