import { Button, Text, Menu, ScrollArea } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { IconBell } from '@tabler/icons-react';
import React from 'react';


const TEST_ID = 'shell.notifications';

export const NotificationDropdown: React.FC = () => {
	const [notifications, _setNotifications] = React.useState<any[]>(mockNotifications);
	const [opened, setOpened] = React.useState(false);

	// Indexed because the mock notifications carry no id. Give them one when this is wired to the
	// real feed, so a test's handle survives new notifications arriving at the top of the list.
	const renderNotification = (notification: any, index: number) => {
		return (
			<Menu.Item key={index} leftSection={notification.icon} {...testAttrs(TEST_ID, 'item', index)}>
				<Text size='sm' fw={500}>
					{notification.title}
				</Text>
				<Text size='xs' c='dimmed' lineClamp={2}>
					{notification.message}
				</Text>
			</Menu.Item>
		);
	};


	return (
		<Menu shadow='md' width={300} position='bottom-end'
			opened={opened} onChange={setOpened}
		>
			<Menu.Target>
				<Button
					w={35} h={35} p={0} variant={opened ? 'outline' : 'subtle'}
					{...testAttrs(TEST_ID, 'trigger')}
				>
					<IconBell/>
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<ScrollArea h={250} scrollbars='y'>
					{notifications.map(renderNotification)}
				</ScrollArea>
				<Menu.Item
					ta={'center'} bg={'var(--mantine-color-gray-1)'}
					{...testAttrs(TEST_ID, 'viewAll')}
				>
					View all
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

const mockNotifications = [
	{
		title: 'New message from John',
		message: 'You have 3 new messages',
		time: '10:00 AM',
		icon: <IconBell />,
	},
	{
		title: 'New message from John',
		message: 'You have 2 new messages',
		time: '09:00 AM',
		icon: <IconBell />,
	},
	{
		title: 'Identity',
		message: 'You password will be expired in 7 days. Change your password to avoid...',
		time: '10:00 AM',
		icon: <IconBell />,
	},
];