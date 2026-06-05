import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Nav, Tab, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaFilter, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Lazy loaded components
const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

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

// Mock data for conference schedule
const mockConference = {
  id: 1,
  name: "Tech Innovators Summit 2025",
  description: "Join industry leaders and innovators for three days of cutting-edge technology discussions, workshops, and networking opportunities.",
  startDate: "2025-06-10",
  endDate: "2025-06-12",
  venue: {
    id: 1,
    name: "Grand Convention Center",
    address: "123 Main Street, Cape Town, 8001"
  },
  days: [
    {
      date: "2025-06-10",
      name: "Day 1",
      sessions: [
        {
          id: 101,
          title: "Registration & Welcome Breakfast",
          startTime: "08:00",
          endTime: "09:30",
          location: "Main Lobby",
          type: "break",
          description: "Pick up your conference badge and join us for a networking breakfast."
        },
        {
          id: 102,
          title: "Opening Keynote: The Future of Technology",
          startTime: "09:30",
          endTime: "10:30",
          location: "Main Hall",
          type: "keynote",
          description: "An inspiring vision of where technology is headed in the next decade.",
          speakers: [
            {
              id: 1,
              name: "Dr. Sophia Chen",
              position: "AI Research Scientist",
              organization: "TechNova Institute",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
            }
          ]
        },
        {
          id: 103,
          title: "Morning Break",
          startTime: "10:30",
          endTime: "11:00",
          type: "break",
          location: "Networking Area"
        },
        {
          id: 104,
          title: "AI Ethics in Practice",
          startTime: "11:00",
          endTime: "12:00",
          location: "Room A",
          type: "workshop",
          description: "Exploring the ethical implications of AI systems and how to design responsible AI.",
          speakers: [
            {
              id: 1,
              name: "Dr. Sophia Chen",
              position: "AI Research Scientist",
              organization: "TechNova Institute",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
            },
            {
              id: 3,
              name: "Amara Okafor",
              position: "Climate Scientist",
              organization: "EarthFirst Research Center",
              image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
            }
          ]
        },
        {
          id: 105,
          title: "Building Sustainable Web Applications",
          startTime: "11:00",
          endTime: "12:00",
          location: "Room B",
          type: "presentation",
          description: "Learn how to reduce the carbon footprint of your web applications without sacrificing performance.",
          speakers: [
            {
              id: 4,
              name: "Ricardo Mendez",
              position: "Tech Entrepreneur",
              organization: "Innovate Solutions",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
            }
          ]
        },
        {
          id: 106,
          title: "Blockchain Beyond Cryptocurrency",
          startTime: "11:00",
          endTime: "12:00",
          location: "Room C",
          type: "panel",
          description: "Industry experts discuss practical applications of blockchain technology beyond digital currencies.",
          speakers: [
            {
              id: 2,
              name: "James Wilson",
              position: "Marketing Director",
              organization: "Global Brands Inc.",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
            },
            {
              id: 6,
              name: "Michael Thompson",
              position: "Financial Analyst",
              organization: "Global Investments Ltd.",
              image: "https://images.unsplash.com/photo-1563833717765-00462801e6ed"
            }
          ]
        },
        {
          id: 107,
          title: "Lunch Break",
          startTime: "12:00",
          endTime: "13:30",
          type: "break",
          location: "Dining Hall",
          description: "Networking lunch with special dietary options available."
        },
        {
          id: 108,
          title: "Implementing Zero Trust Security",
          startTime: "13:30",
          endTime: "14:30",
          location: "Room A",
          type: "workshop",
          description: "Practical strategies for implementing zero trust security models in your organization.",
          speakers: [
            {
              id: 4,
              name: "Ricardo Mendez",
              position: "Tech Entrepreneur",
              organization: "Innovate Solutions",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
            }
          ]
        },
        {
          id: 109,
          title: "The Future of Digital Marketing",
          startTime: "13:30",
          endTime: "14:30",
          location: "Room B",
          type: "presentation",
          description: "How AI and data analytics are transforming the marketing landscape.",
          speakers: [
            {
              id: 2,
              name: "James Wilson",
              position: "Marketing Director",
              organization: "Global Brands Inc.",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
            }
          ]
        },
        {
          id: 110,
          title: "Afternoon Break",
          startTime: "14:30",
          endTime: "15:00",
          type: "break",
          location: "Networking Area"
        },
        {
          id: 111,
          title: "Mind-Machine Interfaces: Current State and Future Possibilities",
          startTime: "15:00",
          endTime: "16:00",
          location: "Main Hall",
          type: "keynote",
          description: "An exploration of cutting-edge research in brain-computer interfaces and what it means for humanity.",
          speakers: [
            {
              id: 5,
              name: "Dr. Jasmine Park",
              position: "Neuroscientist",
              organization: "Brain Research Institute",
              image: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
            }
          ]
        },
        {
          id: 112,
          title: "Networking Reception",
          startTime: "17:00",
          endTime: "19:00",
          type: "social",
          location: "Rooftop Garden",
          description: "Join us for drinks, appetizers, and connections with fellow attendees."
        }
      ]
    },
    {
      date: "2025-06-11",
      name: "Day 2",
      sessions: [
        {
          id: 201,
          title: "Morning Coffee",
          startTime: "08:30",
          endTime: "09:30",
          location: "Main Lobby",
          type: "break",
          description: "Start your day with refreshments and networking."
        },
        {
          id: 202,
          title: "Climate Tech: Innovation for a Sustainable Future",
          startTime: "09:30",
          endTime: "10:30",
          location: "Main Hall",
          type: "keynote",
          description: "How technology is addressing our most pressing environmental challenges.",
          speakers: [
            {
              id: 3,
              name: "Amara Okafor",
              position: "Climate Scientist",
              organization: "EarthFirst Research Center",
              image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
            }
          ]
        },
        {
          id: 203,
          title: "Morning Break",
          startTime: "10:30",
          endTime: "11:00",
          type: "break",
          location: "Networking Area"
        },
        // More sessions for Day 2...
      ]
    },
    {
      date: "2025-06-12",
      name: "Day 3",
      sessions: [
        {
          id: 301,
          title: "Breakfast & Networking",
          startTime: "08:30",
          endTime: "09:30",
          location: "Main Lobby",
          type: "break",
          description: "Final day networking breakfast."
        },
        {
          id: 302,
          title: "The Economic Impact of Technological Innovation",
          startTime: "09:30",
          endTime: "10:30",
          location: "Main Hall",
          type: "keynote",
          description: "Analyzing how technology shapes economic systems and creates new opportunities.",
          speakers: [
            {
              id: 6,
              name: "Michael Thompson",
              position: "Financial Analyst",
              organization: "Global Investments Ltd.",
              image: "https://images.unsplash.com/photo-1563833717765-00462801e6ed"
            }
          ]
        },
        {
          id: 303,
          title: "Morning Break",
          startTime: "10:30",
          endTime: "11:00",
          type: "break",
          location: "Networking Area"
        },
        // More sessions for Day 3...
      ]
    }
  ],
  tracks: [
    { id: 1, name: "AI & Machine Learning", color: "#dc3545" },
    { id: 2, name: "Web & Mobile Development", color: "#28a745" },
    { id: 3, name: "Blockchain & Fintech", color: "#fd7e14" },
    { id: 4, name: "Security & Privacy", color: "#6610f2" },
    { id: 5, name: "Business & Marketing", color: "#20c997" }
  ],
  sessionTypes: [
    { id: 1, name: "Keynote", color: "#007bff" },
    { id: 2, name: "Presentation", color: "#28a745" },
    { id: 3, name: "Workshop", color: "#fd7e14" },
    { id: 4, name: "Panel", color: "#6610f2" },
    { id: 5, name: "Break", color: "#6c757d" },
    { id: 6, name: "Social", color: "#20c997" }
  ]
};

