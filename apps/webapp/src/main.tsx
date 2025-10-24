import { MicroAppMetadata } from '@nikkierp/common/types';
import * as shell from '@nikkierp/shell';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';

import * as remoteApps from './modules.json';


const microApps: MicroAppMetadata[] = [
	{
		slug: 'identity',
		url: '@nikkierp/microapp-identity',
		// url: () => import('@nikkierp/microapp-identity'),
		domType: 'shared',
		htmlTag: 'microapp-identity',
	},
	...remoteApps,
];

interface IShell {
	ShellRoutes: React.FC;
}

const App: React.FC = () => {
	const { ShellRoutes } = shell as IShell;
	return (
		<React.StrictMode>
			<Router>
				<ShellRoutes />
			</Router>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
