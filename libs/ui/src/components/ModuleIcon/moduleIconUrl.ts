/// <reference types="vite/client" />

const ICON_URLS = buildIconUrlMap(
	import.meta.glob<string>('../../assets/moduleIcons/*.svg', { eager: true, import: 'default', query: '?url' }),
);

export const GENERIC_MODULE_ICON_URL = ICON_URLS.get('generic')!;


export function getModuleIconUrl(moduleName: string | undefined | null): string {
	return (moduleName && ICON_URLS.get(moduleName)) || GENERIC_MODULE_ICON_URL;
}

function buildIconUrlMap(globResult: Record<string, string>): Map<string, string> {
	const urls = new Map<string, string>();
	for (const [path, url] of Object.entries(globResult)) {
		const baseName = path.substring(path.lastIndexOf('/') + 1).replace(/\.svg$/, '');
		urls.set(baseName, url);
	}
	return urls;
}
