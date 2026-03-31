/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconPalette, IconSearch } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockThemes } from '@/features/themes/mockThemes';
import { Theme } from '@/features/themes/types';


export interface ThemeSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectTheme: (theme: Theme) => void;
	selectedThemeId?: string;
}

export const ThemeSelectModal: React.FC<ThemeSelectModalProps> = ({
	opened,
	onClose,
	onSelectTheme,
}) => {
	const { t: translate } = useTranslation();
	const [themes, setThemes] = useState<Theme[]>([]);
	const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>();
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		if (opened) {
			mockThemes.listThemes().then(setThemes);
		}
	}, [opened]);

	const filteredThemes = useMemo(() => {
		if (!searchQuery.trim()) return themes;
		const query = searchQuery.toLowerCase();
		return themes.filter(
			(theme) =>
				theme.name.toLowerCase().includes(query) ||
				theme.code.toLowerCase().includes(query) ||
				theme.description?.toLowerCase().includes(query),
		);
	}, [themes, searchQuery]);

	const handleSelectTheme = (theme: Theme) => {
		setSelectedTheme(theme);
	};

	const handleConfirm = () => {
		if (selectedTheme) {
			onSelectTheme(selectedTheme);
		}
		setSelectedTheme(undefined);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedTheme(undefined);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectTheme.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectTheme.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Themes Grid */}
				<ScrollArea h={400}>
					{filteredThemes.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.events.selectTheme.noThemes')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredThemes.map((theme) => {
								const isSelected = selectedTheme?.id === theme.id;
								return (
									<Card
										key={theme.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleSelectTheme(theme)}
									>
										<Stack gap='xs'>
											<Group gap='xs' justify='space-between'>
												<Group gap='xs'>
													<IconPalette size={20} />
													<Text size='sm' fw={500}>{theme.name}</Text>
												</Group>
												<Badge size='sm'>{theme.code}</Badge>
											</Group>
											{theme.description && (
												<Text size='xs' c='dimmed' lineClamp={2}>
													{theme.description}
												</Text>
											)}
											<Group gap='xs'>
												<Badge size='sm' variant='light' color={theme.status === 'active' ? 'green' : 'gray'}>
													{theme.status}
												</Badge>
												<Box
													w={20}
													h={20}
													style={{
														backgroundColor: theme.primaryColor,
														borderRadius: 4,
														border: '1px solid #ddd',
													}}
												/>
											</Group>
										</Stack>
									</Card>
								);
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedTheme}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
