import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import AuthProvider from './context/AuthContext';
import { QueryProvider } from './lib/react-query/QueryProvider';

const rootElement = document.getElementById('root');
if (rootElement) {
	createRoot(rootElement).render(
		<BrowserRouter>
			<QueryProvider>
				<AuthProvider>
					<App />
				</AuthProvider>
			</QueryProvider>
		</BrowserRouter>
	);
}
