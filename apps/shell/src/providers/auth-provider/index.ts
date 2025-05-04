'use client';

import { type AuthProvider } from '@refinedev/core';

import authProvider from './localstorageAuth';

export function createAuthProvider(): AuthProvider {
	return authProvider;
}
