import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaUsers, FaBuilding, FaWifi, FaAccessibleIcon, FaParking } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Lazy loaded components
const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

// Backend base URL
const BACKEND_URL = 'http://localhost:9881';

// Venue API
const venueAPI = {
  getVenues: async () => {
    const response = await api.get('/venues');
    return response.data;
  },
  getVenue: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  }
};

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

// City options for filtering
const cityOptions = ["All Cities", "Cape Town", "Johannesburg", "Durban", "Pretoria", "New York", "San Francisco", "Chicago"];

// Capacity ranges for filtering
const capacityRanges = [
  { label: "Any Capacity", value: "any" },
  { label: "< 500 guests", value: "small" },
  { label: "500-1000 guests", value: "medium" },
  { label: "> 1000 guests", value: "large" }
];

const Venues = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCapacity, setSelectedCapacity] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // Common amenities for filtering
  const amenities = ["WiFi", "AV Equipment", "Catering", "Accessible", "Parking", "Air Conditioning", "Outdoor Space"];

  // Fetch venues data
  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      try {
        const response = await venueAPI.getVenues();
        if (response.success) {
          const venuesData = response.data.map(venue => ({
            id: venue._id,
            name: venue.name,
            address: `${venue.address}, ${venue.city}, ${venue.country}`,
            city: venue.city,
            description: venue.description,
            image: venue.image.startsWith('default') 
              ? '/images/default-venue.jpg' 
              : `${BACKEND_URL}${venue.image}`,
            capacity: venue.capacity,
            amenities: venue.amenities || [],
            featured: venue.featured || false,
            contactInfo: {
              phone: venue.contactPhone || '',
              email: venue.contactEmail || ''
            }
          }));
          console.log('Venues Data:', venuesData);
          setVenues(venuesData);
          setFilteredVenues(venuesData);
          // Update city options dynamically
          const uniqueCities = ['All Cities', ...new Set(venuesData.map(v => v.city))];
          cityOptions.splice(0, cityOptions.length, ...uniqueCities);
          setIsLoading(false);
        } else {
          setError(response.message || 'Failed to load venues');
          setIsLoading(false);
        }
      } catch (error) {
        setError('Failed to load venues. Please try again later.');
        setIsLoading(false);
        console.error('Error loading venues:', error);
      }
    };
    fetchVenues();
  }, []);

  // Filter venues
  useEffect(() => {
    if (venues.length === 0) return;
    let results = [...venues];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(venue => 
        venue.name.toLowerCase().includes(term) || 
        venue.description.toLowerCase().includes(term) || 
        venue.address.toLowerCase().includes(term)
      );
    }
    if (selectedCity !== 'All Cities') {
      results = results.filter(venue => venue.city === selectedCity);
    }
    if (selectedCapacity !== 'any') {
      switch (selectedCapacity) {
        case 'small':
          results = results.filter(venue => venue.capacity < 500);
          break;
        case 'medium':
          results = results.filter(venue => venue.capacity >= 500 && venue.capacity <= 1000);
          break;
        case 'large':
          results = results.filter(venue => venue.capacity > 1000);
          break;
        default:
          break;
      }
    }
    if (selectedAmenities.length > 0) {
      results = results.filter(venue => 
        selectedAmenities.every(amenity => venue.amenities.includes(amenity))
      );
    }
    if (showFeaturedOnly) {
      results = results.filter(venue => venue.featured);
    }
    console.log('Filtered Venues:', results);
    setFilteredVenues(results);
  }, [searchTerm, selectedCity, selectedCapacity, selectedAmenities, showFeaturedOnly, venues]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCity('All Cities');
    setSelectedCapacity('any');
    setSelectedAmenities([]);
    setShowFeaturedOnly(false);
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'WiFi': return <FaWifi />;
      case 'Accessible': return <FaAccessibleIcon />;
      case 'Parking': return <FaParking />;
      default: return null;
    }
  };

  // Handle image load error
  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.style.backgroundImage = `url(/uploads/default-venue.jpg)`; 
  };

  return (
    <motion.div 
      className="venues-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>

      <section className="hero-banner py-5 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-3">Find the Perfect Venue</h1>
              <p className="lead mb-4">
                Discover unique and stunning venues for your next event. From conference centers to 
                historic theaters, we have the perfect space for any occasion.
              </p>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-center">
                <FaBuilding size={100} className="opacity-75" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col lg={8}>
              <InputGroup className="mb-3">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search venues by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col lg={4}>
              <div className="d-flex align-items-center mb-3">
                <Form.Check 
                  type="checkbox"
                  id="featured-filter"
                  label="Featured Venues Only"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="me-3"
                />
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={resetFilters}
                  disabled={!searchTerm && selectedCity === 'All Cities' && selectedCapacity === 'any' && selectedAmenities.length === 0 && !showFeaturedOnly}
                >
                  Reset All Filters
                </Button>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>City</Form.Label>
                <Form.Select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {cityOptions.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Capacity</Form.Label>
                <Form.Select 
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                >
                  {capacityRanges.map((range, index) => (
                    <option key={index} value={range.value}>{range.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="amenities-filter mb-4">
            <h6 className="mb-2">Amenities:</h6>
            <div className="d-flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <Badge 
                  key={index}
                  bg={selectedAmenities.includes(amenity) ? "primary" : "light"}
                  text={selectedAmenities.includes(amenity) ? "white" : "dark"}
                  className="py-2 px-3 d-flex align-items-center gap-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {getAmenityIcon(amenity)} {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <p className="mb-0">
              {isLoading ? 'Loading venues...' : `Showing ${filteredVenues.length} venues`}
            </p>
            <Form.Select style={{ width: 'auto' }}>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: Capacity (High to Low)</option>
              <option>Sort by: Capacity (Low to High)</option>
            </Form.Select>
          </div>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-5">
              <FaBuilding size={50} className="text-muted mb-3" />
              <h3>No venues found</h3>
              <p className="text-muted">Try adjusting your filters or search criteria</p>
              <Button variant="primary" onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Row>
                {filteredVenues.map(venue => (
                  <Col lg={6} className="mb-4" key={venue.id}>
                    <motion.div variants={itemVariants}>
                      <Card className="h-100 border-0 shadow-sm hover-scale venue-card">
                        <Row className="g-0">
                          <Col md={5}>
                            <div 
                              className="venue-image h-100" 
                              style={{ 
                                backgroundImage: `url(${venue.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderTopLeftRadius: '.25rem',
                                borderBottomLeftRadius: '.25rem'
                              }}
                            >
                              <img 
                                src={venue.image} 
                                alt={venue.name}
                                style={{ display: 'none' }} // Hidden img for error handling
                                onError={handleImageError}
                              />
                              {venue.featured && (
                                <Badge 
                                  bg="warning" 
                                  className="position-absolute top-0 start-0 m-3 px-3 py-2"
                                >
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </Col>
                          <Col md={7}>
                            <Card.Body className="d-flex flex-column h-100">
                              <div className="mb-auto">
                                <Card.Title as="h4">{venue.name}</Card.Title>
                                <div className="d-flex align-items-center mb-3">
                                  <FaMapMarkerAlt className="text-secondary me-2" />
                                  <small className="text-muted">{venue.city}</small>
                                  <div className="ms-3 d-flex align-items-center">
                                    <FaUsers className="text-secondary me-2" />
                                    <small className="text-muted">Up to {venue.capacity}</small>
                                  </div>
                                </div>
                                <Card.Text className="small text-muted mb-3">
                                  {venue.description.substring(0, 100)}...
                                </Card.Text>
                                <div className="amenities mb-3">
                                  <div className="d-flex flex-wrap gap-2">
                                    {venue.amenities.slice(0, 4).map((amenity, index) => (
                                      <Badge 
                                        key={index}
                                        bg="light"
                                        text="dark"
                                        className="small py-1 px-2"
                                      >
                                        {amenity}
                                      </Badge>
                                    ))}
                                    {venue.amenities.length > 4 && (
                                      <Badge 
                                        bg="light" 
                                        text="dark"
                                        className="small py-1 px-2"
                                      >
                                        +{venue.amenities.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-auto">
                                <div className="d-flex justify-content-between align-items-center">
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    className="px-3"
                                    onClick={() => window.location.href = `mailto:${venue.contactInfo.email}`}
                                  >
                                    Contact Venue
                                  </Button>
                                  <Link 
                                    to={`/venue/${venue.id}`} 
                                    className="btn btn-primary btn-sm px-3"
                                    onClick={() => console.log('Navigating to venue:', venue.id, venue.name)}
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          )}
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container className="text-center">
          <h2 className="mb-4">Need help finding the right venue?</h2>
          <p className="lead mb-4">
            Our venue experts can help you find the perfect space for your event based on your specific needs and budget.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => window.location.href = "mailto:venues@eventchamp.co.za"}
          >
            Contact Our Venue Specialists
          </Button>
        </Container>
      </section>

      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>

      <style jsx>{`
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-5px);
        }
        .venue-image {
          min-height: 250px;
        }
        @media (max-width: 767px) {
          .venue-image {
            height: 200px;
            border-top-right-radius: .25rem !important;
            border-bottom-left-radius: 0 !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Venues;