import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// core styles are required for all packages
import '@mantine/core/styles.css';
// eslint-disable-next-line no-unused-vars
import { createTheme, MantineProvider } from '@mantine/core';

// const theme = createTheme({
//   /** Put your mantine theme override here */
// });

// eslint-disable-next-line no-undef
ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider>
    <App />
  </MantineProvider>
);