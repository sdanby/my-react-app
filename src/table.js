import React, { useState, useEffect } from 'react';
import './App.css'; 
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eventCode, setEventCode] = useState('');
    const [eventDate, setEventDate] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [events, setEvents] = useState([]);
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

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('https://hello-world-9yb9.onrender.com/api/events'); 
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data); 
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err.message);
            }
        };

        fetchEvents();
    }, []);

    const fetchAthletes = async () => {
        if (eventCode && eventDate) {
            try {
                setLoading(true);
                const day = eventDate.getDate().toString().padStart(2, '0');
                const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
                const year = eventDate.getFullYear();
                const newFormattedDate = `${year}-${month}-${day}`; 
                setFormattedDate(`${day}/${month}/${year}`);

                const fetchUrl = `https://hello-world-9yb9.onrender.com/api/eventpositions?event_code=${eventCode}&event_date=${newFormattedDate}`;
                console.log("Fetching data from URL:", fetchUrl);
                
                const response = await fetch(fetchUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAthletes(data); 
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please select both an Event and a Date.');
        }
    };

    const startScraping = async () => {
        try {
            const response = await fetch('https://fc53-2a02-c7c-a605-fe00-55fd-1a6c-c681-6cea.ngrok-free.app/start-scraping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loopEvents: true })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json(); 
            alert(data.message || data.error); 
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    };

    const groupEventsByMonth = () => {
        const groupedData = {};
        events.forEach(event => {
            const eventDate = new Date(event.event_date); // Assumes event_date is in 'YYYY-MM-DD' format
            const monthYear = `${eventDate.toLocaleString('default', { month: 'long' })} - ${eventDate.getFullYear()}`;
            const weekNumber = Math.ceil(eventDate.getDate() / 7); // Calculate week number (1-5)
            
            // Initialize grouped data for the month/year if it does not exist
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

            // Create week key (wk1, wk2, etc.)
            const weekKey = `wk${weekNumber}`;
            // Format the data for the cell
            const eventInfo = `${event.event_code}:${event.last_position}(${event.volunteers})`; 
            
            // Fill the appropriate week slot in the month object
            groupedData[monthYear][weekKey] = eventInfo;
        });

        // Convert the grouped data object back to an array for rendering
        return Object.values(groupedData);
    };

    return (
        <div className="app-container">
            <h1>Parkrun Events</h1>

            {/* Menu to select options */}
            <div className="menu">
                <button onClick={() => setMenuOption('viewEvents')}>Event and Date Report</button>
                <button onClick={startScraping}>Start Scraping</button>
                <button onClick={() => setMenuOption('viewTable')}>View Events Table</button>
            </div>

            {/* Render based on selected menu option */}
            {menuOption === 'viewEvents' && (
                <div>
                    <h2>Fetch Event Athletes</h2>

                    {/* Dropdown to select parkrun events */}
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

                    {/* Date Picker for selecting event date */}
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

