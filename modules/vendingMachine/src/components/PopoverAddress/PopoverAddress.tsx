import { Popover } from '@mantine/core';
import { Stack, Text, Button } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


interface PopoverAddressProps {
	address?: string | null;
	latitude?: string | null;
	longitude?: string | null;
}
export const PopoverAddress: React.FC<PopoverAddressProps> = ({ address, latitude, longitude }) => {

	const { t: translate } = useTranslation();

	const handleOpenGoogleMaps = (e: React.MouseEvent) => {
		e.stopPropagation();
		let googleMapsUrl = '';

		if (latitude && longitude) {
			googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
		}
		else if (address) {
			googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		}

		if (googleMapsUrl) {
			window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const popoverContent = (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{address || translate?.('nikki.general.messages.no_address') || 'No address'}
			</Text>
			<Button
				size='xs'
				variant='light'
				leftSection={<IconMapPin size={14} />}
				onClick={(e) => handleOpenGoogleMaps(e)}
			>
				{translate?.('nikki.general.actions.view_on_map') || 'View on map'}
			</Button>
		</Stack>
	);

	return (
		<Popover
			width={300}
			position='top-start'
			withArrow
			shadow='md'
			transitionProps={{
				transition: 'fade-up',
				duration: 150,
				timingFunction: 'ease-in-out',
			}}
		>
			<Popover.Target>
				<Button
					size='xs'
					variant='transparent'
					leftSection={<IconMapPin size={14} />}
				>
					<Text size='sm' c='dimmed' lineClamp={1} style={{ maxWidth: 200 }}>
						{address}
					</Text>
				</Button>
			</Popover.Target>
			{address && <Popover.Dropdown>{popoverContent}</Popover.Dropdown>}
		</Popover>
	);
};