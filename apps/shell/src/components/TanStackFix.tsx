'use client';

import { useEffect, useState, FC, PropsWithChildren } from 'react';

/**
 * Workaround for TanStack issue: https://github.com/TanStack/table/issues/5026#issuecomment-2315023555
 */
export const TanStackFix: FC<PropsWithChildren> = ({ children }) => {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) return null;

	return children;
};