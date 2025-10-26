import { Alert, MantineProvider } from '@mantine/core';
import { AppStateProvider } from '@nikkierp/ui/stateManagement';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/types';

import { reducer } from './state';


const Main: React.FC<MicroAppProps> = ({ stateMgmt }) => {
	const result = stateMgmt.registerReducer(reducer);
	return (
		<AppStateProvider registerResult={result}>
			<MantineProvider>
				<Alert variant='filled' color='blue'>Essential</Alert>
			</MantineProvider>
		</AppStateProvider>
	);
};

const bundle: MicroAppBundle = ({ htmlTag }) => {
	const domType = MicroAppDomType.SHARED;
	defineWebComponent(Main, {
		htmlTag,
		domType,
	});
	return {
		domType,
	};
};

// Must declare "sideEffects" in package.json to prevent tree-shaking
export default bundle;