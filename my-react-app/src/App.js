import React from 'react';
import { Button, TextInput } from '@mantine/core';

function MyComponent() {
  return (
    <div>
      <TextInput label="Username" placeholder="Enter your username" />
      <TextInput type="password" label="Password" placeholder="Enter your password" />
      <Button variant="primary">Submit</Button>
    </div>
  );
}

export default MyComponent;
