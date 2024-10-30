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
    const [parkrunEvents, setParkrunEvents] = useState([]); // New state to hold parkrun events
    const [menuOption, setMenuOption] = useState('');  // State to manage menu selection



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
                const response = await fetch('https://hello-world-9yb9.onrender.com/api/events'); 
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();
                setEvents(data);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err.message);
            }
        };
        fetchEvents();
    }, []);
    useEffect(() => {
        const fetchParkrunEvents = async () => {
            if (eventCode) {
                try {
                    const response = await fetch(`https://hello-world-9yb9.onrender.com/api/parkrun_events?event_code=${eventCode}`);
                    if (!response.ok) throw new Error('Failed to fetch parkrun events');
                    const data = await response.json();
                    setParkrunEvents(data); // Set parkrun events data
                } catch (err) {
                    console.error('Error fetching parkrun events:', err);
                    setError(err.message);
                }
            }
        };
        fetchParkrunEvents();
    }, [eventCode]);
    // Function to fetch athletes based on selected event code and date
    const fetchAthletes = async () => {
        if (eventCode && eventDate) {
            try {
                setLoading(true);
                
                // Format the Date object to DD/MM/YYYY for the API request
                const day = eventDate.getDate().toString().padStart(2, '0'); // Get day
                const month = (eventDate.getMonth() + 1).toString().padStart(2, '0'); // Get month (zero-based)
                const year = eventDate.getFullYear(); // Get year
                const newFormattedDate = `${day}/${month}/${year}`; // Format as DD/MM/YYYY
                //const newFormattedDate = eventDate ? formatDate(eventDate) : ''; // Format Date
                setFormattedDate(newFormattedDate);  

                // Log the URL to be fetched
                const fetchUrl = `https://hello-world-9yb9.onrender.com/api/eventpositions?event_code=${eventCode}&event_date=${newFormattedDate}`;
                console.log("Fetching data from URL:", fetchUrl);
                
                const response = await fetch(fetchUrl);
                
                // Log the response status
                console.log("Response status:", response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Fetched data:", data); // Log the fetched data
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
    // Function to start scraping 
    const startScraping = async () => {
        try {
            //const response = await fetch('http://localhost:5000/start-scraping', { // Ensure this matches your Flask endpoint
            const response = await fetch('https://bec0-2a02-c7c-a605-fe00-7c2c-adcf-1b1-4018.ngrok-free.app/start-scraping',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loopEvents: true }) // Send loopEvents as true
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            alert(data.message || data.error); // Display success or error message
        } catch (error) {
            alert('An error occurred: ' + error.message); // Catch any fetch errors
        }
    };
    const groupEventsByMonth = () => {
        const groupedData = {};
        parkrunEvents.forEach(event => {
            const eventDate = new Date(event.event_date); 
            const monthYear = `${eventDate.toLocaleString('default', { month: 'long' })} - ${eventDate.getFullYear()}`;
            const weekNumber = Math.ceil(eventDate.getDate() / 7); 
            
            if (!groupedData[monthYear]) {
                groupedData[monthYear] = {
                    date: monthYear,
                    wk1: null,
                    wk2: null,
                    wk3: null,
                    wk4: null,
                    wk5: null
                };
            }
            const weekKey = `wk${weekNumber}`;
            const eventInfo = `${event.event_code}:${event.last_position}(${event.volunteers})`; 
            groupedData[monthYear][weekKey] = eventInfo;
        });
        return Object.values(groupedData);
    };
    return (
        <div className="app-container">
            <h1>Parkrun Events</h1>
            {/* Menu to select options */}
            <div className="menu">
                <button onClick={() => setMenuOption('viewEvents')}>Event and Date Report</button>
                <button onClick={() => setMenuOption('scrapping')}>Start Scraping</button>
                <button onClick={() => setMenuOption('viewTable')}>View Events Table</button>
            </div>
            {menuOption === 'scrapping' && (
                <div>            {/* Button to Start Scraping */}
                    <h2>Scrapping Control</h2>
                    <button onClick={startScraping} style={{ margin: '10px' }}>
                        Start Scraping
                    </button>
                </div>
            )}
            {menuOption === 'viewEvents' && (
                <div>
                    <h2>Fetch Event Athletes</h2>
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

                        <DatePicker
                            selected={eventDate}
                            onChange={(date) => setEventDate(date)} // Update state with chosen date
                            dateFormat="dd/MM/yyyy" // Display the selected date format
                            className="date-picker" // Assign class for styling
                            placeholderText="Select Event Date" // Placeholder text
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
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
            )}
            {menuOption === 'viewTable' && (
                <div>
                <h2>Select a Parkrun Event</h2>
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
                    </div>
                    <h2>Events Table</h2>
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Wk 1</th>
                                <th>Wk 2</th>
                                <th>Wk 3</th>
                                <th>Wk 4</th>
                                <th>Wk 5</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupEventsByMonth().map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.date}</td>
                                    <td>{entry.wk1 || '-'}</td>
                                    <td>{entry.wk2 || '-'}</td>
                                    <td>{entry.wk3 || '-'}</td>
                                    <td>{entry.wk4 || '-'}</td>
                                    <td>{entry.wk5 || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
       </div>
    );
};

export default App;
