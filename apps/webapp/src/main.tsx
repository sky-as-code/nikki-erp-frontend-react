import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';

import { ShellProviders } from './context/ShellProviders';
import { ShellRoutes } from './routes';
import './styles/index.css';


function App() {
	return (
		<React.StrictMode>
			<Router>
				<ShellRoutes />
			</Router>
		</React.StrictMode>
	);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
