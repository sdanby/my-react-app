import React, { useEffect, useState } from 'react';

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchEventPositions = async () => {
          const response = await fetch('http://localhost:5000/api/eventpositions'); // Update with your actual URL
          const result = await response.json();
          setData(result);
      };

      fetchEventPositions();
  }, []);

  return (
      <div>
          <h1>Event Positions</h1>
          <ul>
              {data.map(event => (
                  <li key={event.position}>
                      {event.name} - {event.time}
                  </li>
              ))}
          </ul>
      </div>
  );
};

export default App;
