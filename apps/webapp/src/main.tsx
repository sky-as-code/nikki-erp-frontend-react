import * as shell from '@nikkierp/shell';
import { MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/microApp';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';

import remoteApps from './modules.json';


// Uncomment one of these when mounting as ShadowDOM
// const essentialBundleUrl = 'http://localhost:3000/@fs/F:/github/sky-as-code/nikki-erp-frontend-react/modules/essential/src/index.tsx';
// const essentialBundleUrl = 'http://localhost:3000/@fs/F:/github/sky-as-code/nikki-erp-frontend-react/modules/essential/dist/nikkiapp-essential-CLPVZYir.js';
const microApps: MicroAppMetadata[] = [
	{
		slug: 'identity',
		bundleUrl: '@nikkierp/microapp-identity',
		// bundleUrl: () => import('http://localhost:3000/index.ts'),
		// configUrl: 'http://localhost:3001/config',
		htmlTag: 'microapp-identity',
	},
	{
		slug: 'essential',
		// Uncomment when mounting as ShadowDOM
		// bundleUrl: () => import(essentialBundleUrl),
		bundleUrl: () => import('@nikkierp/microapp-essential'),
		htmlTag: 'nikkiapp-essential',
	},
	...remoteApps,
];

const App: React.FC = () => {
	const { AppShell } = shell as MicroAppShellBundle;
	return (
		// <React.StrictMode>
		<Router>
			<AppShell microApps={microApps} />
		</Router>
		// </React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
