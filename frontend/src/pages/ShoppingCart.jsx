import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import BookingService from '../services/BookingService';

const Header = React.lazy(() => import('../components/Header'));
const Footer = React.lazy(() => import('../components/Footer'));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const subtotal = cart.total;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleQuantityChange = (eventId, ticketTypeId, quantity) => {
    updateQuantity(eventId, ticketTypeId, parseInt(quantity));
  };

  const handleRemoveItem = (eventId, ticketTypeId) => {
    removeFromCart(eventId, ticketTypeId);
  };

  const handleCheckout = async () => {
    try {
      const response = await BookingService.createBooking(cart.items);
      if (response.success) {
        setSuccess('Booking created successfully!');
        clearCart();
        setTimeout(() => navigate('/bookings'), 2000);
      } else {
        setError('Failed to create booking');
      }
    } catch (err) {
      setError('Error during checkout');
      console.error('Checkout error:', err);
    }
  };

  return (
    <motion.div className="shopping-cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Header />
      </React.Suspense>
      
      <Container className="py-5">
        <h1 className="mb-4 d-flex align-items-center">
          <FaShoppingCart className="me-3" /> Shopping Cart
        </h1>
        
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {cart.items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <div className="mb-4">
                  <FaShoppingCart size={60} className="text-muted mb-3" />
                  <h3>Your cart is empty</h3>
                  <p className="text-muted">Looks like you haven't added any tickets to your cart yet.</p>
                </div>
                <Button as={Link} to="/events" variant="primary" size="lg" className="px-4">
                  Browse Events
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <Row>
            <Col lg={8} className="mb-4 mb-lg-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="mb-3">Tickets in Cart ({cart.items.length})</h5>
                    <ListGroup variant="flush">
                      {cart.items.map((item) => (
                        <motion.div key={`${item.eventId}-${item.ticketTypeId}`} variants={itemVariants}>
                          <ListGroup.Item className="py-4 px-0 border-bottom">
                            <Row className="align-items-center">
                              <Col xs={12} md={2}>
                                <img
                                  src={`http://localhost:9881${item.eventImage}`}
                                  alt={item.eventTitle}
                                  className="img-fluid rounded"
                                  onError={(e) => { e.target.src = '/images/default-event.jpg'; }}
                                />
                              </Col>
                              <Col xs={12} md={5} className="my-3 my-md-0">
                                <h5 className="mb-1">{item.eventTitle}</h5>
                                <div className="text-muted small mb-2">{item.eventDate} • {item.ticketType}</div>
                                <div className="d-flex align-items-center">
                                  <Button
                                    variant="link"
                                    className="p-0 text-danger"
                                    onClick={() => handleRemoveItem(item.eventId, item.ticketTypeId)}
                                  >
                                    <FaTrash className="me-1" size={14} /> Remove
                                  </Button>
                                </div>
                              </Col>
                              <Col xs={6} md={2} className="text-start text-md-center">
                                <Form.Group>
                                  <Form.Label className="d-block d-md-none small text-muted">Quantity</Form.Label>
                                  <Form.Select
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.eventId, item.ticketTypeId, e.target.value)}
                                    className="w-auto"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                      <option key={num} value={num}>{num}</option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col xs={6} md={3} className="text-end">
                                <div className="mb-1 fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                <div className="text-muted small">${item.price.toFixed(2)} each</div>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        </motion.div>
                      ))}
                    </ListGroup>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="outline-secondary" as={Link} to="/events" className="d-inline-flex align-items-center">
                        <FaArrowLeft className="me-2" /> Continue Shopping
                      </Button>
                      <Button variant="outline-danger" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            
            <Col lg={4}>
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-sm sticky-top" style={{ top: '2rem' }}>
                  <Card.Body>
                    <h5 className="mb-4">Order Summary</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tax (15%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold">${total.toFixed(2)}</span>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mb-3 d-flex justify-content-center align-items-center"
                      onClick={handleCheckout}
                    >
                      <FaCreditCard className="me-2" /> Proceed to Checkout
                    </Button>
                    <Alert variant="info" className="mb-0 small">
                      <div className="fw-bold mb-1">Secure Checkout</div>
                      Your payment information is processed securely. We do not store credit card details.
                    </Alert>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        )}
      </Container>
      
      <React.Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </React.Suspense>
    </motion.div>
  );
};

export default ShoppingCart;