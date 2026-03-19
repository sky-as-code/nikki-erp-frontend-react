import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';


export function useOrgModulePath(): string {
	const {orgSlug, moduleSlug} = useActiveOrgModule();
	return `/${orgSlug}/${moduleSlug}`;
}
