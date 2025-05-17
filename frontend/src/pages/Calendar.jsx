import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import EventService from '../services/EventService';

// Lazy loaded components
const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

// Backend base URL
const BASE_URL = 'http://localhost:9881';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Reusable components
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center py-5">
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

// Helper functions for calendar
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const Calendar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateEvents, setDateEvents] = useState([]);
  
  // Calendar state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Get days for calendar
  useEffect(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Add empty slots for days from previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = date.toISOString().split('T')[0];
      const hasEvents = events.some(event => event.date === dateStr);
      
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        date: dateStr,
        hasEvents
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth, currentYear, events]);
  
  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await EventService.getEvents({ limit: 100 }); 
        if (response.success) {
          const formattedEvents = response.data.map(event => {
            const startDate = new Date(event.startDate);
            return {
              id: event._id,
              title: event.title || 'Untitled Event',
              description: event.description || 'No description available',
              image: event.image?.startsWith('default') 
                ? '/images/default-event.jpg' 
                : event.image ? `${BASE_URL}${event.image}` : 'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
              date: startDate.toISOString().split('T')[0], // YYYY-MM-DD
              time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'TBA',
              category: event.category || 'General',
              location: event.venue?.name || 'TBA',
              city: event.venue?.city || 'Unknown',
              price: event.tickets?.[0]?.price || 0,
              ticketsAvailable: event.tickets?.[0]?.quantity || 100, // Default if not provided
              isFeatured: event.isFeatured || false
            };
          });
          console.log('Formatted events:', formattedEvents);
          setEvents(formattedEvents);
          setIsLoading(false);
        } else {
          throw new Error(response.message || 'Failed to fetch events');
        }
      } catch (error) {
        setError('Failed to load events. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);
  
  // Navigate between months
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth || !day.day) return;
    
    setSelectedDate(day.date);
    const dayEvents = events.filter(event => event.date === day.date);
    setDateEvents(dayEvents);
  };
  
  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div className="calendar-page">
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>
      
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col>
              <h1 className="mb-3">Event Calendar</h1>
              <p className="text-muted">Browse all upcoming events by date</p>
            </Col>
          </Row>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Row>
              <Col lg={8}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        className="rounded-circle p-2" 
                        onClick={goToPreviousMonth}
                      >
                        <FaChevronLeft />
                      </Button>
                      <h4 className="mb-0">{monthNames[currentMonth]} {currentYear}</h4>
                      <Button 
                        variant="outline-secondary" 
                        className="rounded-circle p-2" 
                        onClick={goToNextMonth}
                      >
                        <FaChevronRight />
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="calendar-grid">
                      {/* Day headers */}
                      <div className="calendar-header">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <div key={index} className="calendar-day-header">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar days */}
                      <div className="calendar-days">
                        {calendarDays.map((day, index) => (
                          <div 
                            key={index}
                            className={`calendar-day ${!day.isCurrentMonth ? 'inactive' : ''} ${day.hasEvents ? 'has-events' : ''} ${selectedDate === day.date ? 'selected' : ''}`}
                            onClick={() => day.day && handleDateClick(day)}
                          >
                            {day.day && (
                              <>
                                <span className="day-number">{day.day}</span>
                                {day.hasEvents && <span className="event-dot"></span>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={4}>
                <Card className="shadow-sm events-list-card">
                  <Card.Header className="bg-white py-3">
                    <h5 className="mb-0">
                      {selectedDate ? (
                        <>Events on {new Date(selectedDate).toLocaleDateString()}</>
                      ) : (
                        <>Select a date to view events</>
                      )}
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {selectedDate ? (
                      dateEvents.length > 0 ? (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="event-list"
                        >
                          {dateEvents.map(event => (
                            <motion.div key={event.id} variants={itemVariants}>
                              <div className="p-3 border-bottom">
                                <div className="d-flex">
                                  <div 
                                    className="event-thumbnail me-3" 
                                    style={{ 
                                      backgroundImage: `url(${event.image})`,
                                      width: '80px',
                                      height: '80px',
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      borderRadius: '4px'
                                    }}
                                  ></div>
                                  <div className="event-details flex-grow-1">
                                    <h6 className="mb-1">{event.title}</h6>
                                    <div className="d-flex align-items-center text-muted mb-1 small">
                                      <FaClock className="me-1" size={12} />
                                      <span>{event.time}</span>
                                    </div>
                                    <div className="d-flex align-items-center text-muted mb-2 small">
                                      <FaMapMarkerAlt className="me-1" size={12} />
                                      <span>{event.location}, {event.city}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <Badge 
                                        bg={
                                          event.category === 'Music' ? 'danger' : 
                                          event.category === 'Sports' ? 'success' : 
                                          event.category === 'Conference' ? 'info' : 
                                          event.category === 'Festival' ? 'warning' : 'primary'
                                        }
                                      >
                                        {event.category}
                                      </Badge>
                                      <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-primary">Details</Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-muted mb-0">No events scheduled for this date.</p>
                        </div>
                      )
                    ) : (
                      <div className="p-4 text-center">
                        <FaCalendarAlt size={40} className="text-muted mb-3" />
                        <p className="text-muted mb-0">Click on a date in the calendar to view events.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </section>
      
      {/* Events by category section */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2>Browse Events by Category</h2>
            </Col>
          </Row>
          <Row>
            {['Music', 'Sports', 'Conference', 'Festival', 'Art', 'Entertainment'].map((category, index) => (
              <Col key={index} md={4} className="mb-4">
                <Card 
                  className="border-0 shadow-sm category-card hover-scale"
                  style={{ cursor: 'pointer' }}
                  as={Link}
                  to={`/events?category=${category}`}
                >
                  <Card.Body className="d-flex align-items-center p-4">
                    <div 
                      className="category-icon me-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: 
                          category === 'Music' ? '#dc3545' : 
                          category === 'Sports' ? '#28a745' : 
                          category === 'Conference' ? '#17a2b8' : 
                          category === 'Festival' ? '#ffc107' : 
                          category === 'Art' ? '#6f42c1' : '#fd7e14'
                      }}
                    >
                      <span className="text-white">
                        {category === 'Music' && <i className="fas fa-music"></i>}
                        {category === 'Sports' && <i className="fas fa-running"></i>}
                        {category === 'Conference' && <i className="fas fa-users"></i>}
                        {category === 'Festival' && <i className="fas fa-glass-cheers"></i>}
                        {category === 'Art' && <i className="fas fa-palette"></i>}
                        {category === 'Entertainment' && <i className="fas fa-ticket-alt"></i>}
                      </span>
                    </div>
                    <div>
                      <h5 className="mb-1">{category}</h5>
                      <p className="mb-0 text-muted">
                        {events.filter(event => event.category === category).length} events
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      
      {/* Add custom styling for calendar */}
      <style jsx>{`
        .calendar-grid {
          width: 100%;
        }
        
        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-gap: 5px;
        }
        
        .calendar-day {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          border-radius: 5px;
          border: 1px solid #e9ecef;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .calendar-day:hover:not(.inactive) {
          background-color: #f8f9fa;
        }
        
        .calendar-day.inactive {
          opacity: 0.3;
          cursor: default;
        }
        
        .calendar-day.has-events {
          font-weight: 600;
        }
        
        .calendar-day.selected {
          background-color: #e7f5ff;
          border-color: #007bff;
        }
        
        .event-dot {
          position: absolute;
          bottom: 5px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #007bff;
        }
        
        .events-list-card {
          height: 100%;
        }
        
        .event-list {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-5px);
        }
      `}</style>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Calendar;