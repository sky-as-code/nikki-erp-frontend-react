import { getCurrentOrgId } from '@nikkierp/common/service';
import { useMicroAppContext } from '@nikkierp/ui/microApp';
import React from 'react';

import { BELL_PAGE_SIZE } from '../constants';
import { inboxService } from '../features/notification/inboxService';
import { acquireSharedStream } from '../features/notification/sharedStream';

import type { SharedStreamHandle } from '../features/notification/sharedStream';
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
/**
 * @param enabled false while the caller may not read the inbox: nothing is fetched and no stream
 * is opened, so a user without `read_inbox` is not met with the server's refusal at every login.
 */
export function useNotificationFeed(enabled: boolean = true): NotificationFeed {
	const { api } = useMicroAppContext();
	const state = useFeedState();
	const [reloadToken, setReloadToken] = React.useState(0);

	useFeedConnection(api, state, reloadToken, enabled);

	const markRead = React.useCallback((notificationId: string) => {
		const orgId = state.orgIdRef.current;
		if (!orgId) return;

		// Optimistic: the request is idempotent and the server never un-reads anything, so the
		// worst case of a failure is a count that the next load corrects.
		state.setItems(current => current.map(item => (
			item.notification_id === notificationId ? asRead(item) : item
		)));
		state.setUnreadCount(count => Math.max(0, count - 1));

		void markReadAndTell(state, orgId, [notificationId]);
	}, [state]);

	const markAllRead = React.useCallback(() => {
		const orgId = state.orgIdRef.current;
		if (!orgId) return;

		const unreadIds = state.items.filter(item => !item.is_read).map(item => item.notification_id);
		if (unreadIds.length === 0) return;

		state.setItems(current => current.map(asRead));
		state.setUnreadCount(0);

		void markReadAndTell(state, orgId, unreadIds);
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

/**
 * Marks read on the server, then tells the other bells. Only after the server agreed: they answer
 * by refetching their unread count, which must already reflect this change.
 */
async function markReadAndTell(state: FeedState, orgId: string, notificationIds: string[]): Promise<void> {
	const result = await inboxService.markRead(orgId, notificationIds);
	if (result.clientErrors.length === 0) state.streamRef.current?.publishRead(notificationIds);
}

function useFeedState() {
	const [items, setItems] = React.useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const [status, setStatus] = React.useState<StreamStatus>('connecting');
	const [failed, setFailed] = React.useState(false);
	const orgIdRef = React.useRef<string | null>(null);
	const streamRef = React.useRef<SharedStreamHandle | null>(null);

	/** Merges an arriving notification, newest first, without duplicating one already shown. */
	const accept = React.useCallback((incoming: NotificationItem) => {
		setItems(current => (
			current.some(item => item.notification_id === incoming.notification_id)
				? current
				: [incoming, ...current].slice(0, BELL_PAGE_SIZE)
		));
		if (!incoming.is_read) setUnreadCount(count => count + 1);
	}, []);

	/**
	 * Another bell marked these read. The items are updated in place, but the count is refetched:
	 * it covers notifications beyond the loaded page, so subtracting what is visible would drift.
	 */
	const acceptRead = React.useCallback((notificationIds: string[]) => {
		const ids = new Set(notificationIds);
		setItems(current => current.map(item => (ids.has(item.notification_id) ? asRead(item) : item)));
		const orgId = orgIdRef.current;
		if (!orgId) return;
		void inboxService.getUnreadCount(orgId).then(unread => {
			if (unread.clientErrors.length === 0) setUnreadCount(unread.data?.count ?? 0);
		});
	}, []);

	return React.useMemo(
		() => ({
			items, setItems, unreadCount, setUnreadCount,
			status, setStatus, failed, setFailed, orgIdRef, streamRef, accept, acceptRead,
		}),
		[items, unreadCount, status, failed, accept, acceptRead],
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
	api: MicroAppApiOptions, state: FeedState, reloadToken: number, enabled: boolean,
): void {
	const { accept, acceptRead, setStatus, setFailed, setItems, setUnreadCount, orgIdRef, streamRef } = state;

	React.useEffect(() => {
		if (!enabled) {
			setStatus('closed');
			return;
		}
		let cancelled = false;
		let stream: SharedStreamHandle | null = null;

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

			// Shared with the other bells of this tab and, through a leader tab, of the browser.
			stream = acquireSharedStream(
				orgId,
				{ baseUrl: api.defaultBaseUrl, ensureSession: api.ensureSession },
				{
					onNotification: accept,
					onStatus: next => { if (!cancelled) setStatus(next); },
					onRead: acceptRead,
				},
			);
			streamRef.current = stream;

			await loadFirstPage(orgId, { setFailed, setItems, setUnreadCount }, () => cancelled);
		}

		void connect().catch(() => { if (!cancelled) setFailed(true); });

		return () => {
			cancelled = true;
			// The last release ends the stream; without it the backend keeps a response open for a
			// browser that has navigated away, until its own heartbeat write fails.
			stream?.release();
			if (streamRef.current === stream) streamRef.current = null;
		};
		// `state` is deliberately not a dependency: it changes on every notification, and
		// depending on it would tear down and reopen the stream each time one arrived. The
		// setters it destructures are stable, so this list is complete in practice.
	}, [
		accept, acceptRead, api, reloadToken, enabled, orgIdRef, streamRef,
		setFailed, setItems, setStatus, setUnreadCount,
	]);
}

async function loadFirstPage(
	orgId: string,
	setters: Pick<FeedState, 'setFailed' | 'setItems' | 'setUnreadCount'>,
	isCancelled: () => boolean,
): Promise<void> {
	const [inbox, unread] = await Promise.all([
		inboxService.getInbox(orgId, { limit: BELL_PAGE_SIZE }),
		inboxService.getUnreadCount(orgId),
	]);
	if (isCancelled()) return;

	if (inbox.clientErrors.length > 0 || unread.clientErrors.length > 0) {
		setters.setFailed(true);
		return;
	}
	setters.setFailed(false);
	// Merged rather than replaced: the stream may already have delivered something newer than
	// this page, and overwriting would drop it.
	setters.setItems(current => mergeNewestFirst(current, inbox.data?.items ?? []));
	setters.setUnreadCount(unread.data?.count ?? 0);
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
