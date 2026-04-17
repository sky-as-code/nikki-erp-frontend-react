import { ResourceScopeType, type Playlist } from './types';

const mockMediaPlaylistsData: Playlist[] = [
	{
		id: '1',
		name: 'Trình chiếu Coca Cola',
		etag: 'etag-ss-001',
		scopeType: ResourceScopeType.DOMAIN,
		scopeRef: null,
		isArchived: false,
		createdAt: '2024-01-01T08:00:00Z',
	},
	{
		id: '2',
		name: 'Trình chiếu Samsung',
		etag: 'etag-ss-002',
		scopeType: ResourceScopeType.DOMAIN,
		scopeRef: null,
		isArchived: false,
		createdAt: '2024-02-01T09:30:00Z',
	},
	{
		id: '3',
		name: 'Trình chiếu Nike',
		etag: 'etag-ss-003',
		scopeType: ResourceScopeType.ORG,
		scopeRef: 'org-1',
		isArchived: true,
		createdAt: '2024-03-01T10:15:00Z',
	},
	{
		id: '4',
		name: 'Trình chiếu McDonald\'s',
		etag: 'etag-ss-004',
		scopeType: ResourceScopeType.DOMAIN,
		scopeRef: null,
		isArchived: false,
		createdAt: '2024-04-01T14:20:00Z',
	},
	{
		id: '5',
		name: 'Trình chiếu Apple',
		etag: 'etag-ss-005',
		scopeType: ResourceScopeType.PRIVATE,
		scopeRef: null,
		isArchived: true,
		createdAt: '2023-12-01T11:45:00Z',
	},
	{
		id: '6',
		name: 'Trình chiếu VinFast',
		etag: 'etag-ss-006',
		scopeType: ResourceScopeType.HIERARCHY,
		scopeRef: 'hier-1',
		isArchived: false,
		createdAt: '2024-05-01T13:30:00Z',
	},
	{
		id: '7',
		name: 'Trình chiếu Shopee',
		etag: 'etag-ss-007',
		scopeType: ResourceScopeType.DOMAIN,
		scopeRef: null,
		isArchived: true,
		createdAt: '2024-06-01T15:00:00Z',
	},
	{
		id: '8',
		name: 'Trình chiếu The Coffee House',
		etag: 'etag-ss-008',
		scopeType: ResourceScopeType.DOMAIN,
		scopeRef: null,
		isArchived: false,
		createdAt: '2024-07-01T16:20:00Z',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockMediaPlaylists = {
	async listMediaPlaylists(): Promise<Playlist[]> {
		await delay(500);
		return [...mockMediaPlaylistsData];
	},
	async getMediaPlaylist(id: string): Promise<Playlist | undefined> {
		await delay(300);
		return mockMediaPlaylistsData.find((s) => s.id === id);
	},
	async createMediaPlaylist(playlist: {
		name: string;
		scopeType: ResourceScopeType;
		scopeRef?: string | null;
	}): Promise<Playlist> {
		await delay(500);
		const newPlaylist: Playlist = {
			...playlist,
			id: String(mockMediaPlaylistsData.length + 1),
			etag: `etag-ss-${Date.now()}`,
			createdAt: new Date().toISOString(),
			isArchived: false,
		};
		mockMediaPlaylistsData.push(newPlaylist);
		return newPlaylist;
	},
	async updateMediaPlaylist(
		id: string,
		_etag: string,
		updates: Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef' | 'isArchived'>>,
	): Promise<Playlist> {
		await delay(500);
		const index = mockMediaPlaylistsData.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('Media playlist not found');
		const updated: Playlist = { ...mockMediaPlaylistsData[index], ...updates, etag: `etag-ss-${Date.now()}` };
		mockMediaPlaylistsData[index] = updated;
		return updated;
	},
	async deleteMediaPlaylist(id: string): Promise<void> {
		await delay(500);
		const index = mockMediaPlaylistsData.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('Media playlist not found');
		mockMediaPlaylistsData.splice(index, 1);
	},
};
