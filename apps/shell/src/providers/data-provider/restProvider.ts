'use client';

import createRestProvider from '@refinedev/simple-rest';

export const createDataProvider = (apiBaseUrl: string) => {
	return createRestProvider(apiBaseUrl);
};
