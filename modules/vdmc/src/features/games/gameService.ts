import { mockGames } from './mockGames';
import { Game, GameVersion } from './types';


function configFields(dto: Game): Game {
	return {
		...dto,
	};
}

export const gameService = {
	async listGames(): Promise<Game[]> {
		const result = await mockGames.listGames();
		return result.map(configFields);
	},

	async getGame(id: string): Promise<Game | undefined> {
		const result = await mockGames.getGame(id);
		return result ? configFields(result) : undefined;
	},

	async createGame(game: Omit<Game, 'id' | 'createdAt' | 'etag'>): Promise<Game> {
		const result = await mockGames.createGame(game);
		return configFields(result);
	},

	async updateGame(
		id: string,
		etag: string,
		updates: Partial<Omit<Game, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Game> {
		const result = await mockGames.updateGame(id, etag, updates);
		return configFields(result);
	},

	async deleteGame(id: string): Promise<void> {
		await mockGames.deleteGame(id);
	},

	async addGameVersion(gameId: string, version: GameVersion): Promise<Game> {
		const result = await mockGames.addGameVersion(gameId, version);
		return configFields(result);
	},

	async deleteGameVersion(gameId: string, versionCode: string): Promise<Game> {
		const result = await mockGames.deleteGameVersion(gameId, versionCode);
		return configFields(result);
	},
};
