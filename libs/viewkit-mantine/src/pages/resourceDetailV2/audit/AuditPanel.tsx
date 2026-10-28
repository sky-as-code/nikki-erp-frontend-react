import { ActionIcon, Group, Stack, Tabs } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconX } from '@tabler/icons-react';
import React from 'react';

import { CommentsTab, HistoryTab } from './HistoryTab';
import { PaperWithBorder } from '../../../components/paperWithBorder';
import { useResourceDetailTestAttrs } from '../../resourceDetail/ResourceDetailProvider';


const HISTORY_TAB = 'history';
const COMMENTS_TAB = 'comments';

/**
 * The right parent's content, or the full-screen dialog's on a narrow screen: the History and
 * Comments tabs, and an X at the top right that closes it the way the toolbar toggle does (pattern
 * of `SplitPaneCloseButton`); the dialog has no other button.
 */
export function AuditPanel({ onClose, bare = false }: {
	onClose: () => void,
	/** Without the bordered card, inside the full-screen dialog of a narrow screen. */
	bare?: boolean,
}): React.ReactNode {
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	const [tab, setTab] = React.useState<string | null>(HISTORY_TAB);
	return (
		<Stack component={bare ? 'div' : PaperWithBorder} gap='xs' {...tid('auditPanel')}>
			{/* `keepMounted={false}`: a hidden tab fetches nothing, and History reloads when shown again. */}
			<Tabs value={tab} onChange={setTab} keepMounted={false}>
				<Group gap='xs' wrap='nowrap' align='center'>
					<Tabs.List className='flex-1'>
						<Tabs.Tab value={HISTORY_TAB} {...tid('auditTab', HISTORY_TAB)}>{t('audit.tab.history')}</Tabs.Tab>
						<Tabs.Tab value={COMMENTS_TAB} {...tid('auditTab', COMMENTS_TAB)}>{t('audit.tab.comments')}</Tabs.Tab>
					</Tabs.List>
					<ActionIcon
						variant='subtle'
						size='md'
						aria-label={t('action.close')}
						title={t('action.close')}
						onClick={onClose}
						{...tid('auditClose')}
					>
						<IconX size={16} />
					</ActionIcon>
				</Group>
				<Tabs.Panel value={HISTORY_TAB} pt='sm'><HistoryTab /></Tabs.Panel>
				<Tabs.Panel value={COMMENTS_TAB} pt='sm'><CommentsTab /></Tabs.Panel>
			</Tabs>
		</Stack>
	);
}
