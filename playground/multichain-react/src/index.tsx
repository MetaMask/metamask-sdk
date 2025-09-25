import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { SDKProvider } from './sdk/SDKProvider';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<SDKProvider>
			<App />
		</SDKProvider>
	</React.StrictMode>,
);
