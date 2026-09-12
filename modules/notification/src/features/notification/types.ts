/** One notification as its recipient sees it. Mirrors the backend's InboxItemDto. */
export type NotificationItem = {
	notification_id: string,
	stream_seq: number,
	title: string,
	message: string,
	severity: NotificationSeverity,
	source_module: string,
	source_resource_name?: string,
	source_resource_key?: Record<string, unknown>,
	metadata?: Record<string, unknown>,
	created_at: string,
	read_at?: string,
	is_read: boolean,
};

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

export type InboxPage = {
	items: NotificationItem[],

	/** The cursor for the next page, absent on the last one. */
	next_cursor?: number,
};

export type UnreadCount = {
	count: number,
};

export type MarkReadResult = {
	requested_count: number,
	updated_count: number,
	already_read_count: number,
};

export type InboxQuery = {
	is_read?: boolean,
	severity?: NotificationSeverity,
	source_module?: string,
	cursor?: number,
	limit?: number,
};

/**
 * One line of the NDJSON stream.
 *
 * `seq` is absent on a heartbeat, which is why it is optional: a heartbeat is not a position in
 * the stream and must never advance the client's cursor.
 */
export type StreamEvent = {
	seq?: number,
	type: string,
	data?: NotificationItem,
};

export const STREAM_EVENT_NOTIFICATION_CREATED = 'notification.created';
export const STREAM_EVENT_HEARTBEAT = 'heartbeat';
