import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconPalette, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemePreviewCard } from '@/features/events/components/EventDetailDrawer/ThemePreviewCard';
import { ThemeSelectModal } from '@/features/events/components/EventDetailDrawer/ThemeSelectModal';

import type { Theme } from '@/features/themes/types';


export interface ThemeSelectProps {
	value: Theme | undefined;
	onChange: (value: Theme | undefined) => void;
	isEditing: boolean;
}

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
	value,
	onChange,
	isEditing,
}) => {
	const { t: translate } = useTranslation();
	const [modalOpened, setModalOpened] = useState(false);

	return (
		<div>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('nikki.vendingMachine.events.fields.theme')}
			</Text>
			{value ? (
				<ThemePreviewCard
					theme={value}
					onRemove={isEditing ? () => onChange(undefined) : undefined}
				/>
			) : (
				<Card withBorder p='sm' radius='md'>
					<Group gap='xs' justify='space-between'>
						<Box>
							<Group gap='xs' mb='sm'>
								<IconPalette size={20} />
								<Text size='sm' fw={500}>
									{translate('nikki.vendingMachine.events.fields.theme')}
								</Text>
							</Group>
							<Text size='sm' c='dimmed'>
								{translate('nikki.vendingMachine.events.messages.no_theme')}
							</Text>
						</Box>
						{isEditing && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setModalOpened(true)}
							>
								{translate('nikki.vendingMachine.events.selectTheme.selectTheme')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<ThemeSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectTheme={(theme) => {
					onChange(theme);
					setModalOpened(false);
				}}
			/>
		</div>
	);
};
