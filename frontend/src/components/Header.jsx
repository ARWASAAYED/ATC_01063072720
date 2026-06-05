import React from 'react';
import { Container, Nav, Navbar, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaShoppingCart, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  
 
  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="brand-logo me-2" style={{ backgroundColor: '#4a90e2', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FaCalendarAlt color="white" size={20} />
          </div>
          <span className="fw-bold">EVENTCHAMP</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" className="mx-2">HOME</Nav.Link>
            <Nav.Link as={Link} to="/events" className="mx-2">EVENTS</Nav.Link>
            <Nav.Link as={Link} to="/calendar" className="mx-2">CALENDAR</Nav.Link>
            <Nav.Link as={Link} to="/speakers" className="mx-2">SPEAKERS</Nav.Link>
            <Nav.Link as={Link} to="/venues" className="mx-2">VENUES</Nav.Link>
            <Nav.Link as={Link} to="/schedule" className="mx-2">SCHEDULE</Nav.Link>
            <Nav.Link as={Link} to="/pages" className="mx-2">PAGES</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            <Button 
              variant="link" 
              className="position-relative me-3"
              onClick={() => navigate('/cart')}
            >
              <FaShoppingCart size={22} />
              {cartItemCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute" 
                  style={{ top: '-8px', right: '-8px', fontSize: '0.65rem' }}
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            {isAuthenticated ? (
              <Dropdown align="end" className="me-3">
                <Dropdown.Toggle variant="link" id="dropdown-user" className="p-0">
                  <FaUserCircle size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="div" className="d-flex align-items-center px-3 py-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2" />
                      <div>
                        <p className="mb-0 fw-bold">{user?.name}</p>
                        <small>{user?.email}</small>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => navigate('/profile')}>
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" />
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                variant="link" 
                className="me-3"
                onClick={() => navigate('/login')}
              >
                <FaUserCircle size={22} />
              </Button>
            )}
            <Button 
              variant="primary" 
              className="px-4 py-2"
              onClick={() => navigate('/events')}
            >
              BUY TICKETS
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;