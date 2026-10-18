import { useMantineTheme } from '@mantine/core';
import { ErrorStatePage, LinkButton } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconArrowLeft, IconMoodSad } from '@tabler/icons-react';
import React from 'react';

import { useResourceDetailTestAttrs } from '../resourceDetail/ResourceDetailProvider';
import { useBackLinkTarget } from '../resourceDetail/useBackLinkTarget';


/**
 * The 404 state rendered in place of the header and form when the record does not exist.
 *
 * The URL is kept on purpose, so the user can see and share what was asked for. There is no
 * "Go home": its destination lives in `@nikkierp/shell`, which this package must not import.
 */
export function ResourceNotFound(): React.ReactNode {
	const theme = useMantineTheme();
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	const backLink = useBackLinkTarget();

	return (
		<ErrorStatePage
			code='404'
			colorFrom='blue'
			colorTo='cyan'
			icon={<IconMoodSad size={80} stroke={1.5} style={{ color: theme.colors.blue[6], opacity: 0.8 }} />}
			title={t('page_not_found')}
			message={t('not_found_hint')}
			testId={tid('notFound')['data-testid']}
			actions={
				<LinkButton
					to={backLink.href}
					leftSection={<IconArrowLeft size={20} />}
					size='md'
					variant='outline'
					{...tid('notFound', 'goBack')}
				>
					{t('unauthorized_go_back')}
				</LinkButton>
			}
		/>
	);
}
