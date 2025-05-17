import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Spinner, InputGroup, Toast, ToastContainer, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaRegClock, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EventService from '../services/EventService';
import api from '../utils/api';

const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

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

const eventCategories = [
  { id: 1, name: 'Music' },
  { id: 2, name: 'Sports' },
  { id: 3, name: 'Theater' },
  { id: 4, name: 'Conference' },
  { id: 5, name: 'Exhibition' },
  { id: 6, name: 'Tour' },
  { id: 7, name: 'Workshop' },
  { id: 8, name: 'Festival' },
];

const eventLocations = [
  { id: 1, name: 'Cape Town' },
  { id: 2, name: 'Johannesburg' },
  { id: 3, name: 'Durban' },
  { id: 4, name: 'Port Elizabeth' },
  { id: 5, name: 'Pretoria' },
  { id: 6, name: 'Bloemfontein' }
];

const Events = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState(300);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };

        if (selectedCategory) params.category = selectedCategory;
        if (selectedLocation) params.city = selectedLocation;
        if (searchTerm) params.search = searchTerm;

        const response = await EventService.getEvents(params);
        console.log('Fetch events response:', response); // Debug

        if (response.success) {
          const backendUrl = 'http://localhost:9881';
          const formattedEvents = response.data.map(event => ({
            id: event._id,
            title: event.title,
            category: event.category,
            date: new Date(event.startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            time: new Date(event.startDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            }),
            location: event.venue ? event.venue.name : 'TBA',
            city: event.venue ? event.venue.city : '',
            price: event.tickets && event.tickets[0]?.price || 0,
            ticketsAvailable: event.tickets && event.tickets.length > 0
              ? event.tickets.reduce((sum, ticket) => sum + ticket.available, 0)
              : 0,
            image: event.image && event.image !== 'default-event.jpg'
              ? `${backendUrl}${event.image}`
              : 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
            isFeatured: event.isFeatured,
            description: event.description,
            tickets: event.tickets.map(ticket => ({
              type: ticket.type,
              price: ticket.price,
              available: ticket.available
            }))
          }));

          setEvents(formattedEvents);
          setFilteredEvents(formattedEvents);

          setPagination({
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 12,
            total: response.pagination?.total || formattedEvents.length,
            hasMore: response.pagination?.hasMore || false
          });
        } else {
          throw new Error(response.message || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategories(eventCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchLocations = async () => {
      try {
        setLocations(eventLocations);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    fetchEvents();
    fetchCategories();
    fetchLocations();
  }, [selectedCategory, selectedLocation, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    if (events.length === 0) return;

    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter(event => event.city === selectedLocation);
    }

    filtered = filtered.filter(event => event.price <= priceRange);

    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, selectedLocation, priceRange, events]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleAddToCart = async (event, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setToastMessage('Please log in to add tickets to cart.');
      setToastVariant('danger');
      setShowToast(true);
      navigate('/login');
      return;
    }

    if (event.tickets && event.tickets.length > 1) {
      navigate(`/event/${event.id}`);
      return;
    }

    const ticketType = event.tickets && event.tickets[0];
    if (!ticketType) {
      setToastMessage(`Sorry, tickets for ${event.title} are not available.`);
      setToastVariant('danger');
      setShowToast(true);
      return;
    }

    if (ticketType.available <= 0) {
      setToastMessage(`Sorry, tickets for ${event.title} are sold out.`);
      setToastVariant('danger');
      setShowToast(true);
      return;
    }

    try {
      const bookingData = {
        user: user._id || user.id,
        event: event.id,
        tickets: [
          {
            ticketType: ticketType.type, 
            quantity: 1,
            price: ticketType.price
          }
        ],
        totalAmount: ticketType.price,
        paymentMethod: 'credit_card',
        attendeeInformation: {
          name: user.name || 'Guest',
          email: user.email || 'guest@example.com',
          phone: user.phone || ''
        },
        bookingStatus: 'pending'
      };

      console.log('Sending bookingData:', bookingData); 

      const response = await api.post('/bookings', bookingData);
      if (response.data.success) {
        const cartItem = {
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeId: ticketType.type,
          ticketType: ticketType.type,
          price: ticketType.price,
          quantity: 1,
          image: event.image,
          eventDate: event.date
        };

        console.log('Adding to cart:', cartItem); 
        addToCart(cartItem);
        setToastMessage(`Added ${event.title} to cart!`);
        setToastVariant('success');
        setShowToast(true);
      } else {
        setToastMessage(`Failed to add to cart: ${response.data.message || 'Unknown error'}`);
        setToastVariant('danger');
        setShowToast(true);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data.message || error.message}`
        : 'Network error: Please check if the backend server is running at http://localhost:9881.';
      setToastMessage(errorMessage);
      setToastVariant('danger');
      setShowToast(true);
      console.error('Error adding to cart:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange(300);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    console.log('Changing to page:', page); 
    setPagination(prev => ({ ...prev, page }));
  };

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

  //  total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <motion.div 
      className="events-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header>
            <strong className="me-auto">{toastVariant === 'success' ? 'Added to Cart' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="d-flex align-items-center">
              <div className={`me-3 text-${toastVariant}`}>
                <FaShoppingCart size={24} />
              </div>
              <div>
                <p className="mb-0">{toastMessage}</p>
                {toastVariant === 'success' && (
                  <Button 
                    variant="link" 
                    className="p-0 text-primary" 
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                )}
              </div>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>

      <section className="page-banner position-relative">
        <div 
          className="banner-image w-100" 
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            height: '40vh',
            position: 'relative'
          }}
        >
          <div className="overlay position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
          
          <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="display-4 fw-bold mb-2">Explore Events</h1>
              <p className="lead mb-0">Discover and book exciting events in your area</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-light">
        <Container>
          <Row className="mb-4">
            <Col md={8} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search events by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">Search</Button>
              </InputGroup>
            </Col>
            <Col md={4} className="d-flex justify-content-md-end align-items-center">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowFilters(!showFilters)}
                className="d-flex align-items-center"
              >
                <FaFilter className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Col>
          </Row>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Row>
                    <Col md={3} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label className="fw-bold">Category</Form.Label>
                        <Form.Select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {eventCategories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label className="fw-bold">Location</Form.Label>
                        <Form.Select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                          <option value="">All Locations</option>
                          {eventLocations.map(location => (
                            <option key={location.id} value={location.name}>
                              {location.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label className="fw-bold">Price Range (Max ${priceRange})</Form.Label>
                        <Form.Range
                          min={0}
                          max={300}
                          step={10}
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                      <Button 
                        variant="secondary" 
                        className="w-100"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <p className="mb-0">
              {isLoading ? 'Loading events...' : `Showing ${filteredEvents.length} of ${pagination.total} events`}
            </p>
            <Form.Select style={{ width: 'auto' }}>
              <option>Sort by: Latest</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Name (A-Z)</option>
            </Form.Select>
          </div>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-5">
              <h3>No events found</h3>
              <p className="text-muted">Try adjusting your filters or search criteria</p>
              <Button variant="primary" onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Row>
                {filteredEvents.map(event => (
                  <Col lg={4} md={6} className="mb-4" key={event.id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        className="h-100 border-0 shadow-sm hover-scale event-card" 
                        onClick={() => handleEventClick(event.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={event.image} 
                            style={{ height: '200px', objectFit: 'cover' }} 
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea';
                            }}
                          />
                          {event.isFeatured && (
                            <Badge 
                              bg="warning" 
                              className="position-absolute top-0 end-0 m-2"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                        <Card.Body>
                          <Card.Title>{event.title}</Card.Title>
                          <div className="mb-3">
                            <div className="d-flex align-items-center text-muted mb-2">
                              <FaCalendarAlt className="me-2" size={14} />
                              <small>{event.date} • {event.time}</small>
                            </div>
                            <div className="d-flex align-items-center text-muted">
                              <FaMapMarkerAlt className="me-2" size={14} />
                              <small>{event.city}</small>
                            </div>
                          </div>
                          <Card.Text className="text-muted small mb-3">
                            {event.description.length > 100 
                              ? `${event.description.substring(0, 100)}...` 
                              : event.description
                            }
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="fw-bold text-primary">${event.price.toFixed(2)}</span>
                            <div className="text-muted small mb-1">
                              <FaRegClock className="me-1" size={12} />
                              <small>{event.ticketsAvailable} tickets left</small>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mt-3 flex-wrap">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event/${event.id}`);
                              }}
                              className="me-2 mb-2"
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm"
                              className="d-flex align-items-center mb-2"
                              onClick={(e) => handleAddToCart(event, e)}
                            >
                              <FaShoppingCart className="me-2" /> Add to Cart
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === pagination.page}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={pagination.page === totalPages || !pagination.hasMore}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </motion.div>
          )}
        </Container>
      </section>

      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </motion.div>
  );
};

export default Events;