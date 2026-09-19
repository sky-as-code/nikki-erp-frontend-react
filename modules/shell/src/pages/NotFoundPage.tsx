import { Button, useMantineTheme } from '@mantine/core';
import { ORG_HOME_PATH } from '@nikkierp/shell/constants';
import { ErrorStatePage, errorStateGradient } from '@nikkierp/ui/components';
import { useWindowTitleI18n } from '@nikkierp/ui/hookhoc';
import { IconArrowLeft, IconHome, IconMoodSad } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


export function NotFoundPage(): React.ReactNode {
	useWindowTitleI18n('page_not_found');

	const theme = useMantineTheme();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const handleGoHome = () => navigate(ORG_HOME_PATH);

	return (
		<ErrorStatePage
			code='404'
			colorFrom='blue'
			colorTo='cyan'
			icon={<IconMoodSad size={80} stroke={1.5} style={{ color: theme.colors.blue[6], opacity: 0.8 }} />}
			title={translate('page_not_found')}
			message={translate('not_found_hint')}
			testId='shell.notFound'
			actions={
				<>
					<Button
						leftSection={<IconHome size={20} />}
						size='md'
						variant='filled'
						onClick={handleGoHome}
						style={{ background: errorStateGradient(theme, 'blue', 'cyan') }}
					>
						{translate('unauthorized_go_home')}
					</Button>
					<Button
						leftSection={<IconArrowLeft size={20} />}
						size='md'
						variant='outline'
						onClick={() => navigate(-1)}
					>
						{translate('unauthorized_go_back')}
					</Button>
				</>
			}
		/>
	);
}
