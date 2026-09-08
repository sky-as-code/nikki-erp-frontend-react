import { Button, useMantineTheme } from '@mantine/core';
import { IconArrowLeft, IconHome, IconLock } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ErrorStatePage, errorStateGradient } from '../ErrorState';


export interface UnauthorizedProps {
	onGoHome?: () => void;
	onGoBack?: () => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({ onGoHome, onGoBack }) => {
	const theme = useMantineTheme();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	// The home destination comes from the user context, which lives in @nikkierp/shell and is not
	// a dependency of this package. The Shell page passes it in.
	const handleGoHome = onGoHome ?? (() => navigate('/'));
	const handleGoBack = onGoBack ?? (() => navigate(-1));

	return (
		<ErrorStatePage
			code='403'
			colorFrom='red'
			colorTo='orange'
			icon={<IconLock size={80} stroke={1.5} style={{ color: theme.colors.red[6], opacity: 0.8 }} />}
			title={translate('unauthorized_title')}
			message={translate('unauthorized_hint')}
			testId='ui.unauthorized'
			actions={
				<>
					<Button
						leftSection={<IconHome size={20} />}
						size='md'
						variant='filled'
						onClick={handleGoHome}
						style={{ background: errorStateGradient(theme, 'red', 'orange') }}
					>
						{translate('unauthorized_go_home')}
					</Button>
					<Button
						leftSection={<IconArrowLeft size={20} />}
						size='md'
						variant='outline'
						onClick={handleGoBack}
					>
						{translate('unauthorized_go_back')}
					</Button>
				</>
			}
		/>
	);
};
