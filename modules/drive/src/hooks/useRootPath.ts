import { useActiveOrgModule } from '@nikkierp/shell/routing';


export function useOrgModulePath(): string {
	const {orgSlug, moduleSlug} = useActiveOrgModule();
	return `/${orgSlug}/${moduleSlug}`;
}
