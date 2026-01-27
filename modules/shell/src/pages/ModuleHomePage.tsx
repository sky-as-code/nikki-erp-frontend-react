import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ModuleHomePage as ModuleHomePageContent } from '@/features/moduleHome/components/ModuleHomePage';


export const ModuleHomePage: React.FC = () => {
	const { t: translate } = useTranslation();

	useEffect(() => {
		document.title = translate('nikki.shell.moduleHome.title', { defaultValue: 'Nikki ERP' });
	}, [translate]);

	return <ModuleHomePageContent />;
};
