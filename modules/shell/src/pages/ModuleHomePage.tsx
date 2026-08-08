import { useSystemSettings } from '@nikkierp/shell/userContext';
import { withErrorBoundary } from '@nikkierp/ui/components';
import { useWindowTitle } from '@nikkierp/ui/hookhoc';
import React from 'react';

import { ModuleHomePage as ModuleHomePageContent } from '../features/moduleHome/components/ModuleHomePage';


export const ModuleHomePage = withErrorBoundary((): React.ReactNode => {
	const systemSettings = useSystemSettings();
	useWindowTitle(systemSettings?.appName ?? 'Module Home');
	return <ModuleHomePageContent />;
});