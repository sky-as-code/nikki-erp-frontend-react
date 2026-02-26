import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, ActionBarFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	GameDetailDrawer,
	GameGridView,
	GameTable,
	gameSchema,
	useGameDetail,
	useGameList,
} from '@/features/games';
import { Game } from '@/features/games/types';


// eslint-disable-next-line max-lines-per-function
export const GamesPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { games, isLoadingList, handleRefresh } = useGameList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Game>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedGameId, setSelectedGameId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { game: selectedGame, isLoading: isLoadingDetail } = useGameDetail(selectedGameId);


	// Filter and search games
	const filteredGames = useMemo(() => {
		let filtered = games || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((game: Game) => statusFilter.includes(game.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(game: Game) =>
					game.code.toLowerCase().includes(searchLower) ||
					game.name.toLowerCase().includes(searchLower),
			) as Game[];
		}

		return filtered;
	}, [games, statusFilter, searchValue]);

	const handleViewDetail = (gameId: string) => {
		setSelectedGameId(gameId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedGameId(undefined);
	};

	const handleOpenDeleteModal = (gameId: string) => {
		const game = games.find((g: Game) => g.id === gameId);
		if (game) {
			configOpenModal(game);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete game:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create game');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const filters: ActionBarFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.games.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.miniGame');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.miniGame'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={
					<ActionBar
						onCreate={handleCreate}
						onRefresh={handleRefresh}
						searchValue={searchValue}
						onSearchChange={setSearchValue}
						filters={filters}
						searchPlaceholder={translate('nikki.vendingMachine.games.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						viewModeSegments={['list', 'grid']}
					/>
				}
			>
				{viewMode === 'list' ? (
					<GameTable
						columns={['code', 'name', 'description', 'status', 'latestVersion', 'minAppVersion', 'actions']}
						data={filteredGames as unknown as Record<string, unknown>[]}
						schema={gameSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<GameGridView
						games={filteredGames}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				)}
			</PageContainer>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('nikki.general.messages.delete_confirm')}
				message={
					item
						? translate('nikki.general.messages.delete_confirm_name', { name: item.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<GameDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				game={selectedGame}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
