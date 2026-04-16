import { Avatar, Box, Button, Drawer, DrawerProps, Flex, Group, Text } from '@mantine/core';
import { IconBox, IconExternalLink, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export type PreviewDrawerProps = {
	header?: {
		title?: string;
		subtitle?: string;
		avatar?: React.ReactNode;
	};
	opened: boolean;
	onClose: () => void;
	onViewDetails?: () => void;
	drawerProps?: DrawerProps;
	children: React.ReactNode;
	isLoading?: boolean;
	isNotFound?: boolean;
};

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
	header,
	opened,
	onClose,
	onViewDetails,
	drawerProps,
	children,
	isLoading = false,
	isNotFound = false,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Drawer.Root
			opened={opened} onClose={onClose}
			position='right' size='xl' offset={8} radius='md'
			{...drawerProps}
		>
			<Drawer.Overlay opacity={0.6} blur={4}/>
			<Drawer.Content>
				<Drawer.Header>
					{header && <Header
						title={header.title}
						subtitle={header.subtitle}
						avatar={header.avatar}
						onViewDetails={onViewDetails}
						onClose={onClose}
					/>}
				</Drawer.Header>
				<Drawer.Body p={{ base: 'md', lg: 'lg' }}>
					{
						isLoading ? <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text> :
							isNotFound ? <Text c='dimmed'>{translate('nikki.general.messages.not_found')}</Text> :
								children
					}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};

const Header: React.FC<{
	title?: string;
	subtitle?: string;
	avatar?: React.ReactNode;
	onViewDetails?: () => void,
	onClose?: () => void
}> = ({ title = '', subtitle = '', avatar, onViewDetails, onClose }) => {
	const { t: translate } = useTranslation();

	return (
		<Flex gap='md' justify='space-between' wrap='wrap' w={'100%'}>
			<Group gap='sm' align='start'>
				<Avatar
					size={60} radius='md'
					src={typeof avatar === 'string' ? avatar : undefined}
				>
					{avatar && typeof avatar !== 'string'
						? avatar
						: <IconBox size={60} />
					}
				</Avatar>
				<Box>
					<Text fw={600} size='lg' lh={1} mb='xs'>{title}</Text>
					<Text size='sm' c='dimmed'>
						{subtitle}
					</Text>
				</Box>
			</Group>

			<Group gap='xs' align='start'>
				{onViewDetails && (
					<Button
						size='xs' variant='filled'
						leftSection={<IconExternalLink size={16} />}
						onClick={onViewDetails}
					>
						{translate('nikki.general.actions.viewDetails')}
					</Button>
				)}
				<Button
					variant='transparent'
					size='xs' p={3}
					onClick={onClose || (() => {})}
				>
					<IconX size={20} color='var(--mantine-color-gray-6)' />
				</Button>
			</Group>
		</Flex>
	);
};