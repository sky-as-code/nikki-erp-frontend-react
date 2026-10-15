import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildNotificationPages } from './notification';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


describe('Notification page metadata', () => {
	// Building runs each prop builder's zod `parse`, and every page schema is `.strict()`.
	it('survives a JSON round-trip unchanged', () => {
		const pages = buildNotificationPages();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it('nests a v2 list and a v2 detail in a split view', () => {
		const [page] = buildNotificationPages();
		const { primary, secondary } = page.props as { primary: TemplateRef, secondary: TemplateRef };

		expect(page.routePath).toBe('notification_notification');
		expect(primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
		expect(secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
	});

	// Notifications are written by the system, never by hand.
	it('offers no create and no inline row editing', () => {
		const [page] = buildNotificationPages();
		const { primary } = page.props as { primary: TemplateRef<{ createEnabled?: boolean, updateCommand?: string }> };

		expect(primary.props?.createEnabled).toBe(false);
		expect(primary.props?.updateCommand).toBeUndefined();
	});
});
