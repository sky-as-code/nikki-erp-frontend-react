import { useUIState } from '@common/context/UIProviders'
import { ActionIcon, Avatar, Menu, Text } from '@mantine/core'
import { useAuth } from '@modules/core/auth/AuthProvider'
import {
	IconArrowsLeftRight,
	IconMessageCircle,
	IconPhoto,
	IconSettings,
	IconTrash,
} from '@tabler/icons-react'

export const UserAvatar = () => {
	const { logout } = useAuth()
	const { notification: notif } = useUIState()

	const handleLogout = () => {
		logout()
		notif.showInfo('You have been logged out', 'Logout')
	}

	return (
		<Menu shadow='md' width={200}>
			<Menu.Target>
				<ActionIcon variant='subtle' size='compact-md'>
					<Avatar size={50} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item leftSection={<Avatar size={50} />}>
					<Text>John Doe</Text>
				</Menu.Item>

				<Menu.Divider />

				<Menu.Label>Application</Menu.Label>
				<Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
				<Menu.Item leftSection={<IconMessageCircle size={14} />}>
					Messages
				</Menu.Item>
				<Menu.Item leftSection={<IconPhoto size={14} />}>Gallery</Menu.Item>

				<Menu.Divider />

				<Menu.Label>Danger zone</Menu.Label>
				<Menu.Item leftSection={<IconArrowsLeftRight size={14} />}>
					Transfer my data
				</Menu.Item>
				<Menu.Item
					color='red'
					leftSection={<IconTrash size={14} />}
					onClick={handleLogout}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
