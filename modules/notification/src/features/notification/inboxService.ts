import { storeService } from '@nikkierp/ui/appState/store';

import {
	INBOX_PATH, MARK_READ_PATH, UNREAD_COUNT_PATH,
} from '../../constants';
import { notificationStore } from '../../store';
import { apiGet, apiPost } from '../http';

import type { InboxPage, InboxQuery, MarkReadResult, UnreadCount } from './types';
import type { RequestResult } from '@nikkierp/common/request';


/**
 * Reads and updates the signed-in person's own notifications.
 *
 * Not a `StoreCrudServiceBase`: none of these endpoints is dynamic-model CRUD. They are addressed
 * by no record id, and whose notifications they answer is decided by the server from the request
 * context — which is exactly why there is no user id anywhere in this file, and adding one would
 * be a security bug rather than a feature.
 */
@storeService('InboxService', notificationStore)
export class InboxService {
	/**
	 * One page of the inbox, newest first.
	 *
	 * `orgId` is required and not optional-by-accident: an org-scoped read without it filters on
	 * an empty organization and comes back empty, which looks like "no notifications" rather than
	 * like a mistake.
	 */
	public getInbox(orgId: string, query?: InboxQuery): Promise<RequestResult<InboxPage>> {
		return apiGet<InboxPage>(INBOX_PATH, { org_id: orgId, ...query });
	}

	public getUnreadCount(orgId: string): Promise<RequestResult<UnreadCount>> {
		return apiGet<UnreadCount>(UNREAD_COUNT_PATH, { org_id: orgId });
	}

	/**
	 * Marks notifications read. Ids belonging to somebody else are silently not updated rather
	 * than refusing the whole batch, so one stray id cannot lose every real read in it.
	 */
	public markRead(orgId: string, notificationIds: string[]): Promise<RequestResult<MarkReadResult>> {
		return apiPost<MarkReadResult>(`${MARK_READ_PATH}?org_id=${encodeURIComponent(orgId)}`, {
			notification_ids: notificationIds,
		});
	}
}

export const inboxService = new InboxService();
