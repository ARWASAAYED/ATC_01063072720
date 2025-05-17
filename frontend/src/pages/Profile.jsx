import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav, ListGroup, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaTicketAlt, FaHistory, FaUserEdit, FaCalendar, FaMapMarkerAlt, FaSync, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserProfile, loading: authLoading, error: authError } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch bookings
  const fetchBookings = async () => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const response = await api.get('/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
        console.log('Bookings:', response.data.data);
      } else {
        setBookingError('Failed to load bookings: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data.message || error.message}`
        : 'Network error: Please check if the backend server is running on http://localhost:9881';
      setBookingError(errorMessage);
      console.error('Error fetching bookings:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: 'http://localhost:9881/api/bookings'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Fetch payment details
  const fetchPaymentDetails = async (bookingId) => {
    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentDetails(null);
    try {
      const response = await api.get(`/payments/${bookingId}`);
      if (response.data.success) {
        setPaymentDetails(response.data.data);
        setShowPaymentModal(true);
      } else {
        setPaymentError('Failed to load payment details: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data.message || error.message}`
        : 'Network error: Please check if the backend server is running';
      setPaymentError(errorMessage);
      console.error('Error fetching payment details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `http://localhost:9881/api/payments/${bookingId}`
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
    }
  }, [isAuthenticated, user]);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }
      
      await updateUserProfile(updateData);
      setSuccessMessage('Profile updated successfully!');
      
      setFormData(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentDetails(null);
  };

  if (authLoading || !user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Payment Details Modal */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentLoading ? (
            <div className="text-center">
              <Spinner animation="border" role="status" variant="primary" />
              <p>Loading payment details...</p>
            </div>
          ) : paymentError ? (
            <Alert variant="danger">{paymentError}</Alert>
          ) : paymentDetails ? (
            <div>
              <p><strong>Booking Status:</strong> {paymentDetails.bookingStatus}</p>
              <p><strong>Payment Status:</strong> {paymentDetails.paymentStatus}</p>
              {paymentDetails.paymentDetails && (
                <>
                  <p><strong>Payment ID:</strong> {paymentDetails.paymentDetails.id}</p>
                  <p><strong>Amount:</strong> ${(paymentDetails.paymentDetails.amount / 100).toFixed(2)} {paymentDetails.paymentDetails.currency.toUpperCase()}</p>
                  <p><strong>Status:</strong> {paymentDetails.paymentDetails.status}</p>
                  <p><strong>Last 4 Digits:</strong> {paymentDetails.paymentDetails.payment_method_details?.card?.last4 || 'N/A'}</p>
                  <p><strong>Payment Date:</strong> {new Date(paymentDetails.paymentDetails.created * 1000).toLocaleString()}</p>
                </>
              )}
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePaymentModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col lg={3} md={4} className="mb-4 mb-md-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                  <FaUser size={40} color="#6c757d" />
                </div>
                <h5 className="mb-1">{user.name}</h5>
                <p className="text-muted small mb-0">{user.email}</p>
              </div>
              
              <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="mb-2">
                    <FaUserEdit className="me-2" /> Edit Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tickets" className="mb-2">
                    <FaTicketAlt className="me-2" /> My Tickets
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">
                    <FaHistory className="me-2" /> Booking History
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9} md={8}>
          <Tab.Content>
            <Tab.Pane eventKey="profile" active={activeTab === 'profile'}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-4">Edit Profile</h4>
                  
                  {authError && (
                    <Alert variant="danger" className="mb-4">
                      {authError}
                    </Alert>
                  )}
                  
                  {successMessage && (
                    <Alert variant="success" className="mb-4">
                      {successMessage}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaUser />
                        </span>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          isInvalid={!!formErrors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.name}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          isInvalid={!!formErrors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.email}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <hr className="my-4" />
                    <h5 className="mb-3">Change Password</h5>
                    <p className="text-muted small mb-3">Leave these fields empty if you don't want to change your password</p>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter your current password"
                          isInvalid={!!formErrors.currentPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.currentPassword}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            isInvalid={!!formErrors.newPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.newPassword}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Password must be at least 6 characters
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            isInvalid={!!formErrors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-grid mt-4">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={authLoading}
                      >
                        {authLoading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="tickets" active={activeTab === 'tickets'}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">My Tickets</h4>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={fetchBookings}
                      disabled={bookingLoading}
                    >
                      <FaSync className="me-2" />
                      {bookingLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                  
                  {bookingError && (
                    <Alert variant="danger" className="mb-4">
                      {bookingError}
                      <Button
                        variant="link"
                        className="p-0 ms-2"
                        onClick={fetchBookings}
                      >
                        Retry
                      </Button>
                    </Alert>
                  )}
                  
                  {bookingLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-3">Loading bookings...</p>
                    </div>
                  ) : bookings.length > 0 ? (
                    <ListGroup variant="flush">
                      {bookings.map(booking => (
                        <ListGroup.Item key={booking._id} className="px-0 py-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">
                                {booking.event ? (
                                  <Link to={`/event/${booking.event._id}`}>
                                    {booking.event.title}
                                  </Link>
                                ) : (
                                  <span className="text-muted">Event Unavailable</span>
                                )}
                              </h6>
                              <p className="text-muted mb-0 small">
                                {booking.event ? (
                                  <>
                                    <span className="me-2">
                                      <FaCalendar className="me-1" />
                                      {new Date(booking.event.startDate).toLocaleDateString()}
                                    </span>
                                    <span className="me-2">•</span>
                                    <span>
                                      <FaMapMarkerAlt className="me-1" />
                                      {booking.event.venue ? (
                                        <Link 
                                          to={`/venue/${booking.event.venue?._id || ''}`}
                                          onClick={() => console.log('Navigating to venue:', booking.event.venue?._id, booking.event.venue?.name)}
                                        >
                                          {booking.event.venue.name || 'Unknown Venue'}, {booking.event.venue.city || ''}
                                        </Link>
                                      ) : (
                                        'Unknown Venue'
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <span>Details unavailable</span>
                                )}
                                <span className="me-2">•</span>
                                <span>
                                  Tickets: {booking.tickets.map(t => `${t.quantity} ${t.ticketType}`).join(', ')}
                                </span>
                                <span className="me-2">•</span>
                                <span>
                                  Payment: <span className={`badge bg-${booking.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                                    {booking.paymentStatus}
                                  </span>
                                </span>
                              </p>
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => console.log('View ticket:', booking._id, booking.bookingReference)}
                                disabled={!booking.event}
                              >
                                View Ticket
                              </Button>
                              {booking.paymentId && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => fetchPaymentDetails(booking._id)}
                                  disabled={paymentLoading}
                                >
                                  <FaCreditCard className="me-1" />
                                  Payment Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <FaTicketAlt size={40} className="text-muted mb-3" />
                      <h5>No Tickets Found</h5>
                      <p className="text-muted">You haven't purchased any tickets yet.</p>
                      <Button variant="primary" onClick={() => navigate('/events')}>
                        Browse Events
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="history" active={activeTab === 'history'}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Booking History</h4>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={fetchBookings}
                      disabled={bookingLoading}
                    >
                      <FaSync className="me-2" />
                      {bookingLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                  
                  {bookingError && (
                    <Alert variant="danger" className="mb-4">
                      {bookingError}
                      <Button
                        variant="link"
                        className="p-0 ms-2"
                        onClick={fetchBookings}
                      >
                        Retry
                      </Button>
                    </Alert>
                  )}
                  
                  {bookingLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-3">Loading bookings...</p>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Booking ID</th>
                            <th>Event</th>
                            <th>Venue</th>
                            <th>Date</th>
                            <th>Tickets</th>
                            <th>Total</th>
                            <th>Booking Status</th>
                            <th>Payment Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map(booking => (
                            <tr key={booking._id}>
                              <td>{booking.bookingReference}</td>
                              <td>
                                {booking.event ? (
                                  <Link to={`/event/${booking.event._id}`}>
                                    {booking.event.title}
                                  </Link>
                                ) : (
                                  <span className="text-muted">Event Unavailable</span>
                                )}
                              </td>
                              <td>
                                {booking.event && booking.event.venue ? (
                                  <Link 
                                    to={`/venue/${booking.event.venue._id || ''}`}
                                    onClick={() => console.log('Navigating to venue:', booking.event.venue?._id, booking.event.venue?.name)}
                                  >
                                    {booking.event.venue.name || 'Unknown Venue'}
                                  </Link>
                                ) : (
                                  'Unknown Venue'
                                )}
                              </td>
                              <td>
                                {booking.event ? (
                                  new Date(booking.event.startDate).toLocaleDateString()
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td>{booking.tickets.map(t => `${t.quantity} ${t.ticketType}`).join(', ')}</td>
                              <td>${booking.totalAmount.toFixed(2)}</td>
                              <td>
                                <span className={`badge bg-${booking.bookingStatus === 'confirmed' ? 'success' : booking.bookingStatus === 'cancelled' ? 'danger' : 'warning'}`}>
                                  {booking.bookingStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`badge bg-${booking.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                                  {booking.paymentStatus}
                                </span>
                              </td>
                              <td>
                                {booking.paymentId && (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => fetchPaymentDetails(booking._id)}
                                    disabled={paymentLoading}
                                  >
                                    <FaCreditCard className="me-1" />
                                    Payment Details
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaHistory size={40} className="text-muted mb-3" />
                      <h5>No Booking History</h5>
                      <p className="text-muted">You haven't made any bookings yet.</p>
                      <Button variant="primary" onClick={() => navigate('/events')}>
                        Browse Events
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;