import React from 'react';
import { BsArrowUpRight, BsArrowUpLeft } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Flex, Table, Card } from 'antd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

const Dashboard = () => {
  
  const eventData = [
    { month: 'Jan', ticketsSold: 50, bookings: 20 },
    { month: 'Feb', ticketsSold: 70, bookings: 25 },
    { month: 'Mar', ticketsSold: 90, bookings: 30 },
    { month: 'Apr', ticketsSold: 200, bookings: 50 },
    { month: 'May', ticketsSold: 60, bookings: 22 },
    { month: 'Jun', ticketsSold: 40, bookings: 15 },
    { month: 'Jul', ticketsSold: 55, bookings: 18 },
    { month: 'Aug', ticketsSold: 65, bookings: 20 },
    { month: 'Sep', ticketsSold: 80, bookings: 25 },
    { month: 'Oct', ticketsSold: 300, bookings: 70 },
    { month: 'Nov', ticketsSold: 320, bookings: 75 },
    { month: 'Dec', ticketsSold: 350, bookings: 80 },
  ];

  const recentBookingsColumns = [
    { title: 'ID', dataIndex: 'key' },
    { title: 'Event', dataIndex: 'event' },
    { title: 'Speaker', dataIndex: 'speaker' },
    { title: 'Venue', dataIndex: 'venue' },
    { title: 'Date', dataIndex: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <span className={status === 'Confirmed' ? 'green' : 'red'}>{status}</span>
      ),
    },
  ];

  

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tech Conference',
      start: new Date(2025, 5, 15, 9, 0),
      end: new Date(2025, 5, 15, 17, 0),
      speaker: 'John Doe',
      venue: 'Conference Center',
    },
    {
      id: 2,
      title: 'Music Festival',
      start: new Date(2025, 6, 20, 14, 0),
      end: new Date(2025, 6, 20, 22, 0),
      speaker: 'Jane Smith',
      venue: 'City Arena',
    },
  ];



  return (
    <div>
      <h3 className="mb-4 title">Event Booking Dashboard</h3>
      <Flex gap="middle" wrap>
        {/* Card 1: Total Ticket Sales */}
        <Card className="flex-grow-1 bg-white p-3 rounded-3">
          <Flex justify="space-between" align="flex-end">
            <div>
              <p className="desc">Total Ticket Sales</p>
              <h4 className="mb-0 sub-title">$12,345</h4>
            </div>
            <div className="d-flex flex-column align-items-end">
              <h6 className="green">
                <BsArrowUpRight /> 15%
              </h6>
              <p className="mb-0 desc">Compared to April 2025</p>
            </div>
          </Flex>
        </Card>

        {/* Card 2: Upcoming Events */}
        <Card className="flex-grow-1 bg-white p-3 rounded-3">
          <Flex justify="space-between" align="flex-end">
            <div>
              <p className="desc">Upcoming Events</p>
              <h4 className="mb-0 sub-title">8</h4>
            </div>
            <div className="d-flex flex-column align-items-end">
              <h6 className="red">
                <BsArrowUpLeft /> 5%
              </h6>
              <p className="mb-0 desc">Compared to April 2025</p>
            </div>
          </Flex>
        </Card>

        {/* Card 3: Venue Bookings */}
        <Card className="flex-grow-1 bg-white p-3 rounded-3">
          <Flex justify="space-between" align="flex-end">
            <div>
              <p className="desc">Venue Bookings</p>
              <h4 className="mb-0 sub-title">24</h4>
            </div>
            <div className="d-flex flex-column align-items-end">
              <h6 className="green">
                <BsArrowUpRight /> 10%
              </h6>
              <p className="mb-0 desc">Compared to April 2025</p>
            </div>
          </Flex>
        </Card>
      </Flex>

      {/* Ticket Sales Chart */}
      <div className="mt-4">
        <h3 className="mb-5 title">Ticket Sales Statistics</h3>
        <BarChart width={1160} height={300} data={eventData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ticketsSold" fill="#82ca9d" name="Tickets Sold" />
          <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
        </BarChart>
      </div>

      {/* Event Calendar */}
      <div className="mt-4">
        <h3 className="mb-5 title">Event Schedule</h3>
        <Calendar
          localizer={localizer}
          events={upcomingEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          className="rbc-calendar"
          views={['month', 'week', 'day']}
          popup
          onSelectEvent={(event) =>
            alert(`Event: ${event.title}\nSpeaker: ${event.speaker}\nVenue: ${event.venue}`)
          }
        />
      </div>

     

      
    </div>
  );
};

export default Dashboard;