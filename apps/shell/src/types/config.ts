export type AppConfig = {
	// Config for shell
	shell: {
		SHELL_API_URL: string,
	},
	// Config for core module
	core?: {
		CORE_API_URL: string,
	},
};
