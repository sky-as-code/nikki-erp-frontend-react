/* eslint-disable max-lines-per-function */
import {
	Badge, Box, Button, Divider, Drawer, FileButton, Group, Select, Stack, Table, Tabs, Text, Textarea, TextInput,
} from '@mantine/core';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceGamepad, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, gameActions } from '@/appState';

import { Game, GameStatus, GameVersion } from '../../types';
import { GamePreview } from '../GamePreview';


export interface GameDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	game: Game | undefined;
	isLoading?: boolean;
}

export const GameDetailDrawer: React.FC<GameDetailDrawerProps> = ({
	opened,
	onClose,
	game,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [editedGame, setEditedGame] = useState<Partial<Game>>({});
	const [selectedVersion, setSelectedVersion] = useState<GameVersion | undefined>(undefined);
	const [newVersionCode, setNewVersionCode] = useState('');
	const [newVersionDescription, setNewVersionDescription] = useState('');
	const [newVersionSource, setNewVersionSource] = useState('');
	const [isAddingVersion, setIsAddingVersion] = useState(false);

	React.useEffect(() => {
		if (game) {
			setEditedGame({
				code: game.code,
				name: game.name,
				description: game.description,
				status: game.status,
				minAppVersion: game.minAppVersion,
			});
			setSelectedVersion(game.versions.find((v) => v.code === game.latestVersion) || game.versions[0]);
		}
	}, [game]);

	const getStatusBadge = (status: GameStatus) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleSave = async () => {
		if (!game) return;
		await dispatch(gameActions.updateGame({
			id: game.id,
			etag: game.etag,
			updates: editedGame,
		}));
		setIsEditing(false);
	};

	const handleCancel = () => {
		if (game) {
			setEditedGame({
				code: game.code,
				name: game.name,
				description: game.description,
				status: game.status,
				minAppVersion: game.minAppVersion,
			});
		}
		setIsEditing(false);
	};

	const handleAddVersion = async () => {
		if (!game || !newVersionCode.trim() || !newVersionSource.trim()) return;

		const newVersion: GameVersion = {
			code: newVersionCode.trim(),
			description: newVersionDescription.trim() || '',
			source: newVersionSource,
			uploadDate: new Date().toISOString(),
		};

		await dispatch(gameActions.addGameVersion({
			gameId: game.id,
			version: newVersion,
		}));

		setNewVersionCode('');
		setNewVersionDescription('');
		setNewVersionSource('');
		setIsAddingVersion(false);
	};

	const handleDeleteVersion = async (versionCode: string) => {
		if (!game) return;
		if (window.confirm(translate('nikki.vendingMachine.games.messages.delete_version_confirm'))) {
			await dispatch(gameActions.deleteGameVersion({
				gameId: game.id,
				versionCode,
			}));
		}
	};

	const handleFileUpload = (file: File | null) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			setNewVersionSource(content);
		};
		reader.readAsText(file);
	};

	if (isLoading || !game) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='xl'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.games.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='xl'
			title={
				<Group gap='xs'>
					<IconDeviceGamepad size={26} stroke={1.5} />
					<Text fw={600} size='lg'>{game.name}</Text>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Tabs defaultValue='info'>
				<Tabs.List>
					<Tabs.Tab value='info'>{translate('nikki.vendingMachine.games.tabs.info')}</Tabs.Tab>
					<Tabs.Tab value='versions'>{translate('nikki.vendingMachine.games.tabs.versions')}</Tabs.Tab>
					<Tabs.Tab value='preview'>{translate('nikki.vendingMachine.games.tabs.preview')}</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='info' pt='md'>
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text fw={500} size='lg'>{translate('nikki.vendingMachine.games.detail.info')}</Text>
							{!isEditing ? (
								<Button size='xs' onClick={() => setIsEditing(true)}>
									{translate('nikki.general.actions.edit')}
								</Button>
							) : (
								<Group gap='xs'>
									<Button size='xs' onClick={handleSave}>
										{translate('nikki.general.actions.save')}
									</Button>
									<Button size='xs' variant='subtle' onClick={handleCancel}>
										{translate('nikki.general.actions.cancel')}
									</Button>
								</Group>
							)}
						</Group>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.code')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.code || ''}
									onChange={(e) => setEditedGame({ ...editedGame, code: e.currentTarget.value })}
								/>
							) : (
								<Text size='sm' fw={500}>{game.code}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.name')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.name || ''}
									onChange={(e) => setEditedGame({ ...editedGame, name: e.currentTarget.value })}
								/>
							) : (
								<Text size='sm'>{game.name}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.description')}
							</Text>
							{isEditing ? (
								<Textarea
									value={editedGame.description || ''}
									onChange={(e) =>
										setEditedGame({ ...editedGame, description: e.currentTarget.value })}
									rows={4}
								/>
							) : (
								<Text size='sm'>{game.description}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.status')}
							</Text>
							{isEditing ? (
								<Select
									value={editedGame.status}
									onChange={(value) => setEditedGame({ ...editedGame, status: value as GameStatus })}
									data={[
										{ value: 'active', label: translate('nikki.general.status.active') },
										{ value: 'inactive', label: translate('nikki.general.status.inactive') },
									]}
								/>
							) : (
								getStatusBadge(game.status)
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.latestVersion')}
							</Text>
							<Text size='sm'>{game.latestVersion || '-'}</Text>
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.minAppVersion')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.minAppVersion || ''}
									onChange={(e) =>
										setEditedGame({ ...editedGame, minAppVersion: e.currentTarget.value })}
									placeholder='1.0.0'
								/>
							) : (
								<Text size='sm'>{game.minAppVersion || '-'}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.createdAt')}
							</Text>
							<Text size='sm'>{new Date(game.createdAt).toLocaleString()}</Text>
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.games.fields.uploadDate')}
							</Text>
							<Text size='sm'>{new Date(game.uploadDate).toLocaleString()}</Text>
						</div>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='versions' pt='md'>
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text fw={500} size='lg'>{translate('nikki.vendingMachine.games.detail.versions')}</Text>
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setIsAddingVersion(true)}
							>
								{translate('nikki.vendingMachine.games.actions.add_version')}
							</Button>
						</Group>

						<Divider />

						{isAddingVersion && (
							<Box p='md' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
								<Stack gap='sm'>
									<TextInput
										label={translate('nikki.vendingMachine.games.fields.versionCode')}
										placeholder='v1.0.0'
										value={newVersionCode}
										onChange={(e) => setNewVersionCode(e.currentTarget.value)}
									/>
									<Textarea
										label={translate('nikki.vendingMachine.games.fields.versionDescription')}
										placeholder={translate('nikki.vendingMachine.games.fields.versionDescription')}
										value={newVersionDescription}
										onChange={(e) => setNewVersionDescription(e.currentTarget.value)}
										rows={3}
									/>
									<FileButton onChange={handleFileUpload} accept='.html,.htm'>
										{(props) => (
											<Button {...props} leftSection={<IconUpload size={14} />} variant='light'>
												{translate('nikki.vendingMachine.games.actions.upload_source')}
											</Button>
										)}
									</FileButton>
									{newVersionSource && (
										<Text size='xs' c='green'>
											{translate('nikki.vendingMachine.games.messages.source_loaded')}
										</Text>
									)}
									<Textarea
										label={translate('nikki.vendingMachine.games.fields.source')}
										placeholder={translate('nikki.vendingMachine.games.fields.source_placeholder')}
										value={newVersionSource}
										onChange={(e) => setNewVersionSource(e.currentTarget.value)}
										rows={10}
									/>
									<Group>
										<Button size='xs' onClick={handleAddVersion} disabled={!newVersionCode.trim() || !newVersionSource.trim()}>
											{translate('nikki.general.actions.add')}
										</Button>
										<Button size='xs' variant='subtle' onClick={() => {
											setIsAddingVersion(false);
											setNewVersionCode('');
											setNewVersionDescription('');
											setNewVersionSource('');
										}}>
											{translate('nikki.general.actions.cancel')}
										</Button>
									</Group>
								</Stack>
							</Box>
						)}

						{game.versions.length > 0 ? (
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>{translate('nikki.vendingMachine.games.fields.versionCode')}</Table.Th>
										<Table.Th>{translate('nikki.vendingMachine.games.fields.versionDescription')}</Table.Th>
										<Table.Th>{translate('nikki.vendingMachine.games.fields.uploadDate')}</Table.Th>
										<Table.Th style={{ width: 100 }}></Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{game.versions.map((version) => (
										<Table.Tr key={version.code}>
											<Table.Td>
												<Group gap='xs'>
													<Text fw={version.code === game.latestVersion ? 600 : 400}>
														{version.code}
													</Text>
													{version.code === game.latestVersion && (
														<Badge size='xs' color='blue'>
															{translate('nikki.vendingMachine.games.fields.latest')}
														</Badge>
													)}
												</Group>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{version.description || '-'}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{new Date(version.uploadDate).toLocaleString()}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Button
														variant='subtle'
														color='red'
														size='xs'
														onClick={() => handleDeleteVersion(version.code)}
														disabled={
															version.code === game.latestVersion &&
															game.versions.length === 1
														}
													>
														<IconTrash size={14} />
													</Button>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						) : (
							<Text c='dimmed'>{translate('nikki.vendingMachine.games.messages.no_versions')}</Text>
						)}
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='preview' pt='md'>
					<Stack gap='md'>
						<Text fw={500} size='lg'>{translate('nikki.vendingMachine.games.detail.preview')}</Text>
						<Divider />
						{game.versions.length > 0 ? (
							<>
								<Select
									label={translate('nikki.vendingMachine.games.fields.selectVersion')}
									value={selectedVersion?.code || game.versions[0]?.code}
									onChange={(value) => {
										const version = game.versions.find((v) => v.code === value);
										if (version) {
											setSelectedVersion(version);
										}
									}}
									data={game.versions.map((v) => ({ value: v.code, label: v.code }))}
								/>
								<GamePreview game={game} version={selectedVersion || game.versions[0]} />
							</>
						) : (
							<Text c='dimmed'>{translate('nikki.vendingMachine.games.messages.no_versions')}</Text>
						)}
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Drawer>
	);
};
