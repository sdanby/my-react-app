import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('https://hello-world-9yb9.onrender.com')  // Use actual Flask URL here
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching data:', error));  // Log errors
}, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export default App;
