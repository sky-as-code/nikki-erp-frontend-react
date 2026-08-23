import { ActionIcon } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconX } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { useResourceDetailTestAttrs, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { useCanClosePane } from '../resourceSplitView/splitViewContext';


/**
 * Closes the detail pane by dropping the `:id` segment, which puts the split view
 * back into its list-only state. Renders nothing on a standalone detail page or
 * while the pane is fullscreen, where there is no list beside it to return to.
 */
export function SplitPaneCloseButton(): React.ReactNode {
	const canClose = useCanClosePane();
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();

	if (!canClose) {
		return null;
	}

	return (
		<ActionIcon
			component={Link}
			to='..'
			relative='path'
			variant='subtle'
			size='md'
			aria-label={t('action.close')}
			title={t('action.close')}
			{...tid('closePane')}
		>
			<IconX size={16} />
		</ActionIcon>
	);
}
