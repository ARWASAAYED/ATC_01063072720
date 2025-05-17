
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Tooltip, Space } from 'antd';
import api from '../utils/api';

// Backend base URL
const BASE_URL = 'http://localhost:9881';

const SpeakerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpeaker = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/speakers/${id}`);
        if (response.data.success) {
          const speakerData = response.data.data;
          const mappedSpeaker = {
            id: speakerData._id,
            name: speakerData.name,
            title: speakerData.position || 'Speaker',
            organization: speakerData.company || 'N/A',
            bio: speakerData.bio,
            image: speakerData.profileImage.startsWith('default')
              ? '/images/default-speaker.jpg'
              : `${BASE_URL}${speakerData.profileImage}`,
            topics: speakerData.expertise || [],
            events: speakerData.events || [],
            social: {
              linkedin: speakerData.socialMedia?.linkedin || '',
              twitter: speakerData.socialMedia?.twitter || '',
              facebook: speakerData.socialMedia?.facebook || '',
              instagram: speakerData.socialMedia?.instagram || ''
            }
          };
          console.log('Speaker social media:', mappedSpeaker.social);
          setSpeaker(mappedSpeaker);
        } else {
          setError(response.data.message || 'Failed to load speaker');
        }
      } catch (error) {
        setError('Failed to load speaker. Please try again later.');
        console.error('Error loading speaker:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpeaker();
  }, [id]);

  const renderSocialLink = (platform, url) => {
    if (!url) return null;
    const icons = {
      linkedin: <FaLinkedin size={20} style={{ color: '#0A66C2' }} />,
      twitter: <FaTwitter size={20} style={{ color: '#1DA1F2' }} />,
      facebook: <FaFacebook size={20} style={{ color: '#1877F2' }} />,
      instagram: <FaInstagram size={20} style={{ color: '#E4405F' }} />
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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/speakers')}>
          Back to Speakers
        </Button>
      </Container>
    );
  }

  if (!speaker) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Speaker not found</Alert>
        <Button variant="primary" onClick={() => navigate('/speakers')}>
          Back to Speakers
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
      className="speaker-details-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        <Row>
          <Col md={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Img
                src={speaker.image}
                altosasdasdasd={speaker.name}
                style={{ height: '300px', objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/images/default-speaker.jpg'; }}
              />
              <Card.Body>
                <Card.Title as="h4">{speaker.name}</Card.Title>
                <Card.Text className="text-muted">
                  {speaker.title} at {speaker.organization}
                </Card.Text>
                <Space>
                  {renderSocialLink('linkedin', speaker.social.linkedin)}
                  {renderSocialLink('twitter', speaker.social.twitter)}
                  {renderSocialLink('facebook', speaker.social.facebook)}
                  {renderSocialLink('instagram', speaker.social.instagram)}
                </Space>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5>Biography</h5>
                <p>{speaker.bio}</p>
                <h5>Expertise</h5>
                <div className="mb-3">
                  {speaker.topics.map((topic, index) => (
                    <Badge key={index} bg="secondary" className="me-1 mb-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <h5>Events</h5>
                {speaker.events.length > 0 ? (
                  <ul>
                    {speaker.events.map(event => (
                      <li key={event._id}>
                        <Link to={`/event/${event._id}`}>{event.title}</Link> -{' '}
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming events</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Button variant="primary" onClick={() => navigate('/speakers')}>
          Back to Speakers
        </Button>
      </Container>
    </motion.div>
  );
};

export default SpeakerDetails;