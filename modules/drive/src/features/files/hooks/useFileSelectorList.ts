import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fileService } from '../fileService';
import { DriveFileStatus } from '../types';

import type { DriveFile } from '../types';

export type FileSelectorMode = 'file' | 'folder';

export type UseFileSelectorListParams = {
	parentId: string;
	mode: FileSelectorMode;
	enabled?: boolean;
};

export function useFileSelectorList({
	parentId,
	mode,
	enabled = true,
}: UseFileSelectorListParams) {
	const { t } = useTranslation();
	const [currentParentId, setCurrentParentId] = useState<string>(parentId);
	const [items, setItems] = useState<DriveFile[]>([]);
	const [ancestors, setAncestors] = useState<DriveFile[]>([]);
	const [loading, setLoading] = useState<boolean>(enabled);
	const [error, setError] = useState<string | null>(null);

	const isFolderMode = mode === 'folder';

	const loadList = useCallback(async (parent: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fileService.getDriveFileByParent(parent, {
				page: 0,
				size: 200,
				graph: {
					if: ['status', '!=', DriveFileStatus.IN_TRASH],
				},
			});
			setItems(res.items ?? []);
		}
		catch (e) {
			const fallback = e instanceof Error ? e.message : t('nikki.drive.errors.failedToLoadFiles');
			setError(fallback);
			setItems([]);
		}
		finally {
			setLoading(false);
		}
	}, []);

	const loadAncestors = useCallback(async (parent: string) => {
		if (!parent) {
			setAncestors([]);
			return;
		}
		try {
			const chain = await fileService.getDriveFileAncestors(parent);
			setAncestors(chain ?? []);
		}
		catch {
			setAncestors([]);
		}
	}, []);

	useEffect(() => {
		if (!enabled) return;
		setCurrentParentId(parentId);
	}, [enabled, parentId]);

	useEffect(() => {
		if (!enabled) return;
		void loadList(currentParentId);
		void loadAncestors(currentParentId);
	}, [enabled, currentParentId, loadList, loadAncestors]);

	const visibleItems = useMemo(() => {
		if (isFolderMode) {
			return items.filter((f) => f.isFolder);
		}
		return items;
	}, [items, isFolderMode]);

	const handleOpenFolder = useCallback((folder: DriveFile) => {
		if (!folder.isFolder) return;
		setCurrentParentId(folder.id);
	}, []);

	const breadcrumbItems = useMemo(() => {
		const base = [{ id: '', name: t('nikki.drive.myFiles') }];
		return [...base, ...ancestors];
	}, [ancestors, t]);

	return {
		visibleItems,
		breadcrumbItems,
		loading,
		error,
		currentParentId,
		setCurrentParentId,
		handleOpenFolder,
		isFolderMode,
	};
}
