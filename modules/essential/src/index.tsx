import { AppStateProvider } from '@nikkierp/ui/stateManagement';
import { defineWebComponent, MicroAppBundle, MicroAppProps } from '@nikkierp/ui/types';

import { reducer } from './state';


const Main: React.FC<MicroAppProps> = ({ stateMgmt }) => {
	const result = stateMgmt.registerReducer(reducer);
	return (
		<AppStateProvider registerResult={result}>
			<>Essential</>
		</AppStateProvider>
	);
};

const bundle: MicroAppBundle = () => {
	defineWebComponent(Main, {
		htmlTag: 'nikkiapp-essential',
	});
};

export default bundle;