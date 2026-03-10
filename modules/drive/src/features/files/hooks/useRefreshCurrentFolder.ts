import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useCallback } from 'react';

import { driveFileActions } from '@/appState/file';


type RefreshOptions = {
	parentId: string;
	page?: number;
	size?: number;
	includeTree?: boolean;
	treePageSize?: number;
};

/**
 * Hook tiện ích để refetch lại danh sách file của folder hiện tại (DriveFileByParent)
 * và/hoặc dữ liệu cho FileTree (DriveFileByParentForTree) sau khi có thay đổi metadata.
 */
export function useRefreshCurrentFolder() {
	const dispatch = useMicroAppDispatch();

	const refresh = useCallback(
		({ parentId, page = 0, size = 20, includeTree = false, treePageSize = 50 }: RefreshOptions) => {
			const normalizedParentId = parentId ?? '';

			// Refetch danh sách file cho main content
			(dispatch as (action: unknown) => void)(
				driveFileActions.getDriveFileByParent({
					parentId: normalizedParentId,
					req: { page, size },
				}),
			);

			// Tuỳ chọn: refetch thêm cho FileTree nếu cần
			if (includeTree) {
				(dispatch as (action: unknown) => void)(
					driveFileActions.getDriveFileByParentForTree({
						parentId: normalizedParentId,
						req: { page: 0, size: treePageSize },
					}),
				);
			}
		},
		[dispatch],
	);

	return { refresh };
}

