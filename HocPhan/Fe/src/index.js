import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/style.scss';
import {App} from './App';
import reportWebVitals from './reportWebVitals';


import { store } from './redux/store'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
console.log("API URL:", process.env.REACT_APP_API_URL);
const root = ReactDOM.createRoot(document.getElementById('root'));

const queryClient= new QueryClient();
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient} >
      <Provider store={store} >
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
