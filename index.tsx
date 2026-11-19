/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseErrorBoundary, FirebaseProvider } from './components/FirebaseProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <FirebaseErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </FirebaseErrorBoundary>
  </React.StrictMode>
);