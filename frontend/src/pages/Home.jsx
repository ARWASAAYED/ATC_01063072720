
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUserAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Tooltip, Space } from 'antd';
import EventService from '../services/EventService';
import { speakerAPI, venueAPI } from '../utils/api';


const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));


const STATIC_HERO_IMAGE = 'https://images.unsplash.com/photo-1565060169187-3ceda1a2e45d';


const BASE_URL = 'http://localhost:9881';


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


const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);


const PopularDestinationsSection = ({ isLoading, popularLocations }) => (
  <section className="py-5 bg-light">
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Popular Venues</h2>
        <Link to="/venues" className="text-decoration-none">View All</Link>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="destinations-container"
        >
          <Row>
            {popularLocations.map((venue) => (
              <Col md={3} className="mb-4" key={venue.id}>
                <motion.div variants={itemVariants}>
                  <Card 
                    className="h-100 border-0 shadow-sm destination-card" 
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <Card.Img 
                      variant="top" 
                      src={venue.image} 
                      height="180" 
                      style={{
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onError={(e) => { e.target.src = '/images/default-venue.jpg'; }}
                      alt={venue.name}
                    />
                    <div 
                      className="position-absolute bottom-0 start-0 w-100 p-3 text-white" 
                      style={{ 
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                        zIndex: 1
                      }}
                    >
                      <h5 className="mb-0">{venue.name}</h5>
                      <div className="small">{venue.eventCount} Events</div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      )}
    </Container>
  </section>
);

const FeaturedEventsSection = ({ isLoading, featuredEvents }) => (
  <section className="py-5">
    <Container>
      <h2 className="text-center mb-5">Featured Events</h2>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row>
            {featuredEvents.map((event) => (
              <Col md={4} className="mb-4" key={event.id}>
                <motion.div variants={itemVariants}>
                  <Card className="h-100 border-0 shadow-sm hover-scale" style={{ transition: 'transform 0.3s' }}>
                    <Card.Img 
                      variant="top" 
                      src={event.image} 
                      height="200" 
                      style={{ objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = '/images/default-event.jpg'; }}
                      alt={event.title}
                    />
                    <Card.Body>
                      <div className="mb-2">
                        <span className={`badge ${event.category === 'Music' ? 'bg-danger' : event.category === 'Tour' ? 'bg-warning' : 'bg-success'} text-white me-2`}>
                          {event.category}
                        </span>
                        <span className="text-muted small">{event.date}</span>
                      </div>
                      <Card.Title>{event.title}</Card.Title>
                      <Card.Text className="text-muted">{event.description.substring(0, 100)}...</Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="text-primary">${event.price.toFixed(2)}</span>
                        <Button variant="outline-primary" size="sm" as={Link} to={`/event/${event.id}`}>BOOK NOW</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      )}
    </Container>
  </section>
);

const SpeakersSection = ({ isLoading, speakers }) => {
  const renderSocialLink = (platform, url) => {
    if (!url) return null;
    const icons = {
      linkedin: <FaLinkedin size={16} style={{ color: '#0A66C2' }} />,
      twitter: <FaTwitter size={16} style={{ color: '#1DA1F2' }} />,
      facebook: <FaFacebook size={16} style={{ color: '#1877F2' }} />,
      instagram: <FaInstagram size={16} style={{ color: '#E4405F' }} />
    };
    return (
      <Tooltip title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: 8 }}
        >
          {icons[platform]}
        </a>
      </Tooltip>
    );
  };

  return (
    <section className="py-5 bg-light">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Speakers</h2>
          <Link to="/speakers" className="text-decoration-none">View All</Link>
        </div>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : speakers.length === 0 ? (
          <div className="text-center text-muted py-4">
            No speakers available at the moment.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row>
              {speakers.map((speaker) => (
                <Col md={3} className="mb-4" key={speaker.id}>
                  <motion.div variants={itemVariants}>
                    <Card className="h-100 border-0 shadow-sm hover-scale">
                      <div className="position-relative">
                        <Card.Img 
                          variant="top" 
                          src={speaker.image} 
                          height="250" 
                          style={{ objectFit: 'cover' }} 
                          alt={speaker.name} 
                          onError={(e) => { e.target.src = '/images/default-speaker.jpg'; }}
                        />
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="mb-1">{speaker.name}</Card.Title>
                        <div className="text-muted small mb-3">
                          {speaker.title} {speaker.organization ? `at ${speaker.organization}` : ''}
                        </div>
                        <Card.Text className="text-muted small">
                          {speaker.events?.length > 0 && speaker.events[0]?.title 
                            ? `Next event: ${speaker.events[0].title}`
                            : 'No upcoming events'}
                        </Card.Text>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          as={Link} 
                          to={`/speaker/${speaker.id}`}
                        >
                          View Profile
                        </Button>
                        <Space className="mt-2">
                          {renderSocialLink('linkedin', speaker.socialMedia.linkedin)}
                          {renderSocialLink('twitter', speaker.socialMedia.twitter)}
                          {renderSocialLink('facebook', speaker.socialMedia.facebook)}
                          {renderSocialLink('instagram', speaker.socialMedia.instagram)}
                        </Space>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}
      </Container>
    </section>
  );
};

const StatisticsSection = () => (
  <section className="py-5" style={{ backgroundColor: '#4a90e2' }}>
    <Container>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Row className="text-center text-white">
          <Col md={3} className="mb-4 mb-md-0">
            <div className="d-flex flex-column align-items-center">
              <div className="display-4 fw-bold mb-2">500+</div>
              <div className="h5">Events</div>
            </div>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <div className="d-flex flex-column align-items-center">
              <div className="display-4 fw-bold mb-2">25K+</div>
              <div className="h5">Happy Attendees</div>
            </div>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <div className="d-flex flex-column align-items-center">
              <div className="display-4 fw-bold mb-2">20+</div>
              <div className="h5">Cities</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="d-flex flex-column align-items-center">
              <div className="display-4 fw-bold mb-2">100+</div>
              <div className="h5">Venues</div>
            </div>
          </Col>
        </Row>
      </motion.div>
    </Container>
  </section>
);

const TestimonialsSection = () => (
  <section className="py-5">
    <Container>
      <h2 className="text-center mb-5">Testimonials</h2>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-3 text-warning">
                  {'★'.repeat(5)}
                </div>
                <Card.Text className="mb-4">"The African Safari adventure was absolutely incredible! The tour guides were knowledgeable and the experience was unforgettable. Will book again!"</Card.Text>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle overflow-hidden me-3" style={{ width: '50px', height: '50px' }}>
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" alt="Sarah M." className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div className="fw-bold">Sarah M.</div>
                    <div className="small text-muted">Cape Town</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  </section>
);

const HeroSection = ({ featuredEvents }) => {
  const featuredEvent = featuredEvents[0] || {
    id: 'default',
    title: 'Table Mountain Cableway',
    category: 'TRAVEL',
    date: 'APRIL 2025',
    city: 'CAPE TOWN',
    organizer: 'TABLE MOUNTAIN',
    image: STATIC_HERO_IMAGE
  };

  return (
    <section className="hero-banner position-relative">
      <div 
        className="hero-image w-100" 
        style={{ 
          backgroundImage: `url(${featuredEvent.image || STATIC_HERO_IMAGE})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          height: '80vh',
          position: 'relative'
        }}
      >
        <div className="overlay position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
        
        <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="d-inline-block mb-3 px-3 py-1 rounded" style={{ backgroundColor: '#f0ad4e' }}>
              {featuredEvent.category}
            </span>
            <h1 className="display-4 fw-bold mb-4">{featuredEvent.title}</h1>
            
            <div className="d-flex justify-content-center align-items-center gap-4 mb-5">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="me-2" />
                <span>{featuredEvent.date}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" />
                <span>{featuredEvent.city}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaUserAlt className="me-2" />
                <span>{featuredEvent.organizer || 'TABLE MOUNTAIN'}</span>
              </div>
            </div>
            
            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="warning" 
                className="text-white px-4 py-2 fw-bold" 
                as={Link} 
                to={`/event/${featuredEvent.id}`}
                disabled={featuredEvent.id === 'default'}
              >
                DETAILS
              </Button>
              <Button 
                variant="light" 
                className="px-4 py-2 fw-bold" 
                as={Link} 
                to={`/event/${featuredEvent.id}`}
                disabled={featuredEvent.id === 'default'}
              >
                BUY TICKET
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SearchSection = () => (
  <section className="search-section py-4" style={{ backgroundColor: '#fff8f9fa' }}>
    <Container>
      <Row className="justify-content-center">
        <Col md={10}>
          <Form className="d-flex flex-wrap">
            <Col xs={12} md className="mb-2 mb-md-0 px-1">
              <Form.Control placeholder="Any event name..." />
            </Col>
            <Col xs={6} md className="mb-2 mb-md-0 px-1">
              <Form.Select>
                <option>Category</option>
                <option>Music</option>
                <option>Sports</option>
                <option>Travel</option>
              </Form.Select>
            </Col>
            <Col xs={6} md className="mb-2 mb-md-0 px-1">
              <Form.Select>
                <option>Location</option>
                <option>Cape Town</option>
                <option>Johannesburg</option>
                <option>Durban</option>
              </Form.Select>
            </Col>
            <Col xs={6} md className="mb-2 mb-md-0 px-1">
              <Form.Select>
                <option>Organizer</option>
                <option>Table Mountain</option>
                <option>Cape Tourism</option>
                <option>Adventure Group</option>
              </Form.Select>
            </Col>
            <Col xs={6} md className="mb-2 mb-md-0 px-1">
              <Form.Select>
                <option>Status</option>
                <option>Available</option>
                <option>Sold Out</option>
                <option>Upcoming</option>
              </Form.Select>
            </Col>
            <Col xs={12} md="auto" className="px-1">
              <Button variant="warning" className="text-white w-100">SEARCH</Button>
            </Col>
          </Form>
        </Col>
      </Row>
    </Container>
  </section>
);

const Home = () => {
  // State management
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured events
        const eventsResponse = await EventService.getEvents({ isFeatured: true, limit: 3 });
        if (eventsResponse.success) {
          const formattedEvents = eventsResponse.data.map(event => {
            const eventData = {
              id: event._id,
              title: event.title,
              category: event.category,
              date: new Date(event.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }),
              city: event.venue?.city || 'TBA',
              description: event.description || '',
              price: event.tickets?.[0]?.price || 0,
              image: event.image?.startsWith('default') 
                ? '/images/default-event.jpg' 
                : event.image ? `${BASE_URL}${event.image}` : STATIC_HERO_IMAGE
            };
            console.log('Event image:', eventData.image);
            return eventData;
          });
          setFeaturedEvents(formattedEvents);
        } else {
          console.warn('Failed to fetch events:', eventsResponse.message);
        }

        // Fetch popular venues
        const venuesResponse = await venueAPI.getVenues();
        if (venuesResponse.success) {
          const formattedVenues = venuesResponse.data
            .map(venue => ({
              id: venue._id,
              name: venue.name || 'Unknown Venue',
              eventCount: venue.events?.length || 0,
              image: venue.image?.startsWith('default') 
                ? '/images/default-venue.jpg' 
                : venue.image ? `${BASE_URL}${venue.image}` : '/images/default-venue.jpg'
            }))
            .sort((a, b) => b.eventCount - a.eventCount)
            .slice(0, 4);
          console.log('Formatted venues:', formattedVenues);
          setPopularLocations(formattedVenues);
        } else {
          console.warn('Failed to fetch venues:', venuesResponse.message);
        }

        // Fetch all speakers
        console.log('Fetching speakers...');
        const speakersResponse = await speakerAPI.getSpeakers();
        console.log('Speakers response:', speakersResponse);
        if (speakersResponse.success && Array.isArray(speakersResponse.data)) {
          const formattedSpeakers = speakersResponse.data
            .map(speaker => {
              const speakerData = {
                id: speaker._id || speaker.id,
                name: speaker.name || 'Unknown Speaker',
                title: speaker.position || 'Speaker',
                organization: speaker.company || '',
                image: speaker.profileImage && !speaker.profileImage.startsWith('default') 
                  ? `${BASE_URL}${speaker.profileImage}` 
                  : '/images/default-speaker.jpg',
                events: Array.isArray(speaker.events) ? speaker.events.map(event => ({
                  _id: event._id,
                  title: event.title,
                  startDate: event.startDate
                })) : [],
                socialMedia: {
                  linkedin: speaker.socialMedia?.linkedin || '',
                  twitter: speaker.socialMedia?.twitter || '',
                  facebook: speaker.socialMedia?.facebook || '',
                  instagram: speaker.socialMedia?.instagram || ''
                }
              };
              console.log('Speaker social media:', speakerData.socialMedia);
              return speakerData;
            })
            .slice(0, 4); // Limit to 4 speakers for display
          console.log('Formatted speakers:', formattedSpeakers);
          setSpeakers(formattedSpeakers);
        } else {
          console.warn('Failed to fetch speakers:', speakersResponse);
          setSpeakers([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle error state
  if (error) {
    return (
      <div className="error-container text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <Button 
          variant="primary" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="event-booking-home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>

      <HeroSection featuredEvents={featuredEvents} />
      <SearchSection />
      <PopularDestinationsSection isLoading={isLoading} popularLocations={popularLocations} />
      <FeaturedEventsSection isLoading={isLoading} featuredEvents={featuredEvents} />
      <SpeakersSection isLoading={isLoading} speakers={speakers} />
      <StatisticsSection />
      <TestimonialsSection />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </motion.div>
  );
};

export default Home;