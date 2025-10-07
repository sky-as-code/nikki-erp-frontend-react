import { setAuthData, getAuthData, clearAuthData, type AuthData } from '@modules/core/auth/storageManager'
import { type AuthProvider } from '@refinedev/core'

import axios from '@/common/axios'

const authProvider: AuthProvider = {
	login: async ({ email, password } : { email: string; password: string }) => {
		try {
			const response = await axios.instance().post<AuthData>('/auth/login', {
				email,
				password,
			})

			setAuthData(response.data)

			return {
				success: true,
				redirectTo: '/',
			}
		}
		catch (error: any) {
			const errorMessage = error.response?.data?.message || 'Login failed'
			return {
				success: false,
				error: new Error(errorMessage),
			}
		}
	},

	logout: async () => {
		try {
			const authData = getAuthData()
			if (authData) {
				await axios.instance().post('/auth/logout')
			}

			clearAuthData()

			return {
				success: true,
				redirectTo: '/login',
			}
		}
		catch (error) {
			clearAuthData()
			return {
				success: true,
				redirectTo: '/login',
			}
		}
	},

	check: async () => {
		try {
			const authData = getAuthData()
			if (!authData) {
				return {
					authenticated: false,
					error: new Error('Not authenticated'),
					logout: true,
					redirectTo: '/login',
				}
			}

			// Verify token with backend
			try {
				await axios.instance().get('/auth/verify', {headers: {Authorization: `Bearer ${authData.token}`}})

				return {authenticated: true}
			}
			catch (error) {
				// Token is invalid or expired
				clearAuthData()
				return {
					authenticated: false,
					error: new Error('Token expired'),
					logout: true,
					redirectTo: '/login',
				}
			}
		}
		catch (error) {
			return {
				authenticated: false,
				error: new Error('Authentication check failed'),
				logout: true,
				redirectTo: '/login',
			}
		}
	},

	getIdentity: async () => {
		const authData = getAuthData()
		if (!authData) {
			return null
		}

		const { user } = authData
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
		}
	},

	onError: async (error) => {
		const status = error.response?.status

		if (status === 401 || status === 403) {
			clearAuthData()
			return {
				logout: true,
				redirectTo: '/login',
				error: new Error('Session expired'),
			}
		}

		return { error }
	},

	getPermissions: async () => {
		const authData = getAuthData()
		if (!authData) {
			return null
		}

		// Optional: You can store and return user permissions here
		return null
	},
}

export default authProvider
