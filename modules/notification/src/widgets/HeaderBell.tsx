import { Indicator, Menu, ScrollArea, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button } from '@nikkierp/ui/components';
import { IconBell } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { NOTIFICATION_MODULE } from '../constants';
import { useNotificationFeed } from './useNotificationFeed';

import type { NotificationItem, NotificationSeverity } from '../features/notification/types';


const TEST_ID = 'notification.bell';

/**
 * The notification bell in the Shell header.
 *
 * This is the module's one piece of hand-written JSX. Everything else is view-engine metadata, but
 * the bell is route-free — it is mounted as a widget by the Shell rather than reached by a URL —
 * and no page template describes a dropdown anchored in a header.
 */
export function HeaderBell(): React.ReactNode {
	const { t } = useTranslation(NOTIFICATION_MODULE);
	const [opened, setOpened] = React.useState(false);
	const { items, unreadCount, failed, markRead, markAllRead, reload } = useNotificationFeed();

	const onItemClick = (item: NotificationItem) => {
		if (!item.is_read) markRead(item.notification_id);
	};

	return (
		<Menu shadow='md' width={340} position='bottom-end' opened={opened} onChange={setOpened}>
			<Menu.Target>
				<Button
					variant={opened ? 'outline' : 'subtle'}
					aria-label={t('bell.label')}
					{...testAttrs(TEST_ID, 'trigger')}
				>
					<Indicator
						disabled={unreadCount === 0}
						label={unreadCount > 99 ? '99+' : String(unreadCount)}
						size={16}
						offset={2}
						color='red'
						{...testAttrs(TEST_ID, 'unreadBadge')}
					>
						<IconBell />
					</Indicator>
				</Button>
			</Menu.Target>

			<Menu.Dropdown {...testAttrs(TEST_ID, 'dropdown')}>
				<Menu.Label>
					{unreadCount > 0 ? t('bell.unreadCount', { count: unreadCount }) : t('bell.title')}
				</Menu.Label>

				{failed
					? <FailedState onRetry={reload} />
					: <NotificationList items={items} onItemClick={onItemClick} />}

				<Menu.Divider />

				{unreadCount > 0 && (
					<Menu.Item onClick={markAllRead} {...testAttrs(TEST_ID, 'markAllRead')}>
						{t('bell.markAllRead')}
					</Menu.Item>
				)}
				<Menu.Item
					component='a'
					href={`../${NOTIFICATION_MODULE}/notifications`}
					ta='center'
					bg='var(--mantine-color-gray-1)'
					{...testAttrs(TEST_ID, 'viewAll')}
				>
					{t('bell.viewAll')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

function NotificationList(props: {
	items: NotificationItem[],
	onItemClick: (item: NotificationItem) => void,
}): React.ReactNode {
	const { t } = useTranslation(NOTIFICATION_MODULE);

	if (props.items.length === 0) {
		return (
			<Text size='sm' c='dimmed' ta='center' py='md' {...testAttrs(TEST_ID, 'empty')}>
				{t('bell.empty')}
			</Text>
		);
	}

	return (
		<ScrollArea.Autosize mah={320} scrollbars='y'>
			{props.items.map(item => (
				// Keyed by the notification id, not the index: a new notification arrives at the
				// TOP of this list, and an index key would re-label every row below it.
				<Menu.Item
					key={item.notification_id}
					onClick={() => props.onItemClick(item)}
					leftSection={<SeverityDot severity={item.severity} />}
					{...testAttrs(TEST_ID, 'item', item.notification_id)}
				>
					<Stack gap={2}>
						<Text size='sm' fw={item.is_read ? 400 : 600} lineClamp={1}>
							{item.title}
						</Text>
						<Text size='xs' c='dimmed' lineClamp={2}>
							{item.message}
						</Text>
					</Stack>
				</Menu.Item>
			))}
		</ScrollArea.Autosize>
	);
}

function FailedState(props: { onRetry: () => void }): React.ReactNode {
	const { t } = useTranslation(NOTIFICATION_MODULE);

	return (
		<Stack gap='xs' align='center' py='md' {...testAttrs(TEST_ID, 'error')}>
			<Text size='sm' c='dimmed'>{t('bell.error')}</Text>
			<Button variant='subtle' onClick={props.onRetry} {...testAttrs(TEST_ID, 'retry')}>
				{t('bell.retry')}
			</Button>
		</Stack>
	);
}

/** Severity as a colour rather than a word, so a glance down the list reads as a shape. */
function SeverityDot(props: { severity: NotificationSeverity }): React.ReactNode {
	const colors: Record<NotificationSeverity, string> = {
		info: 'var(--mantine-color-blue-6)',
		success: 'var(--mantine-color-green-6)',
		warning: 'var(--mantine-color-yellow-6)',
		danger: 'var(--mantine-color-red-6)',
	};

	return (
		<span
			aria-hidden
			style={{
				display: 'inline-block',
				width: 8,
				height: 8,
				borderRadius: '50%',
				backgroundColor: colors[props.severity] ?? colors.info,
			}}
		/>
	);
}
