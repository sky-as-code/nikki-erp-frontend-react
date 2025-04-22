import axios, { type AxiosInstance } from 'axios';

import { getAuthToken } from './storageManager';

import config from '@/config';

let axiosInstance: AxiosInstance | null = null;

export function init(baseURL: string) {
	axiosInstance = axios.create({
		baseURL,
		headers: {'Content-Type': 'application/json'},
	});

	// Add request interceptor to attach token
	axiosInstance.interceptors.request.use((config) => {
		const token = getAuthToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});
}

export function instance(): AxiosInstance {
	if (!axiosInstance) {
		init(config.shell.SHELL_API_URL);
	}
	return axiosInstance!;
}

export default {
	init,
	instance,
};


