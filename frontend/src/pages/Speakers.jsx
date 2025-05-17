import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaUser, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Tooltip, Space } from 'antd';
import api from '../utils/api';

// Lazy loaded components
const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

// Backend base URL
const BASE_URL = 'http://localhost:9881';

// Speaker API
const speakerAPI = {
  getSpeakers: async () => {
    const response = await api.get('/speakers');
    return response.data;
  },
  getSpeaker: async (id) => {
    const response = await api.get(`/speakers/${id}`);
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

const Speakers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [speakers, setSpeakers] = useState([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [topicTags, setTopicTags] = useState([]);

  // Fetch speakers data
  useEffect(() => {
    const fetchSpeakers = async () => {
      setIsLoading(true);
      try {
        const response = await speakerAPI.getSpeakers();
        if (response.success) {
          const speakersData = response.data.map(speaker => {
            const speakerData = {
              id: speaker._id,
              name: speaker.name,
              title: speaker.position || 'Speaker',
              organization: speaker.company || 'N/A',
              bio: speaker.bio,
              image: speaker.profileImage.startsWith('default') 
                ? '/images/default-speaker.jpg' 
                : `${BASE_URL}${speaker.profileImage}`,
              topics: speaker.expertise || [],
              featured: speaker.featured || false,
              events: speaker.events || [],
              social: {
                linkedin: speaker.socialMedia?.linkedin || '',
                twitter: speaker.socialMedia?.twitter || '',
                facebook: speaker.socialMedia?.facebook || '',
                instagram: speaker.socialMedia?.instagram || ''
              }
            };
            console.log('Speaker social media:', speakerData.social);
            return speakerData;
          });
          setSpeakers(speakersData);
          setFilteredSpeakers(speakersData);
          const allTopics = new Set();
          speakersData.forEach(speaker => {
            speaker.topics.forEach(topic => allTopics.add(topic));
          });
          setTopicTags(Array.from(allTopics));
          setIsLoading(false);
        } else {
          setError(response.message || 'Failed to load speakers');
          setIsLoading(false);
        }
      } catch (error) {
        setError('Failed to load speakers. Please try again later.');
        setIsLoading(false);
        console.error('Error loading speakers:', error);
      }
    };
    fetchSpeakers();
  }, []);

  // Filter speakers
  useEffect(() => {
    if (speakers.length === 0) return;
    let results = [...speakers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(speaker => 
        speaker.name.toLowerCase().includes(term) || 
        speaker.organization.toLowerCase().includes(term) || 
        speaker.bio.toLowerCase().includes(term) ||
        speaker.topics.some(topic => topic.toLowerCase().includes(term))
      );
    }
    if (selectedTopics.length > 0) {
      results = results.filter(speaker => 
        speaker.topics.some(topic => selectedTopics.includes(topic))
      );
    }
    if (showFeaturedOnly) {
      results = results.filter(speaker => speaker.featured);
    }
    setFilteredSpeakers(results);
  }, [searchTerm, selectedTopics, showFeaturedOnly, speakers]);

  const handleTopicSelect = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTopics([]);
    setShowFeaturedOnly(false);
  };

  const renderSocialLink = (platform, url) => {
    if (!url) return null;
    const icons = {
      linkedin: <FaLinkedin size={18} style={{ color: '#0A66C2' }} />,
      twitter: <FaTwitter size={18} style={{ color: '#1DA1F2' }} />,
      facebook: <FaFacebook size={18} style={{ color: '#1877F2' }} />,
      instagram: <FaInstagram size={18} style={{ color: '#E4405F' }} />
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
    <motion.div 
      className="speakers-page"
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
              <h1 className="display-4 fw-bold mb-3">Industry-Leading Speakers</h1>
              <p className="lead mb-4">
                Discover thought leaders, innovators, and experts across various fields who share
                their knowledge and insights at our events.
              </p>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-center">
                <FaMicrophone size={100} className="opacity-75" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={8}>
              <InputGroup className="mb-3">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search speakers by name, organization, or expertise..."
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
                  label="Featured Speakers Only"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="me-3"
                />
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={resetFilters}
                  disabled={!searchTerm && selectedTopics.length === 0 && !showFeaturedOnly}
                >
                  Reset All Filters
                </Button>
              </div>
            </Col>
          </Row>

          <div className="topic-filters mb-4">
            <h6 className="mb-2">Filter by Expertise:</h6>
            <div className="d-flex flex-wrap gap-2">
              {topicTags.map((topic, index) => (
                <Badge 
                  key={index}
                  bg={selectedTopics.includes(topic) ? "primary" : "light"}
                  text={selectedTopics.includes(topic) ? "white" : "dark"}
                  className="py-2 px-3 cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTopicSelect(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <p className="mb-0">
              {isLoading ? 'Loading speakers...' : `Showing ${filteredSpeakers.length} speakers`}
            </p>
            <Form.Select style={{ width: 'auto' }}>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: Name (Z-A)</option>
              <option>Sort by: Organization</option>
              <option>Sort by: Featured</option>
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
          ) : filteredSpeakers.length === 0 ? (
            <div className="text-center py-5">
              <FaUser size={50} className="text-muted mb-3" />
              <h3>No speakers found</h3>
              <p className="text-muted">Try adjusting your filters or search criteria</p>
              <Button variant="primary" onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Row>
                {filteredSpeakers.map(speaker => (
                  <Col lg={4} md={6} className="mb-4" key={speaker.id}>
                    <motion.div variants={itemVariants}>
                      <Card className="h-100 border-0 shadow-sm hover-scale speaker-card">
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={speaker.image} 
                            alt={speaker.name}
                            style={{ height: '300px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/images/default-speaker.jpg'; }}
                          />
                          {speaker.featured && (
                            <Badge 
                              bg="warning" 
                              className="position-absolute top-0 end-0 m-3 px-3 py-2"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                        <Card.Body>
                          <Card.Title as="h4" className="mb-1">{speaker.name}</Card.Title>
                          <p className="text-muted mb-3">
                            {speaker.title}-Way Speaker System at {speaker.organization}
                          </p>
                          <div className="mb-3">
                            {speaker.topics.slice(0, 3).map((topic, index) => (
                              <Badge 
                                key={index}
                                bg="light"
                                text="dark"
                                className="me-2 mb-2 py-2 px-3"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <Card.Text className="text-muted">
                            {speaker.bio.substring(0, 120)}...
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <Space>
                              {renderSocialLink('linkedin', speaker.social.linkedin)}
                              {renderSocialLink('twitter', speaker.social.twitter)}
                              {renderSocialLink('facebook', speaker.social.facebook)}
                              {renderSocialLink('instagram', speaker.social.instagram)}
                            </Space>
                            <Link to={`/speaker/${speaker.id}`} className="btn btn-outline-primary">
                              View Profile
                            </Link>
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

      <section className="py-5 bg-light">
        <Container>
          <h2 className="mb-4">Looking for Events?</h2>
          <p className="lead mb-4">
            Explore our upcoming events to see these speakers in action and book your tickets today.
          </p>
          <div className="d-flex justify-content-center">
            <Button 
              as={Link} 
              to="/events" 
              variant="primary" 
              size="lg" 
              className="me-3"
            >
              Browse Events
            </Button>
            <Button 
              as={Link} 
              to="/calendar" 
              variant="outline-primary" 
              size="lg"
            >
              View Calendar
            </Button>
          </div>
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
        .speaker-card a:hover {
          opacity: 0.8;
        }
      `}</style>
    </motion.div>
  );
};

export default Speakers;