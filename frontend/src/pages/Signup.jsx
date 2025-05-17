import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { register, loading, error } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
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
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.agreeToTerms) {
            errors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
          
            const result = await register(formData.name, formData.email, formData.password);
            
            if (result) {
                setSuccessMessage('Registration successful! Redirecting to login...');
                
               
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    agreeToTerms: false
                });
                
                // Redirect to login after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            
            console.log('Registration failed:', err.message || 'Unknown error');
           
            if (err.message && err.message.toLowerCase().includes('email')) {
                setFormData(prev => ({ ...prev, email: '' }));
            }
        }
    };
    
    return (
        <div className="fade-in">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold mb-1">Create Your Account</h2>
                                    <p className="text-muted">Join EventChamp to start booking amazing events</p>
                                </div>
                                
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}
                                
                                {successMessage && (
                                    <Alert variant="success" className="mb-4">
                                        <FaCheckCircle className="me-2" />
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
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Password</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <FaLock />
                                                    </span>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="Create a password"
                                                        isInvalid={!!formErrors.password}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formErrors.password}
                                                    </Form.Control.Feedback>
                                                </div>
                                                <Form.Text className="text-muted">
                                                    Password must be at least 6 characters
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm your password"
                                                    isInvalid={!!formErrors.confirmPassword}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {formErrors.confirmPassword}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            id="agreeToTerms"
                                            name="agreeToTerms"
                                            label={<span>I agree to the <Link to="/pages">Terms & Conditions</Link> and <Link to="/pages">Privacy Policy</Link></span>}
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.agreeToTerms}
                                            feedback={formErrors.agreeToTerms}
                                            feedbackType="invalid"
                                        />
                                    </Form.Group>
                                    
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-2 mb-4"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                    
                                    <div className="text-center">
                                        <p className="mb-0">
                                            Already have an account?{' '}
                                            <Link to="/login" className="text-primary">
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Signup;
