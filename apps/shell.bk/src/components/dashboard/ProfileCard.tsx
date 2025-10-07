'use client'

import {
	ActionIcon,
	Avatar,
	Button,
	Card, CardSection,
	Flex,
	Group,
	Menu, MenuTarget, MenuDropdown, MenuItem,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import {
	IconDots, IconEye, IconFileZip, IconTrash,
} from '@tabler/icons-react'

const sectionStyle = {
	padding: 'var(--mantine-spacing-md)',
	borderTop: '1px solid lightdark(var(--mantine-colors-gray-3), var(--mantine-colors-dark-4))',
}

function formatWalletAddress(address: string) {
	return `${address.slice(0, 12)}..${address.slice(-4)}`
}

function ProfileMenu() {
	return (
		<Menu withinPortal position='bottom-end' shadow='sm'>
			<MenuTarget>
				<ActionIcon variant='subtle'>
					<IconDots size='1rem' />
				</ActionIcon>
			</MenuTarget>

			<MenuDropdown>
				<MenuItem leftSection={<IconFileZip size={14} />}>
					Action One
				</MenuItem>
				<MenuItem leftSection={<IconEye size={14} />}>
					Action Two
				</MenuItem>
				<MenuItem leftSection={<IconTrash size={14} />} color='red'>
					Action Three
				</MenuItem>
			</MenuDropdown>
		</Menu>
	)
}

function ProfileHeader() {
	return (
		<>
			<Group justify='space-between'>
				<Avatar radius='xl' />
				<ProfileMenu />
			</Group>

			<Space h='md' />

			<Flex direction='column'>
				<Title order={5}>Joshua Lee</Title>
				<Space h='xs' />
				<Text fz='sm' c='dimmed' fw='500'>
					jotyy318@email.com
				</Text>
				<Space h='4' />
				<Text fz='sm' c='dimmed' fw='500'>
					{formatWalletAddress('0x3D2f3bA6737C6999850E0c0Fe571190E6d27C40C')}
				</Text>
			</Flex>
		</>
	)
}

function BalanceInfo() {
	return (
		<Group grow>
			<Stack gap={4}>
				<Text fz='sm' fw='500'>
					Balance
				</Text>
				<Title order={3}>$9821</Title>
			</Stack>
			<Stack gap={4}>
				<Text fz='sm' fw='500'>
					Chain
				</Text>
				<Title order={3}>Etherum</Title>
			</Stack>
		</Group>
	)
}

function ActionButtons() {
	return (
		<Group>
			<Button variant='light'>Deposit</Button>
			<Button>Buy/Sell</Button>
		</Group>
	)
}

export function ProfileCard() {
	return (
		<Card radius='md'>
			<CardSection style={sectionStyle}>
				<ProfileHeader />
			</CardSection>

			<CardSection style={sectionStyle}>
				<BalanceInfo />
			</CardSection>

			<CardSection style={sectionStyle}>
				<ActionButtons />
			</CardSection>
		</Card>
	)
}
