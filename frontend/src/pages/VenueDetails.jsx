import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers, FaWifi, FaAccessibleIcon, FaParking } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';


const Header = React.lazy(() => import('../components/Header'));
const Footer = React.lazy(() => import('../components/Footer'));


const BACKEND_URL = 'http://localhost:9881';

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


const LoadingSpinner = () => (
  <div className="d-flex justify-content-center py-5">
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);


const getAmenityIcon = (amenity) => {
  switch (amenity) {
    case 'WiFi': return <FaWifi />;
    case 'Accessible': return <FaAccessibleIcon />;
    case 'Parking': return <FaParking />;
    default: return <span className="me-1">•</span>;
  }
};

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch venue data
  useEffect(() => {
    const fetchVenue = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching venue with ID:', id);
        const response = await api.get(`/venues/${id}`);
        console.log('API Response:', response.data);
        if (response.data.success) {
          const venueData = response.data.data;
          setVenue({
            id: venueData._id,
            name: venueData.name,
            address: `${venueData.address}, ${venueData.city}, ${venueData.country}`,
            city: venueData.city,
            description: venueData.description,
            image: venueData.image.startsWith('default')
              ? '/images/default-venue.jpg'
              : `${BACKEND_URL}${venueData.image}`,
            capacity: venueData.capacity,
            amenities: venueData.amenities || [],
            contactInfo: {
              phone: venueData.contactPhone || '',
              email: venueData.contactEmail || ''
            },
            featured: venueData.featured || false
          });
        } else {
          setError(response.data.message || 'Failed to load venue');
        }
      } catch (error) {
        setError('Failed to load venue. Please try again later.');
        console.error('Error loading venue:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  // Handle image load error
  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.src = '/uploads/default-venue.jpg'; 
  };

  if (isLoading) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <div className="venue-details-page">
          <Header />
          <LoadingSpinner />
          <Footer />
        </div>
      </React.Suspense>
    );
  }

  if (error) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <div className="venue-details-page">
          <Header />
          <Container className="py-5">
            <Alert variant="danger">{error}</Alert>
            <div className="text-center mt-4">
              <Button as={Link} to="/venues" variant="primary">
                Back to Venues
              </Button>
            </div>
          </Container>
          <Footer />
        </div>
      </React.Suspense>
    );
  }

  if (!venue) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <div className="venue-details-page">
          <Header />
          <Container className="py-5">
            <Alert variant="warning">Venue not found</Alert>
            <div className="text-center mt-4">
              <Button as={Link} to="/venues" variant="primary">
                Back to Venues
              </Button>
            </div>
          </Container>
          <Footer />
        </div>
      </React.Suspense>
    );
  }

  return (
    <motion.div 
      className="venue-details-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <React.Suspense fallback={<LoadingSpinner />}>
        <Header />
      </React.Suspense>

      <section className="venue-banner position-relative">
        <div 
          className="venue-image w-100" 
          style={{ 
            backgroundImage: `url(${venue.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '60vh',
            position: 'relative'
          }}
        >
          <img 
            src={venue.image} 
            alt={venue.name}
            style={{ display: 'none' }} // Hidden img for error handling
            onError={handleImageError}
          />
          <div className="overlay position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
        </div>
        
        <div className="position-absolute bottom-0 w-100">
          <Container className="pb-3">
            <Row className="bg-white shadow rounded-top p-3">
              <Col md={8}>
                <div className="d-flex align-items-center mb-2">
                  {venue.featured && (
                    <Badge bg="warning" className="me-2">Featured</Badge>
                  )}
                </div>
                <h1 className="venue-title mb-2">{venue.name}</h1>
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="text-secondary me-2" />
                  <span className="text-muted">{venue.address}</span>
                </div>
                <div className="venue-stats d-flex flex-wrap">
                  <div className="me-4 mb-2">
                    <div className="d-flex align-items-center">
                      <FaUsers className="text-secondary me-2" />
                      <span>Capacity: <strong>{venue.capacity}</strong></span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={4} className="d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="px-4"
                  onClick={() => window.location.href = `mailto:${venue.contactInfo.email}?subject=Inquiry about ${venue.name}`}
                >
                  Contact Venue
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8}>
              <Tabs defaultActiveKey="about" id="venue-details-tabs" className="mb-4">
                <Tab eventKey="about" title="About">
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                      <h3 className="mb-3">About This Venue</h3>
                      <p>{venue.description}</p>
                      <h4 className="mt-4 mb-3">Amenities</h4>
                      <Row className="g-3">
                        {venue.amenities.map((amenity, index) => (
                          <Col md={4} key={index}>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {getAmenityIcon(amenity)}
                              </div>
                              <span>{amenity}</span>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                <Card.Body>
                  <h4 className="mb-4">Contact Information</h4>
                  <div className="mb-3">
                    {venue.contactInfo.phone && (
                      <div className="d-flex align-items-center mb-2">
                        <FaPhone className="text-primary me-3" />
                        <a 
                          href={`tel:${venue.contactInfo.phone}`} 
                          className="text-decoration-none"
                        >
                          {venue.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {venue.contactInfo.email && (
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="text-primary me-3" />
                        <a 
                          href={`mailto:${venue.contactInfo.email}`}
                          className="text-decoration-none"
                        >
                          {venue.contactInfo.email}
                        </a>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-100 mb-3"
                    onClick={() => window.location.href = `mailto:${venue.contactInfo.email}?subject=Booking Inquiry for ${venue.name}`}
                  >
                    Send Booking Inquiry
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container className="text-center">
          <h2 className="mb-4">Ready to book this venue?</h2>
          <p className="lead mb-4">
            Our venue specialists can help you plan the perfect event at {venue.name}.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => window.location.href = `mailto:${venue.contactInfo.email}?subject=Booking Inquiry for ${venue.name}`}
          >
            Contact for Booking
          </Button>
        </Container>
      </section>

      <React.Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </React.Suspense>

      <style jsx>{`
        .venue-image {
          min-height: 60vh;
        }
        .venue-title {
          font-size: 2.5rem;
          font-weight: bold;
        }
        .sticky-top {
          top: 20px;
        }
      `}</style>
    </motion.div>
  );
};

export default VenueDetails;