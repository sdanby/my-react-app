import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure to import your CSS file for styling

const App = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eventCode, setEventCode] = useState(''); // This will hold the event code
    const [eventDate, setEventDate] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [events, setEvents] = useState([]); // State to hold events

    // Function to format the date from YYYY-MM-DD to DD/MM/YYYY
    const formatDate = (date) => {
        const parts = date.split('-'); // Split date into [YYYY, MM, DD]
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // Return as DD/MM/YYYY
    };

    // Fetch events from Flask API when the component mounts
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Use your actual Render endpoint
                const response = await fetch('https://hello-world-9yb9.onrender.com/api/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data); // Store the events in the state
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        fetchEvents();
    }, []);

    // Function to fetch athletes based on the selected event code and date
    const fetchAthletes = async () => {
        if (eventCode && eventDate) {
            try {
                setLoading(true);
                const newFormattedDate = formatDate(eventDate);
                setFormattedDate(newFormattedDate);
                
                // Use your Render endpoint for fetching athletes
                const response = await fetch(`https://hello-world-9yb9.onrender.com/api/eventpositions?event_code=${eventCode}&event_date=${newFormattedDate}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAthletes(data); // Set the athletes data
                setError(null);  // Clear any previous error
            } catch (err) {
                setError(err.message);  // Set error message
            } finally {
                setLoading(false); // Stop loading
            }
        } else {
            alert('Please enter both Event and Event Date.');
        }
    };

    return (
        <div className="app-container">
            <h1>Event Positions</h1>

            <div className="input-container">
                {/* Dropdown to select events */}
                <select 
                    id="event-select" 
                    value={eventCode} 
                    onChange={(e) => setEventCode(e.target.value)} 
                    required
                >
                    <option value="">Select Event</option>
                    {events.map(event => (
                        <option key={event.event_code} value={event.event_code}>
                            {event.event_name}
                        </option>
                    ))}
                </select>

                {/* Date input field */}
                <input 
                    id="date-select"
                    type="date" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    required
                />
                
                <button onClick={fetchAthletes}>Fetch Athletes</button>
            </div>

            {formattedDate && <h2 className="selected-date">Selected Date: {formattedDate}</h2>} 

            {loading && <div>Loading...</div>}
            {error && <div className="error">Error: {error}</div>}

            <ul className="athletes-list">
                {athletes.map((athlete) => (
                    <li key={`${athlete.position}-${athlete.event_code}`}>
                        Position: {athlete.position}, Name: {athlete.name}, Time: {athlete.time}, Club: {athlete.club}, Comment: {athlete.comment}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
