import * as shell from '@nikkierp/shell';
import { MicroAppDomType, MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/types';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';

import remoteApps from './modules.json';


const microApps: MicroAppMetadata[] = [
	{
		slug: 'identity',
		bundleUrl: '@nikkierp/microapp-identity',
		// bundleUrl: () => import('http://localhost:3000/index.ts'),
		// configUrl: 'http://localhost:3001/config',
		domType: MicroAppDomType.SHARED,
		htmlTag: 'microapp-identity',
	},
	{
		slug: 'essential',
		bundleUrl: () => import('@nikkierp/microapp-essential'),
		domType: MicroAppDomType.SHARED,
		htmlTag: 'nikkiapp-essential',
	},
	...remoteApps,
];

const App: React.FC = () => {
	const { AppShell } = shell as MicroAppShellBundle;
	return (
		<React.StrictMode>
			<Router>
				<AppShell microApps={microApps} />
			</Router>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
