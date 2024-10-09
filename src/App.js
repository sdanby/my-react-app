import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure to import your CSS file for styling

const App = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eventCode, setEventCode] = useState(''); // Holds the event code
    const [eventDate, setEventDate] = useState(''); // Holds the event date
    const [formattedDate, setFormattedDate] = useState('');
    const [events, setEvents] = useState([]); // State to hold events

    // Function to fetch events from Flask API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('https://hello-world-9yb9.onrender.com/api/events'); // Your Flask API URL
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data); // Store the events in the state
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err.message);
            }
        };

        fetchEvents();
    }, []);

    // Function to fetch athletes based on selected event code and date
    const fetchAthletes = async () => {
        if (eventCode && eventDate) {
            try {
                setLoading(true);
                const newFormattedDate = formatDate(eventDate); // Assuming formatDate formats properly
                setFormattedDate(newFormattedDate);

                const response = await fetch(`https://hello-world-9yb9.onrender.com/api/eventpositions?event_code=${eventCode}&event_date=${newFormattedDate}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAthletes(data); // Set the athletes data
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please enter both Event Name and Event Date.');
        }
    };

    return (
        <div className="app-container">
            <h1>Event Positions</h1>

            <div className="input-container">
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

                <input 
                    id="date-select"
                    type="date" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    required
                />

                <button onClick={fetchAthletes}>Fetch Data</button>
            </div>

            {formattedDate && <h2 className="selected-date">Selected Date: {formattedDate}</h2>} 

            {loading && <div>Loading...</div>}
            {error && <div className="error">Error: {error}</div>}

            <table className="athletes-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Name</th>
                        <th>Time</th>
                        <th>Age Group</th>
                        <th>Age Grade</th>
                        <th>Club</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {athletes.map((athlete) => (
                        <tr key={`${athlete.position}-${athlete.event_code}`}>
                            <td>{athlete.position}</td>
                            <td>{athlete.name}</td>
                            <td>{athlete.time}</td>
                            <td>{athlete.age_group}</td>
                            <td>{athlete.age_grade}</td>
                            <td>{athlete.club}</td>
                            <td>{athlete.comment}</td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
};

export default App;

