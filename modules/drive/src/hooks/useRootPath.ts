import { useActiveOrgModule } from '@nikkierp/shell/routing';


export function useOrgModulePath(): string {
	const {moduleSlug} = useActiveOrgModule();
	return `/${moduleSlug}`;
}
