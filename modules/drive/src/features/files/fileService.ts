import { patch, del, put, get, ky, Options } from '@nikkierp/common/request';

import { DriveFileVisibility, GetDriveFileAncestorsResponse, RestoreDriveFileFromTrashResponse } from './types';
import {
	CreateDriveFileResponse,
	DeleteDriveFileResponse,
	GetDriveFileByParentRequest,
	GetDriveFileByParentResponse,
	GetDriveFileResponse,
	MoveDriveFileToTrashResponse,
	UpdateDriveFileMetadataRequest,
	UpdateDriveFileMetadataResponse,
} from './types';


const baseEndpoint = 'drive/files';
const baseEndpointWithId = (id: string): string => {
	return `${baseEndpoint}/${id}`;
};

export type CreateDriveFileFormPayload = {
	parentDriveFileRef: string;
	name: string;
	isFolder: boolean;
	visibility?: DriveFileVisibility;
	file?: File;
};

export const fileService = {
	async createFile(payload: CreateDriveFileFormPayload): Promise<CreateDriveFileResponse> {
		const client = ky();
		if (!client) throw new Error('API client not initialized');

		const formData = new FormData();
		formData.append('name', payload.name);
		formData.append('isFolder', String(payload.isFolder));
		formData.append('visibility', payload.visibility ?? DriveFileVisibility.OWNER);
		if (payload.parentDriveFileRef) {
			formData.append('parentDriveFileRef', payload.parentDriveFileRef);
		}
		if (payload.file) {
			formData.append('file', payload.file, payload.file.name);
		}

		return client.post(baseEndpoint, {
			body: formData,
			headers: { 'Content-Type': undefined },
		}).json<CreateDriveFileResponse>();
	},

	async updateFileMetadata(fileId: string,
		reqBody: UpdateDriveFileMetadataRequest): Promise<UpdateDriveFileMetadataResponse> {
		return patch<UpdateDriveFileMetadataResponse>(baseEndpointWithId(fileId), {
			json: reqBody,
		});
	},

	async deleteDriveFile(fileId: string): Promise<DeleteDriveFileResponse> {
		return del<DeleteDriveFileResponse>(baseEndpointWithId(fileId));
	},

	async moveDriveFileToTrash(fileId: string): Promise<MoveDriveFileToTrashResponse> {
		return put<MoveDriveFileToTrashResponse>(`${baseEndpointWithId(fileId)}/move-to-trash`);
	},

	async restoreDriveFileFromTrash(fileId: string,
		parentDriveFileRef: string | null): Promise<RestoreDriveFileFromTrashResponse> {
		// backend expect nil khi restore về root -> không gửi field hoặc gửi null
		const body = parentDriveFileRef ? { parentFileRef: parentDriveFileRef } : {};
		return put<RestoreDriveFileFromTrashResponse>(`${baseEndpointWithId(fileId)}/restore`, {
			json: {
				...body,
			},
		});
	},

	async getDriveFileById(fileId: string): Promise<GetDriveFileResponse> {
		return get<GetDriveFileResponse>(baseEndpointWithId(fileId));
	},

	async getDriveFileAncestors(fileId: string): Promise<GetDriveFileAncestorsResponse> {
		return get<GetDriveFileAncestorsResponse>(`${baseEndpointWithId(fileId)}/ancestors`);
	},

	async getDriveFileByParent(parentId: string,
		params?: GetDriveFileByParentRequest): Promise<GetDriveFileByParentResponse> {
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
		if (parentId == '') {
			return get<GetDriveFileByParentResponse>(`${baseEndpoint}/root`, options);
		}

		return get<GetDriveFileByParentResponse>(`${baseEndpointWithId(parentId)}/children`, options);
	},

	/** Fetch tất cả children (xử lý pagination). API dùng page bắt đầu từ 0. */
	async getDriveFileByParentAll(parentId: string): Promise<GetDriveFileByParentResponse> {
		const pageSize = 50;
		let page = 0;
		let allItems: Awaited<GetDriveFileByParentResponse>['items'] = [];
		let total = 0;

		do {
			const result = await this.getDriveFileByParent(parentId, { page, size: pageSize });
			const items = result.items ?? [];
			allItems = [...allItems, ...items];
			total = result.total ?? allItems.length;
			page++;
		}
		while (allItems.length < total);

		return { items: allItems, total: allItems.length };
	},

	async searchDriveFile(params?: GetDriveFileByParentRequest): Promise<GetDriveFileByParentResponse> {
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

		return get<GetDriveFileByParentResponse>(baseEndpoint, options);
	},

};