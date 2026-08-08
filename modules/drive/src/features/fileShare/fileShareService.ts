import { del, get, post, unwrapResult, Options, put } from '@nikkierp/common/request';

import {
	ResolvedDriveFileShareRequest,
	ResolvedDriveFileShareResponse,
	CreateDriveFileShareBulkRequest,
	CreateDriveFileShareBulkResponse,
	CreateDriveFileShareRequest,
	CreateDriveFileShareResponse,
	DeleteDriveFileShareResponse,
	GetDriveFileShareAncestorsResponse,
	GetDriveFileShareResponse,
	GetDriveFileSharesByUserResponse,
	SearchDriveFileShareRequest,
	SearchDriveFileShareResponse,
	UpdateDriveFileShareRequest,
	UpdateDriveFileShareResponse,
} from './type';


const buildBaseEndpoint = (fileId: string): string => {
	return `drive/files/${fileId}/shares`;
};

export const fileShareService = {
	async createFileShare(fileId: string, req: CreateDriveFileShareRequest): Promise<CreateDriveFileShareResponse> {
		return unwrapResult(await post<CreateDriveFileShareResponse>(buildBaseEndpoint(fileId), {
			json: req,
		}));
	},

	async createFileShareBulk(fileId: string,
		req: CreateDriveFileShareBulkRequest): Promise<CreateDriveFileShareBulkResponse> {
		return unwrapResult(await post<CreateDriveFileShareBulkResponse>(`${buildBaseEndpoint(fileId)}/bulk`, {
			json: req,
		}));
	},

	async updateFileShare(fileId: string, shareId: string,
		req: UpdateDriveFileShareRequest): Promise<UpdateDriveFileShareResponse> {
		return unwrapResult(await put<UpdateDriveFileShareResponse>(`${buildBaseEndpoint(fileId)}/${shareId}`, {
			json: req,
		}));
	},

	async deleteFileShare(fileId: string, shareId: string): Promise<DeleteDriveFileShareResponse> {
		return unwrapResult(await del<DeleteDriveFileShareResponse>(`${buildBaseEndpoint(fileId)}/${shareId}`));
	},

	async getFileShare(fileId: string, shareId: string): Promise<GetDriveFileShareResponse> {
		return unwrapResult(await get<GetDriveFileShareResponse>(`${buildBaseEndpoint(fileId)}/${shareId}`));
	},

	async searchFileShares(fileId: string,
		params?: SearchDriveFileShareRequest): Promise<SearchDriveFileShareResponse> {
		const options: Options = {};
		if (params) {
			const searchParams: any = {
				...params,
			};

			if (params.graph) {
				searchParams.graph = JSON.stringify({
					...(params.graph as Record<string, unknown>),
				});
			}

			options.searchParams = searchParams;
		}
		return unwrapResult(await get<SearchDriveFileShareResponse>(buildBaseEndpoint(fileId), options));
	},

	async getFileShareAncestors(fileId: string): Promise<GetDriveFileShareAncestorsResponse> {
		return unwrapResult(await get<GetDriveFileShareAncestorsResponse>(`${buildBaseEndpoint(fileId)}/ancestors`));
	},

	async getResolvedFileShares(
		fileId: string,
		params?: ResolvedDriveFileShareRequest,
	): Promise<ResolvedDriveFileShareResponse> {
		const options: Options = {};
		if (params) {
			const searchParams: any = {
				...params,
			};

			if (params.graph) {
				searchParams.graph = JSON.stringify({
					...(params.graph as Record<string, unknown>),
				});
			}

			options.searchParams = searchParams;
		}
		return unwrapResult(await get<ResolvedDriveFileShareResponse>(`${buildBaseEndpoint(fileId)}/resolved`, options));
	},

	async getFileSharesByUser(fileId: string, userId: string): Promise<GetDriveFileSharesByUserResponse> {
		return unwrapResult(await get<GetDriveFileSharesByUserResponse>(`${buildBaseEndpoint(fileId)}/users/${userId}`));
	},
};