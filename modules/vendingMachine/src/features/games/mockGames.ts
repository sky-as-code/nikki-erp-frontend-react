import angryBirdsGameSourceV1_0_0 from './angrybird-v1_0_0.html?raw';
import angryBirdsGameSourceV1_1_0 from './angrybird-v1_1_0.html?raw';
import { Game, GameVersion } from './types';


// Mock data for games
const mockGamesData: Game[] = [
	{
		id: '1',
		code: 'ANGRY_BIRDS',
		name: 'Angry Birds Mini',
		description: 'Trò chơi bắn chim giống Angry Birds. Kéo và thả để bắn chim vào các con lợn xanh và phá hủy các khối gỗ.',
		status: 'active',
		versions: [
			{
				code: 'v1.0.0',
				description: 'Phiên bản đầu tiên với cơ chế bắn chim cơ bản',
				source: angryBirdsGameSourceV1_0_0,
				uploadDate: '2024-01-15T10:00:00Z',
			},
			{
				code: 'v1.1.0',
				description: 'Phiên bản với hình ảnh nhân vật chim, background và cột theo phong cách Angry Birds',
				source: angryBirdsGameSourceV1_1_0,
				uploadDate: '2024-02-01T14:30:00Z',
			},
		],
		latestVersion: 'v1.1.0',
		uploadDate: '2024-02-01T14:30:00Z',
		minAppVersion: '1.0.0',
		createdAt: '2024-01-15T10:00:00Z',
		etag: 'etag-game-001',
	},
	{
		id: '2',
		code: 'SNAKE',
		name: 'Snake Game',
		description: 'Trò chơi rắn săn mồi cổ điển. Điều khiển con rắn để ăn thức ăn và tránh va chạm.',
		status: 'active',
		versions: [
			{
				code: 'v1.0.0',
				description: 'Phiên bản cơ bản của trò chơi rắn',
				source: '<!DOCTYPE html><html><head><title>Snake Game</title></head><body><h1>Snake Game - Coming Soon</h1></body></html>',
				uploadDate: '2024-01-20T09:00:00Z',
			},
		],
		latestVersion: 'v1.0.0',
		uploadDate: '2024-01-20T09:00:00Z',
		minAppVersion: '1.0.0',
		createdAt: '2024-01-20T09:00:00Z',
		etag: 'etag-game-002',
	},
	{
		id: '3',
		code: 'TETRIS',
		name: 'Tetris',
		description: 'Trò chơi xếp hình Tetris kinh điển. Xếp các khối để tạo thành hàng và ghi điểm.',
		status: 'inactive',
		versions: [
			{
				code: 'v0.9.0',
				description: 'Phiên bản beta đang phát triển',
				source: '<!DOCTYPE html><html><head><title>Tetris</title></head><body><h1>Tetris - Beta Version</h1></body></html>',
				uploadDate: '2024-01-25T11:00:00Z',
			},
		],
		latestVersion: 'v0.9.0',
		uploadDate: '2024-01-25T11:00:00Z',
		minAppVersion: '1.2.0',
		createdAt: '2024-01-25T11:00:00Z',
		etag: 'etag-game-003',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGames = {
	async listGames(): Promise<Game[]> {
		await delay(500);
		return [...mockGamesData];
	},

	async getGame(id: string): Promise<Game | undefined> {
		await delay(300);
		return mockGamesData.find((g) => g.id === id);
	},

	async createGame(game: Omit<Game, 'id' | 'createdAt' | 'etag'>): Promise<Game> {
		await delay(500);
		const newGame: Game = {
			...game,
			id: String(mockGamesData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-game-${Date.now()}`,
		};
		mockGamesData.push(newGame);
		return newGame;
	},

	async updateGame(
		id: string,
		etag: string,
		updates: Partial<Omit<Game, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Game> {
		await delay(500);
		const index = mockGamesData.findIndex((g) => g.id === id);
		if (index === -1) {
			throw new Error('Game not found');
		}
		const updatedGame: Game = {
			...mockGamesData[index],
			...updates,
			etag: `etag-game-${Date.now()}`,
		};
		mockGamesData[index] = updatedGame;
		return updatedGame;
	},

	async deleteGame(id: string): Promise<void> {
		await delay(500);
		const index = mockGamesData.findIndex((g) => g.id === id);
		if (index === -1) {
			throw new Error('Game not found');
		}
		mockGamesData.splice(index, 1);
	},

	async addGameVersion(gameId: string, version: GameVersion): Promise<Game> {
		await delay(500);
		const index = mockGamesData.findIndex((g) => g.id === gameId);
		if (index === -1) {
			throw new Error('Game not found');
		}
		const game = mockGamesData[index];
		game.versions.push(version);
		game.latestVersion = version.code;
		game.uploadDate = version.uploadDate;
		game.etag = `etag-game-${Date.now()}`;
		return game;
	},

	async deleteGameVersion(gameId: string, versionCode: string): Promise<Game> {
		await delay(500);
		const index = mockGamesData.findIndex((g) => g.id === gameId);
		if (index === -1) {
			throw new Error('Game not found');
		}
		const game = mockGamesData[index];
		game.versions = game.versions.filter((v) => v.code !== versionCode);
		if (game.versions.length > 0) {
			const latest = game.versions[game.versions.length - 1];
			game.latestVersion = latest.code;
			game.uploadDate = latest.uploadDate;
		}
		else {
			game.latestVersion = '';
			game.uploadDate = game.createdAt;
		}
		game.etag = `etag-game-${Date.now()}`;
		return game;
	},
};
