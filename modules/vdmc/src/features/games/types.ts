export type GameStatus = 'active' | 'inactive';

export interface GameVersion {
	code: string;
	description: string;
	source: string; // HTML/JS source code
	uploadDate: string; // ISO date string
}

export interface Game {
	id: string;
	code: string;
	name: string;
	description: string;
	status: GameStatus;
	versions: GameVersion[];
	latestVersion: string; // version code
	uploadDate: string; // ISO date string
	minAppVersion?: string; // Minimum required vending machine app version
	createdAt: string;
	etag: string;
}
