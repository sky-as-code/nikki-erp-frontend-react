import { useDocumentTitle } from '@nikkierp/ui/hooks';

import { ModuleHomePage as ModuleHomePageContent } from '@/features/moduleHome/components/ModuleHomePage';


export const ModuleHomePage: React.FC = () => {

	useDocumentTitle('nikki.shell.moduleHome.title', 'Nikki ERP');

	return <ModuleHomePageContent />;
};
