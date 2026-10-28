import { Button } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconHistory } from '@tabler/icons-react';
import React from 'react';

import { useResourceDetailTestAttrs } from '../../resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../resourceUpdateContext';
import { useToolbarButtonContent } from '../toolbarCompact';


/**
 * Opens and closes the Audit panel beside the sections. Filled while open, so the toolbar shows
 * the panel's state the way a pressed toggle does. Renders nothing outside the v2 update page.
 */
export function AuditToggleButton(): React.ReactNode {
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	const { auditOpen = false, setAuditOpen } = useResourceUpdateContext();
	const content = useToolbarButtonContent(<IconHistory size={16} />, t('audit.toggle'));
	if (!setAuditOpen) {
		return null;
	}
	return (
		<Button
			variant={auditOpen ? 'filled' : 'outline'}
			aria-pressed={auditOpen}
			onClick={() => setAuditOpen(open => !open)}
			{...tid('auditToggle')}
			{...content}
		/>
	);
}
