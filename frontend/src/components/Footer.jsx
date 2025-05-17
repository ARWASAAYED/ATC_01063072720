import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <>
      {/* Newsletter Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <h2 className="mb-3">Subscribe To Our Newsletter</h2>
              <p className="lead text-muted mb-4">Get updates on the latest events, exclusive offers, and more.</p>
              <Form className="d-flex">
                <Form.Control
                  type="email"
                  placeholder="Your email address"
                  className="me-2 py-2"
                />
                <Button variant="warning" className="text-white px-4">Subscribe</Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-3">
                <div className="brand-logo me-2" style={{ backgroundColor: '#4a90e2', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FaCalendarAlt color="white" size={20} />
                </div>
                <h5 className="mb-0">EVENTCHAMP</h5>
              </div>
              <p className="text-light mb-4">The ultimate platform for discovering and booking exciting events across South Africa.</p>
              <div className="d-flex">
                <Link to="#" className="me-3"><i className="fab fa-facebook-f"></i></Link>
                <Link to="#" className="me-3"><i className="fab fa-twitter"></i></Link>
                <Link to="#" className="me-3"><i className="fab fa-instagram"></i></Link>
                <Link to="#"><i className="fab fa-linkedin-in"></i></Link>
              </div>
            </Col>
            <Col md={2} className="mb-4 mb-md-0">
              <h5 className="mb-4">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/events" className="text-light text-decoration-none">Events</Link></li>
                <li className="mb-2"><Link to="/venues" className="text-light text-decoration-none">Venues</Link></li>
                <li className="mb-2"><Link to="/artists" className="text-light text-decoration-none">Artists</Link></li>
              </ul>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <h5 className="mb-4">Useful Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/about" className="text-light text-decoration-none">About Us</Link></li>
                <li className="mb-2"><Link to="/contact" className="text-light text-decoration-none">Contact Us</Link></li>
                <li className="mb-2"><Link to="/faq" className="text-light text-decoration-none">FAQ</Link></li>
                <li className="mb-2"><Link to="/privacy" className="text-light text-decoration-none">Privacy Policy</Link></li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="mb-4">Contact Info</h5>
              <ul className="list-unstyled">
                <li className="mb-2">123 Event Street, Cape Town</li>
                <li className="mb-2">+27 123 456 7890</li>
                <li className="mb-2">info@eventchamp.com</li>
              </ul>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="text-center">
            <p className="mb-0">© {new Date().getFullYear()} EventChamp. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default Footer;