import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Tab, Tabs, Alert, ListGroup, ProgressBar, Accordion, Toast, ToastContainer } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaUserAlt, FaStar, FaRegStar, FaRegClock, FaShare, FaHeart, FaRegHeart, FaChevronRight, FaShoppingCart, FaLock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EventService from '../services/EventService';
import api from '../utils/api';

const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

const LoadingSpinner = () => (
  <div className="text-center py-5">
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log('Fetching event with ID:', id);
        setIsLoading(true);
        
        const response = await EventService.getEventById(id);
        console.log('Event response:', response);
        
        if (response.success && response.data) {
          const eventData = response.data;
          const backendUrl = 'http://localhost:9881';
          const formattedEvent = {
            id: eventData._id,
            title: eventData.title || 'Untitled Event',
            category: eventData.category || 'Unknown',
            date: eventData.startDate ? new Date(eventData.startDate).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            }) : 'TBD',
            time: eventData.startDate ? new Date(eventData.startDate).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit'
            }) : 'TBD',
            location: eventData.venue?.name || eventData.city || 'TBA',
            address: eventData.venue ? `${eventData.venue.address || ''}, ${eventData.venue.city || ''}` : eventData.address || '',
            city: eventData.venue?.city || eventData.city || '',
            ticketTypes: eventData.tickets || [],
            ticketsAvailable: eventData.tickets?.reduce((sum, ticket) => sum + (ticket.available || 0), 0) || 0,
            price: eventData.tickets?.[0]?.price || 0,
            image: eventData.image && eventData.image !== 'default-event.jpg' 
              ? `${backendUrl}${eventData.image}` 
              : 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
            images: eventData.images?.map(img => `${backendUrl}${img}`) || [],
            description: eventData.description || 'No description available',
            longDescription: eventData.longDescription || eventData.description || 'No description available',
            speakers: eventData.speakers || [],
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            isFeatured: eventData.isFeatured || false,
            venue: eventData.venue
          };
          
          console.log('Formatted event:', formattedEvent);
          setEvent(formattedEvent);
          
          if (formattedEvent.ticketTypes.length > 0) {
            setSelectedTicketType(formattedEvent.ticketTypes[0]._id || formattedEvent.ticketTypes[0].id || '');
          }
          
          fetchRelatedEvents(eventData.category);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error in fetchEventData:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchRelatedEvents = async (category) => {
      try {
        const response = await EventService.getEvents({ category, limit: 3 });
        console.log('Related events response:', response);
        const backendUrl = 'http://localhost:9881';
        if (response.success) {
          const filteredEvents = response.data
            .filter(relEvent => relEvent._id !== id)
            .slice(0, 3);
            
          setRelatedEvents(filteredEvents.map(event => ({
            id: event._id,
            title: event.title || 'Untitled',
            image: event.image && event.image !== 'default-event.jpg' 
              ? `${backendUrl}${event.image}` 
              : 'https://via.placeholder.com/300',
            category: event.category || 'Unknown',
            date: event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD',
            location: event.venue?.city || event.city || '',
            price: event.tickets?.[0]?.price || 0
          })));
        }
      } catch (err) {
        console.error('Error fetching related events:', err);
      }
    };

    fetchEventData();
  }, [id]);

  const calculateTotal = () => {
    if (!event || !selectedTicketType) return 0;
    const ticketType = event.ticketTypes.find((ticket, index) => 
      ticket._id === selectedTicketType || ticket.id === selectedTicketType || index === parseInt(selectedTicketType)
    );
    return ticketType ? ticketType.price * quantity : 0;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!selectedTicketType || quantity < 1) {
      setToastMessage('Please select a ticket type and quantity.');
      setToastVariant('danger');
      setShowToast(true);
      return;
    }

    if (!isAuthenticated) {
      setToastMessage('Please log in to book tickets.');
      setToastVariant('danger');
      setShowToast(true);
      navigate('/login');
      return;
    }

    const ticketType = event.ticketTypes.find(ticket => 
      ticket._id === selectedTicketType || ticket.id === selectedTicketType
    );
    if (!ticketType) {
      setToastMessage('Invalid ticket type selected.');
      setToastVariant('danger');
      setShowToast(true);
      return;
    }

    try {
      const bookingData = {
        user: user.id,
        event: event.id,
        tickets: [
          {
            ticketType: ticketType.type,
            quantity: quantity,
            price: ticketType.price
          }
        ],
        totalAmount: calculateTotal(),
        paymentMethod: 'credit_card',
        attendeeInformation: {
          name: user.name || 'Guest',
          email: user.email || 'guest@example.com',
          phone: user.phone || ''
        }
      };

      const response = await api.post('/bookings', bookingData);
      if (response.data.success) {
        setToastMessage('Booking created successfully!');
        setToastVariant('success');
        setShowToast(true);

        const cartItem = {
          eventId: event.id,
          ticketTypeId: selectedTicketType,
          title: event.title,
          image: event.image,
          location: event.location,
          date: event.date,
          ticketType: ticketType.type,
          price: ticketType.price,
          quantity
        };
        addToCart(cartItem);

        setQuantity(1);
        setSelectedTicketType(event.ticketTypes[0]._id || event.ticketTypes[0].id || '');
      } else {
        setToastMessage('Failed to create booking: ' + (response.data.message || 'Unknown error'));
        setToastVariant('danger');
        setShowToast(true);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data.message || error.message}`
        : 'Network error: Please check if the backend server is running.';
      setToastMessage(errorMessage);
      setToastVariant('danger');
      setShowToast(true);
      console.error('Error creating booking:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (error) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger" className="mx-auto" style={{ maxWidth: '600px' }}>
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            className="mt-3"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
        </Alert>
      </div>
    );
  }

  if (isLoading || !event) {
    return <LoadingSpinner />;
  }

  return (
    <div className="event-details-page animate-fade-in">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header>
            <strong className="me-auto">{toastVariant === 'success' ? 'Booking Success' : 'Booking Error'}</strong>
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
                    onClick={() => navigate('/profile')}
                  >
                    View Bookings
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

      <section 
        className="event-banner position-relative" 
        style={{ 
          backgroundImage: `url(${event.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '50vh',
          position: 'relative'
        }}
      >
        <div className="overlay position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
        <Container className="h-100">
          <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center">
            <div className="animate-fade-in animate-slide-up text-white px-4 px-md-0">
              <Badge 
                bg={event.category === 'Concert' ? 'danger' : event.category === 'Sports' ? 'success' : 'primary'} 
                className="mb-2"
              >
                {event.category}
              </Badge>
              <h1 className="display-4 fw-bold mb-3">{event.title}</h1>
              <p className="lead mb-4">{event.description.substring(0, 120)}...</p>
              <div className="d-flex flex-wrap mb-3">
                <div className="me-4 mb-2 d-flex align-items-center">
                  <FaCalendarAlt className="me-2" />
                  <span>{event.date}</span>
                </div>
                <div className="me-4 mb-2 d-flex align-items-center">
                  <FaClock className="me-2" />
                  <span>{event.time}</span>
                </div>
                <div className="mb-2 d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="d-flex flex-wrap align-items-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="me-3 mb-2"
                  href="#booking"
                >
                  Get Tickets
                </Button>
                <Button 
                  variant={isFavorite ? 'danger' : 'outline-light'} 
                  className="me-3 mb-2"
                  onClick={toggleFavorite}
                >
                  {isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  variant="outline-light" 
                  className="mb-2"
                  onClick={() => {
                    navigator.share({
                      title: event.title,
                      text: event.description,
                      url: window.location.href
                    }).catch(err => console.log('Error sharing', err));
                  }}
                >
                  <FaShare className="me-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-100 rounded mb-4" 
                    style={{ height: '300px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea';
                    }}
                  />
                  <Tabs defaultActiveKey="details" className="mb-4">
                    <Tab eventKey="details" title="Event Details">
                      <div className="event-description mb-4">
                        <h4 className="mb-3">About This Event</h4>
                        <div dangerouslySetInnerHTML={{ __html: event.longDescription || `<p>${event.description}</p>` }} />
                      </div>
                    </Tab>
                    <Tab eventKey="location" title="Location">
                      <div className="venue-info mb-4">
                        <h4 className="mb-3">Venue Information</h4>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <h5>{event.location}</h5>
                            <p className="mb-2">{event.address}</p>
                            <div className="mb-3">
                              <a 
                                href={`https://maps.google.com/?q=${encodeURIComponent(event.address || event.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                              >
                                View on Google Maps
                              </a>
                            </div>
                            <div className="venue-map ratio ratio-16x9 rounded overflow-hidden">
                              <img 
                                src="https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap" 
                                alt="Venue Map" 
                                className="w-100"
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </Tab>
                    <Tab eventKey="speakers" title="Speakers">
                      <div className="speakers-list mb-4">
                        <h4 className="mb-3">Event Speakers</h4>
                        {event.speakers && event.speakers.length > 0 ? (
                          <ListGroup variant="flush">
                            {event.speakers.map(speaker => (
                              <ListGroup.Item key={speaker._id} className="border-0 px-0 py-3">
                                <div className="d-flex align-items-start">
                                  <div className="flex-shrink-0 me-3">
                                    <img 
                                      src={speaker.profileImage || 'https://via.placeholder.com/100'} 
                                      alt={speaker.name || 'Speaker'} 
                                      className="rounded-circle"
                                      width="70"
                                      height="70"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  </div>
                                  <div>
                                    <h5 className="mb-1">{speaker.name || 'Unknown Speaker'}</h5>
                                    <p className="text-muted mb-1">
                                      {speaker.position || 'N/A'} at {speaker.company || 'N/A'}
                                    </p>
                                    <p className="mb-2">{speaker.bio || 'No bio available'}</p>
                                    {speaker.expertise && speaker.expertise.length > 0 && (
                                      <div className="mb-2">
                                        <strong>Expertise: </strong>
                                        {speaker.expertise.map((exp, index) => (
                                          <Badge key={index} bg="secondary" className="me-1">
                                            {exp}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <Alert variant="info">
                            Speaker information will be announced soon.
                          </Alert>
                        )}
                      </div>
                    </Tab>
                    <Tab eventKey="faq" title="FAQ">
                      <div className="faq-section mb-4">
                        <h4 className="mb-3">Frequently Asked Questions</h4>
                        <Accordion defaultActiveKey="0" className="mb-3">
                          {event.faqs && event.faqs.map((faq, index) => (
                            <Accordion.Item key={faq.id || index} eventKey={index.toString()}>
                              <Accordion.Header>{faq.question}</Accordion.Header>
                              <Accordion.Body>
                                {faq.answer}
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm" id="booking">
                <Card.Body>
                  <h5 className="mb-3">Book Tickets</h5>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="text-primary mb-0">${event.price.toFixed(2)}</h5>
                    </div>
                    <Badge bg="success">{event.ticketsAvailable} tickets left</Badge>
                  </div>
                  <Form onSubmit={handleAddToCart}>
                    {event.ticketTypes && event.ticketTypes.length > 0 ? (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Ticket Type</Form.Label>
                          <Form.Select 
                            value={selectedTicketType}
                            onChange={(e) => setSelectedTicketType(e.target.value)}
                            required
                          >
                            {event.ticketTypes.map((ticket, index) => (
                              <option key={ticket._id || index} value={ticket._id || index}>
                                {ticket.type} - ${ticket.price.toFixed(2)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <ProgressBar 
                          variant="warning" 
                          now={100 - (event.ticketTypes.find((t, index) => (t._id === selectedTicketType || index === parseInt(selectedTicketType))?.available / 200 * 100) || 0)} 
                          style={{ height: '8px' }}
                        />
                      </>
                    ) : (
                      <Alert variant="warning">No ticket types available.</Alert>
                    )}
                    <Form.Group className="mb-4">
                      <Form.Label>Quantity</Form.Label>
                      <div className="d-flex">
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Form.Control 
                          type="number" 
                          min="1" 
                          max="10"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="text-center mx-2"
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span>Total:</span>
                      <h4 className="text-primary mb-0">${calculateTotal().toFixed(2)}</h4>
                    </div>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={!selectedTicketType || !event.ticketTypes.length}
                    >
                      <FaShoppingCart className="me-2" />
                      Book Now
                    </Button>
                    <p className="small text-muted mb-0">
                      <FaLock className="me-1" size={12} />
                      Secure checkout powered by Stripe
                    </p>
                  </Form>
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm mt-4">
                <Card.Body>
                  <h5 className="mb-3">Event Details</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex px-0 py-2 border-0">
                      <div className="me-3 text-primary">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <div className="fw-bold">Date and Time</div>
                        <div>{event.date} at {event.time}</div>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex px-0 py-2 border-0">
                      <div className="me-3 text-primary">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <div className="fw-bold">Location</div>
                        <div>{event.location}</div>
                        <div>{event.address}</div>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex px-0 py-2 border-0">
                      <div className="me-3 text-primary">
                        <FaRegClock />
                      </div>
                      <div>
                        <div className="fw-bold">Duration</div>
                        <div>
                          {event.startDate && event.endDate ? (
                            Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)) + ' hours'
                          ) : (
                            'TBD'
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {relatedEvents.length > 0 && (
        <section className="py-5 bg-light">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>You May Also Like</h2>
              <Link to="/events" className="text-decoration-none d-flex align-items-center">
                View All Events <FaChevronRight className="ms-1" size={12} />
              </Link>
            </div>
            <div className="animate-fade-in">
              <Row>
                {relatedEvents.map(relatedEvent => (
                  <Col md={4} className="mb-4" key={relatedEvent.id}>
                    <div className="animate-slide-up">
                      <Card 
                        className="h-100 border-0 shadow-sm hover-scale" 
                        onClick={() => navigate(`/event/${relatedEvent.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Img variant="top" src={relatedEvent.image} height="200" style={{ objectFit: 'cover' }} />
                        <Card.Body>
                          <div className="mb-2">
                            <Badge 
                              bg={relatedEvent.category === 'Concert' ? 'danger' : relatedEvent.category === 'Sports' ? 'success' : 'primary'} 
                              className="me-2"
                            >
                              {relatedEvent.category}
                            </Badge>
                            <small className="text-muted">{relatedEvent.date}</small>
                          </div>
                          <Card.Title>{relatedEvent.title}</Card.Title>
                          <div className="d-flex align-items-center text-muted mb-2">
                            <FaMapMarkerAlt className="me-2" size={14} />
                            <small>{relatedEvent.location}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="fw-bold text-primary">${relatedEvent.price.toFixed(2)}</span>
                            <Button variant="outline-primary" size="sm">View Details</Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Container>
        </section>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default EventDetails;