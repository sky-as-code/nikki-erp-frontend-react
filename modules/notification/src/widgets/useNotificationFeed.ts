import { useMicroAppContext } from '@nikkierp/ui/microApp';
import React from 'react';

import { getCurrentOrgId } from '../common/orgContext';
import { BELL_PAGE_SIZE } from '../constants';
import { inboxService } from '../features/notification/inboxService';
import { NotificationStream } from '../features/notification/stream';

import type { StreamStatus } from '../features/notification/stream';
import type { NotificationItem } from '../features/notification/types';
import type { MicroAppApiOptions } from '@nikkierp/ui/microApp';


export type NotificationFeed = {
	items: NotificationItem[],
	unreadCount: number,
	status: StreamStatus,
	failed: boolean,
	markRead: (notificationId: string) => void,
	markAllRead: () => void,
	reload: () => void,
};

/**
 * The bell's data: the recent notifications, the unread count, and the live stream that keeps both
 * current.
 */
export function useNotificationFeed(): NotificationFeed {
	const { api } = useMicroAppContext();
	const state = useFeedState();
	const [reloadToken, setReloadToken] = React.useState(0);

	useFeedConnection(api, state, reloadToken);

	const markRead = React.useCallback((notificationId: string) => {
		const orgId = state.orgIdRef.current;
		if (!orgId) return;

		// Optimistic: the request is idempotent and the server never un-reads anything, so the
		// worst case of a failure is a count that the next load corrects.
		state.setItems(current => current.map(item => (
			item.notification_id === notificationId ? asRead(item) : item
		)));
		state.setUnreadCount(count => Math.max(0, count - 1));

		void inboxService.markRead(orgId, [notificationId]);
	}, [state]);

	const markAllRead = React.useCallback(() => {
		const orgId = state.orgIdRef.current;
		if (!orgId) return;

		const unreadIds = state.items.filter(item => !item.is_read).map(item => item.notification_id);
		if (unreadIds.length === 0) return;

		state.setItems(current => current.map(asRead));
		state.setUnreadCount(0);

		void inboxService.markRead(orgId, unreadIds);
	}, [state]);

	const reload = React.useCallback(() => setReloadToken(token => token + 1), []);

	return {
		items: state.items,
		unreadCount: state.unreadCount,
		status: state.status,
		failed: state.failed,
		markRead,
		markAllRead,
		reload,
	};
}

type FeedState = ReturnType<typeof useFeedState>;

function useFeedState() {
	const [items, setItems] = React.useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const [status, setStatus] = React.useState<StreamStatus>('connecting');
	const [failed, setFailed] = React.useState(false);
	const orgIdRef = React.useRef<string | null>(null);

	/** Merges an arriving notification, newest first, without duplicating one already shown. */
	const accept = React.useCallback((incoming: NotificationItem) => {
		setItems(current => (
			current.some(item => item.notification_id === incoming.notification_id)
				? current
				: [incoming, ...current].slice(0, BELL_PAGE_SIZE)
		));
		if (!incoming.is_read) setUnreadCount(count => count + 1);
	}, []);

	return React.useMemo(
		() => ({
			items, setItems, unreadCount, setUnreadCount,
			status, setStatus, failed, setFailed, orgIdRef, accept,
		}),
		[items, unreadCount, status, failed, accept],
	);
}

/**
 * Opens the stream and loads the first page, in that order.
 *
 * The ordering is the point, and it is the flow the requirement prescribes: connect FIRST, then
 * load. Done the other way round, a notification created between the load and the connect belongs
 * to neither and is missed until the next reload.
 */
function useFeedConnection(
	api: MicroAppApiOptions, state: FeedState, reloadToken: number,
): void {
	const { accept, setStatus, setFailed, setItems, setUnreadCount, orgIdRef } = state;

	React.useEffect(() => {
		let cancelled = false;
		let stream: NotificationStream | null = null;

		async function connect(): Promise<void> {
			const orgId = await getCurrentOrgId();
			if (cancelled) return;

			if (!orgId) {
				// No organization resolved yet. There is nothing to read and nothing to stream;
				// the Shell re-renders when it resolves one.
				setStatus('closed');
				return;
			}
			orgIdRef.current = orgId;

			stream = new NotificationStream({
				orgId,
				baseUrl: api.defaultBaseUrl,
				getAccessToken: api.getAccessToken,
				onNotification: accept,
				onStatus: next => { if (!cancelled) setStatus(next); },
			});
			stream.start();

			const [inbox, unread] = await Promise.all([
				inboxService.getInbox(orgId, { limit: BELL_PAGE_SIZE }),
				inboxService.getUnreadCount(orgId),
			]);
			if (cancelled) return;

			if (inbox.clientErrors.length > 0 || unread.clientErrors.length > 0) {
				setFailed(true);
				return;
			}
			setFailed(false);
			// Merged rather than replaced: the stream may already have delivered something newer
			// than this page, and overwriting would drop it.
			setItems(current => mergeNewestFirst(current, inbox.data?.items ?? []));
			setUnreadCount(unread.data?.count ?? 0);
		}

		void connect().catch(() => { if (!cancelled) setFailed(true); });

		return () => {
			cancelled = true;
			// Without this the backend keeps a response open for a browser that has navigated
			// away, until its own heartbeat write fails.
			stream?.close();
		};
		// `state` is deliberately not a dependency: it changes on every notification, and
		// depending on it would tear down and reopen the stream each time one arrived. The
		// setters it destructures are stable, so this list is complete in practice.
	}, [accept, api, reloadToken, orgIdRef, setFailed, setItems, setStatus, setUnreadCount]);
}

function asRead(item: NotificationItem): NotificationItem {
	return item.is_read ? item : { ...item, is_read: true, read_at: new Date().toISOString() };
}

/** Keeps the stream's arrivals ahead of a loaded page, without repeating a notification. */
function mergeNewestFirst(
	live: NotificationItem[], loaded: NotificationItem[],
): NotificationItem[] {
	const seen = new Set(live.map(item => item.notification_id));
	const merged = [...live];
	for (const item of loaded) {
		if (!seen.has(item.notification_id)) {
			seen.add(item.notification_id);
			merged.push(item);
		}
	}
	return merged
		.sort((left, right) => right.stream_seq - left.stream_seq)
		.slice(0, BELL_PAGE_SIZE);
}
