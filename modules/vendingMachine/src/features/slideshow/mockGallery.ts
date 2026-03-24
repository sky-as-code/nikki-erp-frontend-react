import { GalleryFolder, GalleryMedia } from './types';

export const mockGalleryFolders: GalleryFolder[] = [
	{
		id: 'folder-1',
		name: 'Trình chiếu Thực phẩm',
		mediaCount: 5,
		children: [
			{
				id: 'folder-1-1',
				name: 'Đồ uống',
				parentId: 'folder-1',
				mediaCount: 3,
			},
			{
				id: 'folder-1-2',
				name: 'Đồ ăn nhanh',
				parentId: 'folder-1',
				mediaCount: 2,
			},
		],
	},
	{
		id: 'folder-2',
		name: 'Trình chiếu Công nghệ',
		mediaCount: 8,
		children: [
			{
				id: 'folder-2-1',
				name: 'Điện thoại',
				parentId: 'folder-2',
				mediaCount: 4,
			},
			{
				id: 'folder-2-2',
				name: 'Laptop',
				parentId: 'folder-2',
				mediaCount: 4,
			},
		],
	},
	{
		id: 'folder-3',
		name: 'Trình chiếu Thời trang',
		mediaCount: 6,
	},
	{
		id: 'folder-4',
		name: 'Trình chiếu Xe cộ',
		mediaCount: 4,
	},
];

export const mockGalleryMedia: GalleryMedia[] = [
	{
		id: 'media-1',
		code: 'MED-001',
		name: 'Coca Cola Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 30,
		folderId: 'folder-1-1',
		size: 5242880,
		createdAt: '2024-01-01T08:00:00Z',
	},
	{
		id: 'media-2',
		code: 'MED-002',
		name: 'Pepsi Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-1-1',
		size: 1048576,
		createdAt: '2024-01-02T09:00:00Z',
	},
	{
		id: 'media-3',
		code: 'MED-003',
		name: 'Sting Energy Video',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 15,
		folderId: 'folder-1-1',
		size: 3145728,
		createdAt: '2024-01-03T10:00:00Z',
	},
	{
		id: 'media-4',
		code: 'MED-004',
		name: 'McDonald\'s Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 45,
		folderId: 'folder-1-2',
		size: 7340032,
		createdAt: '2024-01-04T11:00:00Z',
	},
	{
		id: 'media-5',
		code: 'MED-005',
		name: 'KFC Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-1-2',
		size: 2097152,
		createdAt: '2024-01-05T12:00:00Z',
	},
	{
		id: 'media-6',
		code: 'MED-006',
		name: 'Samsung Galaxy Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 60,
		folderId: 'folder-2-1',
		size: 10485760,
		createdAt: '2024-01-06T13:00:00Z',
	},
	{
		id: 'media-7',
		code: 'MED-007',
		name: 'iPhone Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-2-1',
		size: 3145728,
		createdAt: '2024-01-07T14:00:00Z',
	},
	{
		id: 'media-8',
		code: 'MED-008',
		name: 'Xiaomi Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 30,
		folderId: 'folder-2-1',
		size: 5242880,
		createdAt: '2024-01-08T15:00:00Z',
	},
	{
		id: 'media-9',
		code: 'MED-009',
		name: 'OPPO Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-2-1',
		size: 2097152,
		createdAt: '2024-01-09T16:00:00Z',
	},
	{
		id: 'media-10',
		code: 'MED-010',
		name: 'MacBook Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 45,
		folderId: 'folder-2-2',
		size: 8388608,
		createdAt: '2024-01-10T17:00:00Z',
	},
	{
		id: 'media-11',
		code: 'MED-011',
		name: 'Dell Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-2-2',
		size: 3145728,
		createdAt: '2024-01-11T18:00:00Z',
	},
	{
		id: 'media-12',
		code: 'MED-012',
		name: 'HP Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 30,
		folderId: 'folder-2-2',
		size: 5242880,
		createdAt: '2024-01-12T19:00:00Z',
	},
	{
		id: 'media-13',
		code: 'MED-013',
		name: 'Lenovo Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-2-2',
		size: 2097152,
		createdAt: '2024-01-13T20:00:00Z',
	},
	{
		id: 'media-14',
		code: 'MED-014',
		name: 'Nike Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 60,
		folderId: 'folder-3',
		size: 10485760,
		createdAt: '2024-01-14T21:00:00Z',
	},
	{
		id: 'media-15',
		code: 'MED-015',
		name: 'Adidas Banner',
		type: 'image',
		url: 'https://via.placeholder.com/1920x1080',
		folderId: 'folder-3',
		size: 3145728,
		createdAt: '2024-01-15T22:00:00Z',
	},
	{
		id: 'media-16',
		code: 'MED-016',
		name: 'VinFast Slideshow',
		type: 'video',
		url: 'https://via.placeholder.com/1920x1080',
		thumbnailUrl: 'https://via.placeholder.com/300x200',
		duration: 90,
		folderId: 'folder-4',
		size: 15728640,
		createdAt: '2024-01-16T23:00:00Z',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGallery = {
	async getFolders(): Promise<GalleryFolder[]> {
		await delay(300);
		return [...mockGalleryFolders];
	},

	async getMediaByFolder(folderId?: string): Promise<GalleryMedia[]> {
		await delay(300);
		if (!folderId) {
			return [...mockGalleryMedia];
		}
		return mockGalleryMedia.filter((media) => media.folderId === folderId);
	},

	async getAllMedia(): Promise<GalleryMedia[]> {
		await delay(300);
		return [...mockGalleryMedia];
	},
};
