import { MenuBarItem } from '@nikkierp/ui/appState';

// Normalize a path (ensure it starts with /)
export function normalizePath(path: string): string {
	if (!path) return '/';
	if (path.startsWith('/')) return path;
	return `/${path}`;
}

// Check if a path is active
export function isPathActive(link: string, currentPath: string): boolean {
	if (!link) return false;

	const normalizedLink = normalizePath(link);
	const normalizedCurrentPath = normalizePath(currentPath);

	if (normalizedLink === normalizedCurrentPath) return true;

	if (normalizedCurrentPath.startsWith(normalizedLink) && normalizedLink !== '/') {
		const nextChar = normalizedCurrentPath[normalizedLink.length];
		return nextChar === undefined || nextChar === '/' || nextChar === '?';
	}
	return false;
}

// Check if any nested item is active
export function hasActiveNestedItem(item: MenuBarItem, currentPath: string): boolean {
	if (item.link && isPathActive(item.link, currentPath)) {
		return true;
	}
	if (item.items) {
		return item.items.some(subItem => hasActiveNestedItem(subItem, currentPath));
	}
	return false;
}

// Get full path with prefix
export function getPathWithPrefix(link: string, pathPrefix: string): string {
	if (link.startsWith('/')) {
		return `${pathPrefix}${link}`;
	}
	return link;
}

// Check if a path is active, considering the path prefix
export function isPathActiveWithPrefix(
	link: string,
	currentPath: string,
	pathPrefix: string,
): boolean {
	if (!link) return false;
	const fullPath = getPathWithPrefix(link, pathPrefix);
	return isPathActive(fullPath, currentPath);
}

// Check if any nested item is active, considering the path prefix
export function hasActiveNestedItemWithPrefix(
	item: MenuBarItem,
	currentPath: string,
	pathPrefix: string,
): boolean {
	if (item.link && isPathActiveWithPrefix(item.link, currentPath, pathPrefix)) {
		return true;
	}
	if (item.items) {
		return item.items.some(subItem =>
			hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
		);
	}
	return false;
}