// Helper function to format time (e.g., "09:30" to "9:30 AM")
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Get session type color
const getSessionTypeColor = (type, sessionTypes) => {
  const sessionType = sessionTypes.find(st => st.name.toLowerCase() === type.toLowerCase());
  return sessionType ? sessionType.color : '#6c757d'; // Default gray
};

// Get appropriate text color based on background color
const getTextColor = (bgColor) => {
  // Simple logic: if the color is light, use dark text; otherwise, use light text
  const isLight = bgColor === '#20c997' || bgColor === '#28a745' || bgColor === '#fd7e14';
  return isLight ? '#212529' : '#ffffff';
};

const Schedule = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [conference, setConference] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState(null);
  const [activeTimeSlot, setActiveTimeSlot] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch conference data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setConference(mockConference);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load schedule. Please try again later.');
        setIsLoading(false);
        console.error('Error loading schedule:', error);
      }
    }, 1000);
  }, []);
  
  // Filter sessions when search or filter criteria change
  const getFilteredSessions = () => {
    if (!conference || !conference.days[selectedDay]) return [];
    
    let sessions = [...conference.days[selectedDay].sessions];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sessions = sessions.filter(session => 
        session.title.toLowerCase().includes(term) || 
        session.description?.toLowerCase().includes(term) ||
        session.location?.toLowerCase().includes(term) ||
        session.speakers?.some(speaker => 
          speaker.name.toLowerCase().includes(term) || 
          speaker.organization.toLowerCase().includes(term)
        )
      );
    }
    
    // Filter by session type
    if (selectedTypes.length > 0) {
      sessions = sessions.filter(session => selectedTypes.includes(session.type));
    }
    
    // If using tracks (not implemented in the mock data but prepared for future)
    if (selectedTracks.length > 0 && sessions.some(s => s.track)) {
      sessions = sessions.filter(session => session.track && selectedTracks.includes(session.track));
    }
    
    return sessions;
  };
  
  // Toggle session type selection
  const toggleSessionType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedTracks([]);
  };
  
  // Group sessions by time slots
  const getTimeSlots = () => {
    const sessions = getFilteredSessions();
    if (!sessions.length) return [];
    
    // Create unique time slots
    const timeSlots = [];
    sessions.forEach(session => {
      const existingSlot = timeSlots.find(slot => 
        slot.startTime === session.startTime && slot.endTime === session.endTime
      );
      
      if (!existingSlot) {
        timeSlots.push({
          startTime: session.startTime,
          endTime: session.endTime,
          sessions: [session]
        });
      } else {
        existingSlot.sessions.push(session);
      }
    });
    
    // Sort by start time
    return timeSlots.sort((a, b) => {
      const timeA = parseInt(a.startTime.replace(':', ''), 10);
      const timeB = parseInt(b.startTime.replace(':', ''), 10);
      return timeA - timeB;
    });
  };
  
  return (
    <motion.div
      className="schedule-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Suspense fallback */}
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>
      
      {/* Hero Banner */}
      <section className="hero-banner py-5 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-5 fw-bold mb-3">
                {conference ? conference.name : 'Event Schedule'}
              </h1>
              <p className="lead mb-0">
                {conference ? conference.description : 'Explore the schedule and plan your event experience.'}
              </p>
              
              {conference && (
                <div className="mt-4 d-flex flex-wrap">
                  <div className="me-4 mb-2">
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2" />
                      <span>
                        {new Date(conference.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
                        {new Date(conference.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="me-4 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" />
                      <span>{conference.venue.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>
      
      {isLoading ? (
        <div className="py-5">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Container className="py-5">
          <Alert variant="danger">
            {error}
          </Alert>
        </Container>
      ) : conference && (
        <>
          {/* Day Selector */}
          <section className="py-4 bg-light border-bottom">
            <Container>
              <Row className="align-items-center">
                <Col md={8}>
                  <Nav variant="pills" className="day-selector">
                    {conference.days.map((day, index) => (
                      <Nav.Item key={index}>
                        <Nav.Link
                          active={selectedDay === index}
                          onClick={() => setSelectedDay(index)}
                          className="rounded-pill px-4"
                        >
                          {day.name}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="d-flex align-items-center mx-auto mx-md-0 ms-md-auto"
                  >
                    <FaFilter className="me-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </Col>
              </Row>
              
              {/* Filters */}
              {showFilters && (
                <div className="filters mt-4">
                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <div className="d-flex">
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaSearch />
                            </span>
                            <Form.Control
                              type="text"
                              placeholder="Search sessions, speakers, locations..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          {searchTerm && (
                            <Button 
                              variant="outline-secondary" 
                              className="ms-2"
                              onClick={() => setSearchTerm('')}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-center justify-content-end">
                      <Button 
                        variant="link" 
                        className="text-decoration-none"
                        onClick={resetFilters}
                        disabled={!searchTerm && selectedTypes.length === 0 && selectedTracks.length === 0}
                      >
                        Reset All Filters
                      </Button>
                    </Col>
                  </Row>
                  
                  <div className="session-type-filters mt-3">
                    <h6 className="mb-2">Session Types:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {conference.sessionTypes.map((type, index) => (
                        <Badge 
                          key={index}
                          bg={selectedTypes.includes(type.name.toLowerCase()) ? "primary" : "light"}
                          text={selectedTypes.includes(type.name.toLowerCase()) ? "white" : "dark"}
                          className="py-2 px-3 cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleSessionType(type.name.toLowerCase())}
                        >
                          {type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Container>
          </section>
          
          {/* Schedule Timeline */}
          <section className="py-5">
            <Container>
              <h2 className="mb-4">
                {conference.days[selectedDay].name} - {new Date(conference.days[selectedDay].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              
              {getTimeSlots().length === 0 ? (
                <Alert variant="info">
                  No sessions match your search or filter criteria. Please adjust your filters.
                </Alert>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="timeline"
                >
                  {getTimeSlots().map((timeSlot, timeIndex) => (
                    <div 
                      key={timeIndex} 
                      className={`time-slot mb-4 ${activeTimeSlot === timeIndex ? 'active' : ''}`}
                    >
                      <div 
                        className="time-header d-flex align-items-center mb-3"
                        onClick={() => setActiveTimeSlot(activeTimeSlot === timeIndex ? null : timeIndex)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="time-badge bg-primary text-white py-2 px-3 rounded me-3">
                          <FaClock className="me-2" />
                          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                        </div>
                        <div className="flex-grow-1 border-bottom"></div>
                      </div>
                      
                      <Row className="g-4 session-row">
                        {timeSlot.sessions.map((session, sessionIndex) => (
                          <Col lg={session.type === 'break' || session.type === 'social' ? 12 : 6} key={sessionIndex}>
                            <motion.div variants={itemVariants}>
                              <Card 
                                className="h-100 border-0 shadow-sm session-card" 
                                style={{ 
                                  borderLeft: `4px solid ${getSessionTypeColor(session.type, conference.sessionTypes)}`,
                                  opacity: selectedTypes.length > 0 && !selectedTypes.includes(session.type) ? 0.6 : 1
                                }}
                              >
                                <Card.Body>
                                  <div className="d-flex justify-content-between mb-2">
                                    <Badge 
                                      style={{ 
                                        backgroundColor: getSessionTypeColor(session.type, conference.sessionTypes),
                                        color: getTextColor(getSessionTypeColor(session.type, conference.sessionTypes))
                                      }}
                                      className="py-1 px-2"
                                    >
                                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                                    </Badge>
                                    
                                    {session.track && (
                                      <Badge bg="light" text="dark">
                                        {session.track}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <Card.Title className="mb-2">{session.title}</Card.Title>
                                  
                                  {session.location && (
                                    <div className="d-flex align-items-center text-muted mb-2 small">
                                      <FaMapMarkerAlt className="me-1" size={14} />
                                      <span>{session.location}</span>
                                    </div>
                                  )}
                                  
                                  {session.description && (
                                    <Card.Text className="text-muted mb-3 small">
                                      {session.description}
                                    </Card.Text>
                                  )}
                                  
                                  {session.speakers && session.speakers.length > 0 && (
                                    <div className="speakers mt-3">
                                      <h6 className="small text-muted mb-2">Speakers:</h6>
                                      <div className="d-flex flex-wrap">
                                        {session.speakers.map((speaker, speakerIndex) => (
                                          <div key={speakerIndex} className="d-flex align-items-center me-3 mb-2">
                                            <img 
                                              src={speaker.image} 
                                              alt={speaker.name} 
                                              className="rounded-circle me-2"
                                              width="30"
                                              height="30"
                                              style={{ objectFit: 'cover' }}
                                            />
                                            <div>
                                              <div className="speaker-name small fw-bold">{speaker.name}</div>
                                              <div className="organization small text-muted">{speaker.organization}</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}
                </motion.div>
              )}
            </Container>
          </section>
          
          {/* CTA Section */}
          <section className="py-5 bg-light">
            <Container className="text-center">
              <h2 className="mb-3">Ready to attend this event?</h2>
              <p className="lead mb-4">
                Secure your spot and be part of this amazing experience.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                as={Link}
                to="/events"
                className="me-3"
              >
                Register Now
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                as={Link}
                to="/venues"
              >
                View Venue Details
              </Button>
            </Container>
          </section>
        </>
      )}
      
      {/* Footer with Suspense for better loading performance */}
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
      
      <style jsx>{`
        .day-selector .nav-link {
          margin-right: 10px;
        }
        
        .time-slot {
          position: relative;
        }
        
        .time-slot:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 52px;
          top: 50px;
          height: calc(100% - 10px);
          width: 2px;
          background-color: #e9ecef;
          z-index: -1;
        }
        
        .session-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .session-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
        }
        
        @media (max-width: 768px) {
          .time-slot:not(:last-child)::before {
            left: 44px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Schedule;
