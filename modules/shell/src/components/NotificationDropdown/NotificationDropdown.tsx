import { LazyMicroWidget } from '@nikkierp/ui/microApp';
import React from 'react';


/**
 * The notification bell in the header.
 *
 * The Shell owns only the PLACEMENT. The bell itself — the unread count, the dropdown, the live
 * stream that feeds both — belongs to the notification micro-app, which owns the backend module it
 * talks to.
 *
 * The coupling is the slug string and nothing else: the Shell must not import
 * `@nikkierp/microapp-notification`, and eslint blocks it from doing so. The micro-app declares
 * this widget with `<WidgetRoute name='widgets.headerBell' />`; neither side imports the other.
 *
 * Mounting it here downloads and initialises the notification bundle on every authenticated page,
 * because the header is always rendered. That is deliberate: the bell has to show an accurate
 * unread count before anyone clicks it, and a count fetched by the Shell would need the Shell to
 * know the notification API — which is exactly the coupling this avoids.
 */
export const NotificationDropdown: React.FC = () => {
	return <LazyMicroWidget slug='notification' widgetName='widgets.headerBell' />;
};
