import { Button, useMantineTheme } from '@mantine/core';
import { IconArrowLeft, IconHome, IconLock } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ErrorStatePage, errorStateGradient, InsufficientPermissionContent } from '../ErrorState';


export interface UnauthorizedProps {
	onGoHome?: () => void;
	onGoBack?: () => void;
	/** The entitlements the caller lacks; listed under the hint so an administrator can act on them. */
	missing?: string[];
}

/**
 * Rendered in place of the page the user may not read. Never navigated to: the URL keeps naming
 * the page that was refused, so a reload or a granted permission lands on it.
 */
export const Unauthorized: React.FC<UnauthorizedProps> = ({ onGoHome, onGoBack, missing }) => {
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
			message={missing && missing.length > 0
				? <InsufficientPermissionContent missing={missing} />
				: translate('unauthorized_hint')}
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
