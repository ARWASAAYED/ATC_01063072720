import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Spinner } from 'react-bootstrap';
import { Link, useParams, Navigate } from 'react-router-dom';
import { FaArrowRight, FaPhone, FaEnvelope, FaMapMarkerAlt, FaQuestionCircle, FaShieldAlt, FaInfoCircle, FaBookOpen, FaHandshake } from 'react-icons/fa';
import { motion } from 'framer-motion';


const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

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


const pageContent = {
  about: {
    title: "About Us",
    icon: <FaInfoCircle className="mb-4" size={40} />,
    content: (
      <>
        <h2 className="mb-4">About EventChamp</h2>
        <p className="lead mb-4">Connecting people through unforgettable events since 2022.</p>
        
        <Row className="mb-5">
          <Col md={6}>
            <img 
              src="https://images.unsplash.com/photo-1531058020387-3be344556be6" 
              alt="Event crowd" 
              className="img-fluid rounded shadow-sm mb-4 mb-md-0"
            />
          </Col>
          <Col md={6}>
            <h3 className="mb-3">Our Story</h3>
            <p>
              EventChamp was founded in 2022 with a simple mission: to make event discovery and booking seamless and enjoyable. 
              We started as a small team of event enthusiasts who were frustrated with the complexity of finding and attending 
              great events in our city.
            </p>
            <p>
              Today, we've grown into South Africa's leading event platform, connecting thousands of attendees with 
              hundreds of events every month. From intimate workshops to large-scale festivals, we're passionate about 
              bringing people together through memorable experiences.
            </p>
          </Col>
        </Row>
        
        <h3 className="mb-4">Our Mission</h3>
        <p className="mb-4">
          Our mission is to make exceptional events accessible to everyone. We believe that shared experiences have the 
          power to create meaningful connections, foster community, and inspire positive change. By providing a platform 
          that simplifies event discovery and booking, we aim to enrich lives through transformative experiences.
        </p>
        
        <h3 className="mb-4">Our Values</h3>
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3">
                  <FaHandshake size={40} />
                </div>
                <h4>Community</h4>
                <p className="mb-0">We believe in the power of bringing people together and creating meaningful connections.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3">
                  <FaShieldAlt size={40} />
                </div>
                <h4>Trust</h4>
                <p className="mb-0">We're committed to transparency, security, and building relationships based on trust.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3">
                  <FaBookOpen size={40} />
                </div>
                <h4>Innovation</h4>
                <p className="mb-0">We continuously strive to improve our platform and create better user experiences.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <h3 className="mb-4">Our Team</h3>
        <p className="mb-5">
          We're a diverse team of event enthusiasts, tech innovators, and customer experience specialists. 
          United by our passion for creating memorable experiences, we work tirelessly to connect event-goers 
          with exceptional events across South Africa.
        </p>
        
        <div className="text-center">
          <Button as={Link} to="/contact" variant="primary" size="lg">
            Get in Touch
          </Button>
        </div>
      </>
    )
  },
  
  faq: {
    title: "Frequently Asked Questions",
    icon: <FaQuestionCircle className="mb-4" size={40} />,
    content: (
      <>
        <h2 className="mb-5">Frequently Asked Questions</h2>
        
        <div className="faq-section mb-5">
          <h3 className="mb-4">General Questions</h3>
          
          <div className="faq-item mb-4">
            <h4>What is EventChamp?</h4>
            <p>
              EventChamp is South Africa's leading event booking platform, connecting attendees with a wide range 
              of events including conferences, workshops, concerts, and more. We streamline the process of finding 
              and booking tickets for events that match your interests.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>Is it free to use EventChamp?</h4>
            <p>
              Yes, creating an account and browsing events on EventChamp is completely free. We only charge a small 
              service fee when you purchase tickets through our platform.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>How do I create an account?</h4>
            <p>
              You can create an account by clicking the "Sign Up" button in the top right corner of our website. 
              You'll need to provide your email address and create a password. You can also sign up using your 
              Google or Facebook account for faster registration.
            </p>
          </div>
        </div>
        
        <div className="faq-section mb-5">
          <h3 className="mb-4">Booking Questions</h3>
          
          <div className="faq-item mb-4">
            <h4>How do I book tickets for an event?</h4>
            <p>
              To book tickets, find an event you're interested in and click the "Book Now" or "Buy Tickets" button. 
              Select the number and type of tickets you want, provide your payment information, and complete the 
              purchase. You'll receive an email confirmation with your tickets.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>What payment methods do you accept?</h4>
            <p>
              We accept most major credit cards (Visa, Mastercard, American Express), PayPal, and local payment 
              methods such as EFT and SnapScan.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>Can I cancel my booking and get a refund?</h4>
            <p>
              Refund policies vary depending on the event organizer. Some events allow cancellations up to a 
              certain date before the event, while others have a no-refund policy. You can find the specific 
              refund policy for each event on the event details page before you book.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>How will I receive my tickets?</h4>
            <p>
              After completing your purchase, you'll receive an email with your e-tickets attached. You can also 
              access your tickets at any time by logging into your EventChamp account and navigating to "My Tickets."
            </p>
          </div>
        </div>
        
        <div className="faq-section mb-5">
          <h3 className="mb-4">Event Organizer Questions</h3>
          
          <div className="faq-item mb-4">
            <h4>How can I list my event on EventChamp?</h4>
            <p>
              To list your event, you'll need to create an organizer account. Once approved, you can create and 
              publish your event listing, set up ticket types and pricing, and manage your attendees through our 
              organizer dashboard.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>What fees do you charge for organizers?</h4>
            <p>
              We charge a small percentage fee on each ticket sold through our platform. The exact fee structure 
              depends on your event type and volume. Contact our sales team for detailed pricing information.
            </p>
          </div>
          
          <div className="faq-item mb-4">
            <h4>When will I receive payment for tickets sold?</h4>
            <p>
              Payments are typically processed within 5-7 business days after your event has concluded. For large 
              events, we offer partial payouts before the event date. Contact our finance team for more details.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="mb-4">Can't find the answer you're looking for?</p>
          <Button as={Link} to="/contact" variant="primary">
            Contact Our Support Team
          </Button>
        </div>
      </>
    )
  },
  
  contact: {
    title: "Contact Us",
    icon: <FaEnvelope className="mb-4" size={40} />,
    content: (
      <>
        <h2 className="mb-5">Get in Touch</h2>
        
        <Row>
          <Col lg={5} className="mb-5 mb-lg-0">
            <h3 className="mb-4">We'd Love to Hear from You</h3>
            <p className="mb-4">
              Whether you have a question about our services, need help with a booking, or want to partner with us,
              our team is ready to assist you.
            </p>
            
            <div className="contact-info">
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaMapMarkerAlt size={24} />
                </div>
                <div>
                  <h5>Visit Us</h5>
                  <p className="mb-0">
                    123 Innovation Hub<br />
                    Century City<br />
                    Cape Town, 7441<br />
                    South Africa
                  </p>
                </div>
              </div>
              
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaPhone size={24} />
                </div>
                <div>
                  <h5>Call Us</h5>
                  <p className="mb-0">
                    +27 21 123 4567<br />
                    Monday to Friday, 8am to 6pm SAST
                  </p>
                </div>
              </div>
              
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaEnvelope size={24} />
                </div>
                <div>
                  <h5>Email Us</h5>
                  <p className="mb-0">
                    General Inquiries: info@eventchamp.co.za<br />
                    Support: support@eventchamp.co.za<br />
                    Partnerships: partners@eventchamp.co.za
                  </p>
                </div>
              </div>
            </div>
          </Col>
          
          <Col lg={7}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                <h3 className="mb-4">Send Us a Message</h3>
                
                <form>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Your Name</label>
                        <input type="text" className="form-control" id="name" placeholder="John Doe" required />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" className="form-control" id="email" placeholder="john@example.com" required />
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="form-group">
                        <label htmlFor="subject" className="form-label">Subject</label>
                        <input type="text" className="form-control" id="subject" placeholder="How can we help you?" required />
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="form-group">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea className="form-control" id="message" rows="5" placeholder="Your message here..." required></textarea>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <Button type="submit" variant="primary" className="w-100">
                        Send Message
                      </Button>
                    </Col>
                  </Row>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    )
  },
  
  terms: {
    title: "Terms & Conditions",
    icon: <FaBookOpen className="mb-4" size={40} />,
    content: (
      <>
        <h2 className="mb-4">Terms and Conditions</h2>
        <p className="lead mb-5">Last updated: May 10, 2025</p>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">1. Introduction</h3>
          <p>
            Welcome to EventChamp. These Terms and Conditions govern your use of our website, mobile applications, 
            and services. By accessing or using EventChamp, you agree to be bound by these Terms. If you disagree 
            with any part of the terms, you may not access the service.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">2. Definitions</h3>
          <p>
            <strong>"EventChamp"</strong> refers to our company, website, and services.<br />
            <strong>"User"</strong> refers to individuals who register an account and use our services.<br />
            <strong>"Organizer"</strong> refers to event creators who list their events on our platform.<br />
            <strong>"Attendee"</strong> refers to users who purchase tickets through our platform.<br />
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">3. User Accounts</h3>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. 
            You are responsible for safeguarding the password and for all activities that occur under your account. 
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">4. Booking and Payments</h3>
          <p>
            When you book tickets through EventChamp, you enter into a binding agreement with the event organizer. 
            EventChamp acts as a platform facilitating this transaction. Payment processing is handled securely 
            through our trusted payment providers. All prices are inclusive of applicable taxes unless otherwise stated.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">5. Refund Policy</h3>
          <p>
            Refund policies are set by individual event organizers and are displayed on the event listing page. 
            EventChamp is not responsible for processing refunds, which are at the discretion of the organizer 
            according to their stated policy.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">6. Organizer Terms</h3>
          <p>
            Event organizers are responsible for the accuracy of their event listings, pricing, and availability. 
            Organizers agree to honor all bookings made through our platform and to provide the advertised services. 
            EventChamp charges a service fee for each ticket sold, which will be clearly communicated to organizers.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">7. Prohibited Activities</h3>
          <p>
            Users may not engage in any activities that violate laws or regulations, infringe on intellectual property 
            rights, distribute harmful content, attempt to gain unauthorized access to our systems, or disrupt the 
            functionality of our service.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">8. Limitation of Liability</h3>
          <p>
            EventChamp shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your access to or use of, or inability to access or use, our services.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">9. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes. 
            Your continued use of EventChamp after such modifications constitutes your acceptance of the updated terms.
          </p>
        </div>
        
        <div className="terms-section mb-4">
          <h3 className="mb-3">10. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at legal@eventchamp.co.za.
          </p>
        </div>
      </>
    )
  },
  
  privacy: {
    title: "Privacy Policy",
    icon: <FaShieldAlt className="mb-4" size={40} />,
    content: (
      <>
        <h2 className="mb-4">Privacy Policy</h2>
        <p className="lead mb-5">Last updated: May 10, 2025</p>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">1. Introduction</h3>
          <p>
            At EventChamp, we respect your privacy and are committed to protecting your personal data. This Privacy 
            Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">2. Information We Collect</h3>
          <p>
            <strong>Personal Information:</strong> Name, email address, phone number, postal address, and payment information.<br />
            <strong>Account Information:</strong> Login credentials and preferences.<br />
            <strong>Transaction Information:</strong> Purchase history, events attended, and ticket details.<br />
            <strong>Usage Data:</strong> How you interact with our platform, pages visited, and features used.<br />
            <strong>Device Information:</strong> IP address, browser type, device type, and operating system.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">3. How We Use Your Information</h3>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Facilitate ticket purchases and event registrations</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send important notifications about events or your account</li>
            <li>Personalize your experience and show you relevant events</li>
            <li>Improve our services and develop new features</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">4. How We Share Your Information</h3>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li>Event organizers for event management purposes</li>
            <li>Service providers who help us operate our business</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners with your consent</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">5. Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver targeted 
            content. You can control cookies through your browser settings, but disabling them may limit functionality.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">6. Your Rights</h3>
          <p>
            Depending on your location, you may have rights to:
          </p>
          <ul>
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
          </ul>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">7. Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal data from unauthorized access, 
            alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
            storage is 100% secure.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">8. International Transfers</h3>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. 
            We ensure appropriate safeguards are in place to protect your information.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">9. Changes to Privacy Policy</h3>
          <p>
            We may update our Privacy Policy periodically. We will notify you of significant changes by posting the 
            updated policy on this page and updating the "Last updated" date.
          </p>
        </div>
        
        <div className="privacy-section mb-4">
          <h3 className="mb-3">10. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy, please contact our Data Protection Officer at 
            privacy@eventchamp.co.za.
          </p>
        </div>
      </>
    )
  }
};

