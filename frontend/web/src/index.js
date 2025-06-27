import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import store from './client/redux/store';
import './index.css';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import 'admin-lte/dist/js/adminlte.min.js';
import App from './App';
import reportWebVitals from './reportWebVitals';

const GOOGLE_CLIENT_ID = '928022919518-hl2f56heioov8klp1can2he9kik1abff.apps.googleusercontent.com'; // Thay thế bằng Client ID của bạn

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
