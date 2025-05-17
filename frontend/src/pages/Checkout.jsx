import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentService from '../services/PaymentService';

const Header = React.lazy(() => import('../components/Header'));
const Footer = React.lazy(() => import('../components/Footer'));

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, createBooking, resetBookingStatus } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    agreeToTerms: false,
  });

  const subtotal = cart.total || 0;
  const tax = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const amountInCents = Math.round(total * 100);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
    if (cart.items.length === 0) {
      setError('Your cart is empty. Please add tickets.');
      return;
    }
    resetBookingStatus();
  }, [isAuthenticated, cart.items, navigate, resetBookingStatus]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    console.log('Cart at submission:', cart);

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    if (!formData.fullName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setError('Please enter a valid email address');
      return;
    }

    const validEventId = '6824db2d9c45fc1937860cca';
    if (cart.items.length === 0) {
      setError('Your cart is empty. Please add tickets.');
      return;
    }
    if (!cart.items.every(item => 
      item.eventId === validEventId && 
      item.ticketTypeId && 
      item.ticketType === 'General' && 
      item.price === 99.99 && 
      item.quantity > 0
    )) {
      setError('Invalid cart items detected. Please remove invalid tickets or add tickets for the correct event.');
      return;
    }

    const expectedTotal = Number(cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    if (Math.abs(expectedTotal - cart.total) > 0.01) {
      setError('Cart total mismatch. Clearing cart. Please add tickets again.');
      clearCart();
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('Creating booking with cart:', cart, 'formData:', formData);
      const bookingResponse = await createBooking(
        'pending',
        {
          name: formData.fullName,
          email: formData.email,
          phone: '',
        },
        'credit_card'
      );
      console.log('Booking response:', bookingResponse);

      if (!bookingResponse.success) {
        throw new Error(bookingResponse.message || 'Failed to create booking');
      }

      const newBookingId = bookingResponse.data.bookingId || bookingResponse.data._id;
      if (!newBookingId) {
        throw new Error('Booking ID not returned');
      }
      setBookingId(newBookingId);

      console.log('Creating payment intent with amount:', amountInCents);
      const paymentIntentResponse = await PaymentService.createPaymentIntent(amountInCents, 'usd');
      console.log('Payment intent response:', paymentIntentResponse);
      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.message || 'Failed to create payment intent');
      }

      const paymentMethodId = 'mock_payment';
      console.log('Processing payment with bookingId:', newBookingId, 'paymentMethodId:', paymentMethodId);
      const paymentResponse = await PaymentService.processPayment(newBookingId, paymentMethodId);
      console.log('Payment response:', paymentResponse);
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Payment failed');
      }

      console.log('Fetching payment status for bookingId:', newBookingId);
      const statusResponse = await PaymentService.getPaymentStatus(newBookingId);
      console.log('Payment status response:', statusResponse);
      if (statusResponse.data.paymentStatus !== 'completed') {
        throw new Error('Payment not completed');
      }

      setOrderComplete(true);
      clearCart();
    } catch (err) {
      console.error('Error processing order:', err);
      const status = err.response?.status;
      let errorMessage = err.message || 'An error occurred during checkout. Please try again.';
      if (status === 400) {
        errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Invalid booking details. Please check your cart and try again.';
      } else if (status === 404) {
        errorMessage = 'Event or tickets not found. Please start over.';
      } else if (status === 401) {
        errorMessage = 'Please log in again to continue.';
        navigate('/login?redirect=checkout');
      }
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setError('Cart cleared. Please add tickets for the correct event.');
  };

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <React.Suspense fallback={<Spinner animation="border" variant="primary" />}>
          <Header />
        </React.Suspense>
        <Container className="py-5">
          <div className="text-center fade-in" role="alert" aria-live="polite">
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-5">
                <FaCheckCircle size={70} className="text-success mb-4" aria-hidden="true" />
                <h2 className="mb-3">Payment Successful!</h2>
                <p className="text-muted mb-4">Your order has been processed successfully.</p>
                <Alert variant="success" className="d-inline-block">
                  Booking ID: <strong>{bookingId}</strong>
                </Alert>
                <p className="mb-3">
                  Thank you for your order, <strong>{user?.name || 'Valued Customer'}</strong>!
                </p>
                <p className="mb-4">
                  We've sent a confirmation email with your tickets and order details. Check your{' '}
                  <Link to="/dashboard">account dashboard</Link> for tickets.
                </p>
                <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                  <Button as={Link} to="/" variant="outline-secondary">
                    Back to Home
                  </Button>
                  <Button as={Link} to="/events" variant="primary">
                    Browse More Events
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <React.Suspense fallback={<Spinner animation="border" variant="primary" />}>
          <Footer />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <React.Suspense fallback={<Spinner animation="border" variant="primary" />}>
        <Header />
      </React.Suspense>
      <Container className="py-5">
        <h1 className="mb-4">Checkout</h1>
        {error && (
          <Alert variant="danger" id="form-error">
            {error}
            {error.includes('Invalid cart items') && (
              <>
                <Button
                  variant="link"
                  onClick={() => navigate('/events')}
                  className="ms-2 p-0"
                >
                  Add Tickets
                </Button>
                <Button
                  variant="link"
                  onClick={handleClearCart}
                  className="ms-2 p-0"
                >
                  <FaTrash className="me-1" /> Clear Cart
                </Button>
              </>
            )}
            {!error.includes('Invalid cart items') && !error.includes('empty') && (
              <Button
                variant="link"
                onClick={() => {
                  setError('');
                  handleSubmitOrder({ preventDefault: () => {} });
                }}
                className="ms-2 p-0"
                disabled={isProcessing}
              >
                Try Again
              </Button>
            )}
          </Alert>
        )}
        {cart.items.length === 0 ? (
          <Alert variant="warning">
            Your cart is empty. <Link to="/events">Browse events</Link> to add tickets to your cart.
          </Alert>
        ) : (
          <Row>
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-4">Contact Information</h5>
                  <Form onSubmit={handleSubmitOrder} noValidate>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            aria-describedby="fullName-error"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            aria-describedby="email-error"
                          />
                          <Form.Text className="text-muted">
                            We'll send your tickets to this email
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        label="I agree to the terms and conditions"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        aria-describedby="terms-error"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      <Button as={Link} to="/cart" variant="outline-secondary">
                        <FaArrowLeft className="me-2" /> Back to Cart
                      </Button>
                      <Button type="submit" variant="primary" disabled={isProcessing}>
                        {isProcessing ? (
                          <Spinner size="sm" className="me-2" />
                        ) : (
                          <>
                            <FaCreditCard className="me-2" /> Pay ${total.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Order Summary</h5>
                  {cart.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between mb-2">
                      <span>{item.ticketType} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (15%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
      <React.Suspense fallback={<Spinner animation="border" variant="primary" />}>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default Checkout;