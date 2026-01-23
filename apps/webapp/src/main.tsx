import * as shell from '@nikkierp/nikkiportal-shell';
import { MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/microApp';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';

import remoteApps from './modules.json';
import './styles/index.css';

// Uncomment one of these when mounting as ShadowDOM
// const essentialBundleUrl = 'http://localhost:3000/@fs/F:/github/sky-as-code/nikki-erp-frontend-react/modules/essential/src/index.tsx';
// const essentialBundleUrl = 'http://localhost:3000/@fs/F:/github/sky-as-code/nikki-erp-frontend-react/modules/essential/dist/nikkiapp-essential-CLPVZYir.js';
const microApps: MicroAppMetadata[] = [
	{
		slug: 'nikkierp.identity',
		basePath: 'identity',
		bundleUrl: () => import('@nikkierp/microapp-identity'),
		// bundleUrl: () => import('http://localhost:3000/index.ts'),
		// configUrl: 'http://localhost:3001/config',
		htmlTag: 'microapp-identity',
	},
	{
		slug: 'nikkierp.essential',
		basePath: 'essential',
		// Uncomment when mounting as ShadowDOM
		// bundleUrl: () => import(essentialBundleUrl),
		bundleUrl: () => import('@nikkierp/microapp-essential'),
		htmlTag: 'nikkiapp-essential',
	},
	{
		slug: 'nikkierp.authorize',
		basePath: 'authorize',
		// Uncomment when mounting as ShadowDOM
		// bundleUrl: () => import(authorizeBundleUrl),
		bundleUrl: () => import('@nikkierp/microapp-authorize'),
		htmlTag: 'nikkiapp-authorize',
	},
	{
		slug: 'nikkierp.vendingMachine',
		basePath: 'vending-machine',
		// Uncomment when mounting as ShadowDOM
		// bundleUrl: () => import(vendingMachineBundleUrl),
		bundleUrl: () => import('@nikkierp/microapp-vendingMachine'),
		htmlTag: 'nikkiapp-vending-machine',
	},

	...remoteApps,
];

const App: React.FC = () => {
	const { MicroAppShell } = shell as MicroAppShellBundle;
	return (
		<>
			<Router>
				<MicroAppShell microApps={microApps} />
			</Router>
		</>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
