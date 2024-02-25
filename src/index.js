import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// core styles are required for all packages
import '@mantine/core/styles.css';
// eslint-disable-next-line no-unused-vars
import { createTheme, MantineProvider } from '@mantine/core';
import { Button } from '@mantine/core';

const theme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: {
        color: 'pink',
      },
    }),
  },
});

// eslint-disable-next-line no-undef
ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <App />
  </MantineProvider>
);