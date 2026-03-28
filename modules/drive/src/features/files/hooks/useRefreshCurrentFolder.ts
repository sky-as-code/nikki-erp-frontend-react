/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback } from 'react';

import { DriveFileStatus } from '../types';

import { driveFileActions, selectDriveFileState } from '@/appState/file';


type RefreshOptions = {
	parentId?: string;
	includeTree?: boolean;
	treePageSize?: number;
};

/**
 * Hook tiện ích để refetch lại danh sách file của folder hiện tại (DriveFileByParent)
 * và/hoặc dữ liệu cho FileTree (DriveFileByParentForTree) sau khi có thay đổi metadata.
 */
export function useRefreshCurrentFolder() {
	const dispatch = useMicroAppDispatch();
	const state = useMicroAppSelector(selectDriveFileState);

	const refresh = useCallback(
		({ parentId, includeTree = false, treePageSize = 50 }: RefreshOptions) => {
			const ctx = state.currentListContext;

			const normalizedParentId = parentId ?? ctx?.parentId ?? '';
			const page = ctx?.page ?? 0;
			const size = ctx?.size ?? 20;
			const graph =
				(ctx?.graph as Record<string, unknown> | undefined)
				?? {
					if: ['status', '!=', DriveFileStatus.IN_TRASH],
				};

			// Refetch danh sách file cho main content (tuỳ context: byParent vs search/trash)
			if (ctx?.source === 'search') {
				(dispatch as (action: unknown) => void)(
					driveFileActions.searchDriveFile({
						req: {
							page,
							size,
							graph,
						},
					}),
				);
			}
			else {
				(dispatch as (action: unknown) => void)(
					driveFileActions.getDriveFileByParent({
						parentId: normalizedParentId,
						req: {
							page,
							size,
							graph,
						},
					}),
				);
			}

			// Tuỳ chọn: refetch thêm cho FileTree nếu cần
			if (includeTree) {
				// Refetch node tương ứng với parent hiện tại
				(dispatch as (action: unknown) => void)(
					driveFileActions.getDriveFileByParentForTree({
						parentId: normalizedParentId,
						req: { page: 0, size: treePageSize },
					}),
				);

				// Đồng thời refetch root ('') để đảm bảo My files tree luôn sync,
				// kể cả khi đang ở view folder con.
				if (normalizedParentId !== '') {
					(dispatch as (action: unknown) => void)(
						driveFileActions.getDriveFileByParentForTree({
							parentId: '',
							req: { page: 0, size: treePageSize },
						}),
					);
				}
			}
		},
		[dispatch, state.currentListContext],
	);

	return { refresh };
}
