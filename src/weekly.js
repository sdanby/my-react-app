import React from 'react';

function Weekly() {
  const startScraping = async () => {
    try {
      const response = await fetch('http://localhost:5000/start-scraping', { // Ensure this matches your Flask endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loopEvents: true }) // Send loopEvents as true
      });

      const data = await response.json();
      alert(data.message || data.error); // Display success or error message
    } catch (error) {
      alert('An error occurred: ' + error.message); // Catch any fetch errors
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Parkrun Event Scraper</h1>
      <button onClick={startScraping} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Start Scraping
      </button>
    </div>
  );
}

export default Weekly;
