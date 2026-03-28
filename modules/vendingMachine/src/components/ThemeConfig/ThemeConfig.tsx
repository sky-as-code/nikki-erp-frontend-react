import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconPalette, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemePreviewCard } from '@/features/events/components/EventDetailDrawer/ThemePreviewCard';
import { ThemeSelectModal } from '@/features/events/components/EventDetailDrawer/ThemeSelectModal';
import { Theme } from '@/features/themes/types';


export interface ThemeConfigProps {
	theme?: Theme;
	themeId?: string;
	onChange?: (theme: Theme) => void;
	onRemove?: () => void;
}

export const ThemeConfig: React.FC<ThemeConfigProps> = ({
	theme,
	themeId,
	onChange,
	onRemove,
}) => {
	const { t: translate } = useTranslation();
	const [themeSelectModalOpened, setThemeSelectModalOpened] = useState(false);

	const handleSelectTheme = (selectedTheme: Theme) => {
		onChange?.(selectedTheme);
	};

	return (
		<div>
			<Text size='sm' c='dimmed' mb='xs' fw={500}>
				{translate('nikki.vendingMachine.events.fields.theme')}
			</Text>
			{theme ? (
				<ThemePreviewCard
					theme={theme}
					onRemove={onRemove}
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
						{onChange && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setThemeSelectModalOpened(true)}
							>
								{translate('nikki.vendingMachine.events.selectTheme.selectTheme')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<ThemeSelectModal
				opened={themeSelectModalOpened}
				onClose={() => setThemeSelectModalOpened(false)}
				onSelectTheme={handleSelectTheme}
				selectedThemeId={themeId || theme?.id}
			/>
		</div>
	);
};
