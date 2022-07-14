import React from 'react';
import './App.css';
import Coordinates from './Coordinates'
import { ChakraProvider } from '@chakra-ui/react'

function App() {
  return (
  <ChakraProvider>
    <div className="App">
      < Coordinates />
    </div>
  </ChakraProvider>
  );
}

export default App;
