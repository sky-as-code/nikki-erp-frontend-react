import React from 'react';

import type { DriveFileShare } from '@/features/fileShare/type';

import { orderSharesForAccessDetail } from '@/features/fileShare/driveFileShareAccessDetailUtils';
import { fileShareService } from '@/features/fileShare/fileShareService';


export type DriveFileSharesByUserStatus = 'idle' | 'pending' | 'success' | 'error';

export type UseDriveFileSharesByUserResult = {
	status: DriveFileSharesByUserStatus;
	error: string | null;
	/** Phản hồi thô từ API. */
	rawItems: DriveFileShare[];
	/** Sau `orderSharesForAccessDetail` (reverse + đưa bản ghi của file hiện tại lên đầu). */
	orderedShares: DriveFileShare[];
	/** Quyền áp dụng trên file hiện tại (hàng đầu sau khi sort). */
	appliedShare: DriveFileShare | null;
	/** Các bản ghi kế thừa / folder cha (phần còn lại sau hàng đầu). */
	inheritedChainShares: DriveFileShare[];
	refetch: () => Promise<void>;
};

/**
 * Gọi `getFileSharesByUser` và suy ra quyền hiệu lực + chuỗi kế thừa (cùng logic modal chi tiết).
 * Mỗi lần gọi hook với `fileId`/`userId` khác nhau có state độc lập (không dùng Redux slice `sharesByUser`).
 */
export function useDriveFileSharesByUser(params: {
	fileId: string;
	userId: string | null | undefined;
	enabled?: boolean;
}): UseDriveFileSharesByUserResult {
	const { fileId, userId, enabled = true } = params;
	const [status, setStatus] = React.useState<DriveFileSharesByUserStatus>('idle');
	const [error, setError] = React.useState<string | null>(null);
	const [rawItems, setRawItems] = React.useState<DriveFileShare[]>([]);

	const fetchData = React.useCallback(async () => {
		if (!userId) return;
		setStatus('pending');
		setError(null);
		try {
			const data = await fileShareService.getFileSharesByUser(fileId, userId);
			setRawItems(data);
			setStatus('success');
		}
		catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load shares');
			setStatus('error');
			setRawItems([]);
		}
	}, [fileId, userId]);

	React.useEffect(() => {
		if (!enabled || !userId) {
			setRawItems([]);
			setStatus('idle');
			setError(null);
			return;
		}
		void fetchData();
	}, [enabled, fetchData, userId]);

	const orderedShares = React.useMemo(
		() => orderSharesForAccessDetail(rawItems, fileId),
		[fileId, rawItems],
	);

	const appliedShare = orderedShares[0] ?? null;
	const inheritedChainShares = orderedShares.slice(1);

	return {
		status,
		error,
		rawItems,
		orderedShares,
		appliedShare,
		inheritedChainShares,
		refetch: fetchData,
	};
}