// Available pages
const availablePages = [
  { 
    id: 'about', 
    title: 'About Us', 
    description: 'Learn about our company, mission, and team.',
    icon: <FaInfoCircle size={30} className="mb-3 text-primary" />
  },
  { 
    id: 'faq', 
    title: 'FAQ', 
    description: 'Find answers to frequently asked questions.',
    icon: <FaQuestionCircle size={30} className="mb-3 text-primary" />
  },
  { 
    id: 'contact', 
    title: 'Contact Us', 
    description: 'Get in touch with our team for support or inquiries.',
    icon: <FaEnvelope size={30} className="mb-3 text-primary" />
  },
  { 
    id: 'terms', 
    title: 'Terms & Conditions', 
    description: 'Read our terms of service and policies.',
    icon: <FaBookOpen size={30} className="mb-3 text-primary" />
  },
  { 
    id: 'privacy', 
    title: 'Privacy Policy', 
    description: 'Learn how we protect your data and privacy.',
    icon: <FaShieldAlt size={30} className="mb-3 text-primary" />
  }
];

const Pages = () => {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    
    setTimeout(() => {
      setPage(pageId ? pageContent[pageId] : null);
      setIsLoading(false);
    }, 300);
  }, [pageId]);
  
 
  if (pageId && !pageContent[pageId] && !isLoading) {
    return <Navigate to="/pages" replace />;
  }
  
  return (
    <motion.div 
      className="pages-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Suspense fallback */}
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
      </Suspense>
      
      {isLoading ? (
        <div className="py-5">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Content section */}
          <section className="py-5">
            <Container>
              {page ? (
                
                <div className="static-page-content">
                  <div className="text-center mb-5">
                    {page.icon}
                    <h1>{page.title}</h1>
                  </div>
                  
                  {page.content}
                  
                  <div className="text-center mt-5 pt-3">
                    <Button variant="outline-primary" as={Link} to="/pages">
                      Back to Pages
                    </Button>
                  </div>
                </div>
              ) : (
                
                <div className="pages-listing">
                  <div className="text-center mb-5">
                    <h1 className="mb-3">Help & Resources</h1>
                    <p className="lead">
                      Find information about our services, policies, and how to get in touch with us.
                    </p>
                  </div>
                  
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Row className="g-4">
                      {availablePages.map((item, index) => (
                        <Col md={6} lg={4} key={index}>
                          <motion.div variants={itemVariants}>
                            <Card className="h-100 border-0 shadow-sm hover-card">
                              <Card.Body className="text-center p-4">
                                {item.icon}
                                <h3 className="mb-3">{item.title}</h3>
                                <p className="text-muted mb-4">{item.description}</p>
                                <Button 
                                  as={Link} 
                                  to={`/pages/${item.id}`} 
                                  variant="outline-primary" 
                                  className="mt-auto"
                                >
                                  View <FaArrowRight className="ms-2" />
                                </Button>
                              </Card.Body>
                            </Card>
                          </motion.div>
                        </Col>
                      ))}
                    </Row>
                  </motion.div>
                </div>
              )}
            </Container>
          </section>
        </>
      )}
      
      {/* Footer with Suspense for better loading performance */}
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
      
      <style jsx>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default Pages;
