import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure to import your CSS file for styling
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Importing the CSS for the date picker

const App = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eventCode, setEventCode] = useState(''); // This will hold the event code
    const [eventDate, setEventDate] = useState(''); // This will hold the event date
    const [formattedDate, setFormattedDate] = useState('');
    const [events, setEvents] = useState([]); // State to hold events

    // Function to format the date from YYYY-MM-DD to DD/MM/YYYY
    // Function to convert a Date object to required string format
    const formatDate = (date) => {
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`; // Return in YYYY-MM-DD format for API
        }
        return ''; // Handle cases where the input is not a Date object
    };
    const formatTime = (time) => {
        if (!time) return 'N/A';
    
        // Check if the time contains tenths of a second
        const parts = time.split(':');
        if (parts.length === 3) { // mm:ss:tt format
            return `${parts[0]}:${parts[1]}`; // Convert to mm:ss by dropping tenths
        } else if (parts.length === 2) { // mm:ss format
            return time; // Already in mm:ss format
        } else {
            return 'Invalid time format'; // Handle unexpected formats
        }
    }
    

    // Fetch events from Flask API when the component mounts
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
                setError(err.message); // Set error message
            }
        };

        fetchEvents();
    }, []);

    // Function to fetch athletes based on selected event code and date
    const fetchAthletes = async () => {
        if (eventCode && eventDate) {
            try {
                setLoading(true);
                const newFormattedDate = formatDate(eventDate); // Convert date format
                setFormattedDate(newFormattedDate);

                const response = await fetch(`https://hello-world-9yb9.onrender.com/api/eventpositions?event_code=${eventCode}&event_date=${newFormattedDate}`); // Your Flask API URL
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAthletes(data); // Set the athletes data
                setError(null); // Clear any previous error
            } catch (err) {
                setError(err.message); // Set error message
            } finally {
                setLoading(false); // Stop loading
            }
        } else {
            alert('Please enter both Event Name and Event Date.');
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
                {/*
                <input 
                    id="date-select"
                    type="date" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    required
                />
                {/* Date Picker for selecting event date */}
                <DatePicker
                    selected={eventDate}
                    onChange={(date) => setEventDate(date)} // Update state with chosen date
                    dateFormat="dd/MM/yyyy" // Display the selected date format
                    className="date-picker" // Assign class for styling
                    placeholderText="Select Event Date" // Placeholder text
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
                            <td>{formatTime(athlete.time)}</td>  {/* Assuming formatTime function is defined to handle the time correctly */}
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

