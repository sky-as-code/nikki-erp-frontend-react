import { Alert, Center, Divider, Loader, Stack, Text } from '@mantine/core';
import { translateClientError } from '@nikkierp/common/types';
import { Button, useFormatLocale } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconAlertCircle, IconHistory, IconMessageCircle } from '@tabler/icons-react';
import React from 'react';
import { useParams } from 'react-router';

import { groupHistoryByDay } from './historyEntries';
import { HistoryEntry, HistoryRelatedSchemasProvider } from './HistoryEntry';
import { historyEdgeNames } from './historyLabels';
import { useResourceHistory } from './useResourceHistory';
import { useRelatedSchemas } from '../../../data/useRelatedSchemas';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTestAttrs,
} from '../../resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../resourceUpdateContext';

import type { ResourceHistoryState } from './useResourceHistory';


/**
 * The record's audit history, Odoo-chatter style: a divider per day, then each action newest first.
 * Reloads whenever the record is refetched, i.e. after a save or an action, and after a related-tab
 * assignment, which refetches only its own table; pages on scroll.
 */
export function HistoryTab(): React.ReactNode {
	const { id } = useParams();
	const { resource, historyVersion } = useResourceUpdateContext();
	const refreshKey = React.useMemo(() => [resource, historyVersion], [resource, historyVersion]);
	const history = useResourceHistory(useResourceDetailSchemaName(), id ?? null, {
		enabled: Boolean(id), refreshKey,
	});
	const tid = useResourceDetailTestAttrs();

	if (history.items.length === 0) {
		return <div {...tid('auditHistory')}><HistoryPlaceholder history={history} /></div>;
	}
	return (
		<Stack gap='xs' {...tid('auditHistory')}>
			<HistoryDays history={history} />
			<HistoryFailure history={history} />
			{history.hasMore ? <LoadMore history={history} /> : null}
		</Stack>
	);
}

function HistoryDays({ history }: { history: ResourceHistoryState }): React.ReactNode {
	const locale = useFormatLocale();
	const groups = React.useMemo(() => groupHistoryByDay(history.items, locale), [history.items, locale]);
	const relatedSchemas = useHistoryRelatedSchemas(history);
	return (
		<HistoryRelatedSchemasProvider value={relatedSchemas}>
			{groups.map(group => (
				<React.Fragment key={group.dayKey}>
					<Divider label={group.label} labelPosition='center' />
					{group.items.map(item => <HistoryEntry key={item.id} item={item} />)}
				</React.Fragment>
			))}
		</HistoryRelatedSchemasProvider>
	);
}

/** The schemas the listed changes' edges point at, whose labels name those changes. */
function useHistoryRelatedSchemas(history: ResourceHistoryState) {
	const modelSchema = useResourceDetailContext().schemaPack?.modelSchema;
	const dottedEdges = React.useMemo(
		() => historyEdgeNames(modelSchema, history.items.flatMap(item => item.changes ?? [])).map(edge => `${edge}.id`),
		[modelSchema, history.items],
	);
	return useRelatedSchemas(modelSchema, dottedEdges);
}

/** The whole tab while nothing is shown yet: loading, a failure, or no history at all. */
function HistoryPlaceholder({ history }: { history: ResourceHistoryState }): React.ReactNode {
	const t = useTranslate('common');
	const hasFailed = Boolean(history.error) || history.clientErrors.length > 0;
	if (history.isLoading || (history.loadedPages === 0 && !hasFailed)) {
		return <Center py='md'><Loader size='sm' /></Center>;
	}
	if (hasFailed) {
		return <HistoryFailure history={history} />;
	}
	return <EmptyState icon={<IconHistory size={24} />} text={t('audit.history.empty')} />;
}

function HistoryFailure({ history }: { history: ResourceHistoryState }): React.ReactNode {
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	if (!history.error && history.clientErrors.length === 0) {
		return null;
	}
	const messages = history.clientErrors.length > 0
		? history.clientErrors.map(item => translateClientError(t, item))
		: [t('audit.history.loadFailed')];
	return (
		<Alert variant='light' color='red' icon={<IconAlertCircle />} {...tid('auditHistory', 'error')}>
			<Stack gap='xs' align='flex-start'>
				{messages.map((message, index) => <div key={index}>{message}</div>)}
				<Button onClick={history.reload} disabled={history.isLoading}>{t('action.refresh')}</Button>
			</Stack>
		</Alert>
	);
}

/**
 * Loads the next page once it scrolls into view; also a button, for a browser without
 * `IntersectionObserver` and for keyboard users.
 */
function LoadMore({ history }: { history: ResourceHistoryState }): React.ReactNode {
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	const sentinelRef = React.useRef<HTMLDivElement | null>(null);
	const { loadMore, isLoading } = history;
	React.useEffect(() => {
		const element = sentinelRef.current;
		if (!element || typeof IntersectionObserver === 'undefined') {
			return undefined;
		}
		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				loadMore();
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [loadMore]);
	return (
		<Center ref={sentinelRef} py='xs'>
			<Button variant='subtle' onClick={loadMore} loading={isLoading} {...tid('auditHistory', 'loadMore')}>
				{t('audit.history.loadMore')}
			</Button>
		</Center>
	);
}

/** Comments are not built yet; the tab exists so the panel's shape is final. */
export function CommentsTab(): React.ReactNode {
	const t = useTranslate('common');
	const tid = useResourceDetailTestAttrs();
	return (
		<div {...tid('auditComments')}>
			<EmptyState icon={<IconMessageCircle size={24} />} text={t('audit.comments.empty')} />
		</div>
	);
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }): React.ReactNode {
	return (
		<Stack align='center' gap='xs' py='md' c='dimmed'>
			{icon}
			<Text size='sm' c='dimmed' ta='center'>{text}</Text>
		</Stack>
	);
}
