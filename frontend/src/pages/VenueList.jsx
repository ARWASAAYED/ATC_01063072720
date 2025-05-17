import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button, Modal, message } from 'antd';
import VenueService from '../services/VenueService'; // Adjust path as needed
import { FaEdit, FaTrash } from 'react-icons/fa'; // FontAwesome icons for update/delete
import { useAuth } from '../context/AuthContext';
import { venueAPI } from '../utils/api';

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const { user } = useAuth();

 
  const handleDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    try {
      setLoading(true);
      await venueAPI.deleteVenue(venueToDelete);
      message.success('Venue deleted successfully');
      
      fetchVenues();
    } catch (err) {
      console.error('Error deleting venue:', err);
      setError(err.message || 'Failed to delete venue');
      message.error('Failed to delete venue');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setVenueToDelete(null);
    }
  };

  // Confirm delete venue
  const confirmDelete = (venueId) => {
    setVenueToDelete(venueId);
    setDeleteModalVisible(true);
  };

  // Handle update venue
  const handleUpdateVenue = (venueId) => {
    if (!venueId) return;
    
    try {
      // Navigate to the edit venue page
      window.location.href = `/admin/venues/edit/${venueId}`;
      // Alternative if using React Router:
      // history.push(`/admin/venues/edit/${venueId}`);
    } catch (err) {
      console.error('Error navigating to edit page:', err);
      message.error('Failed to navigate to edit page');
    }
  };

  
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await VenueService.getVenues();
      
      
      if (response.data && Array.isArray(response.data.data)) {
        
        setVenues(
          response.data.data.map((venue, i) => ({
            key: i + 1,
            id: venue._id,
            title: venue.name,
            capacity: venue.capacity,
            city: venue.city,
          }))
        );
      } else if (response.data && Array.isArray(response.data)) {
        // If the structure is { data: [...] }
        setVenues(
          response.data.map((venue, i) => ({
            key: i + 1,
            id: venue._id,
            title: venue.name,
            capacity: venue.capacity,
            city: venue.city,
          }))
        );
      } else {
        throw new Error('Unexpected API response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err.message || 'Failed to fetch venues');
      message.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchVenues();
  }, []);

  
  if (!user || user.role !== 'admin') {
    return (
      <Alert
        message="Access Denied"
        description="This page is restricted to admin users only."
        type="error"
        showIcon
      />
    );
  }

  const columns = [
    { title: 'ID', dataIndex: 'key', key: 'key' },
    { title: 'Name', dataIndex: 'title', key: 'title' },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => (
        <Tag color="blue">{capacity}</Tag>
      ),
    },
    { title: 'City', dataIndex: 'city', key: 'city' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary"
            onClick={() => handleUpdateVenue(record.id)}
            style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Edit Venue"
          >
            <FaEdit />
          </Button>
          <Button 
            danger
            onClick={() => confirmDelete(record.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Delete Venue"
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Venue List</h3>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={venues}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Venue"
        open={deleteModalVisible}
        onOk={handleDeleteVenue}
        confirmLoading={loading}
        onCancel={() => {
          setDeleteModalVisible(false);
          setVenueToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ 
          danger: true,
          disabled: loading
        }}
      >
        <p>Are you sure you want to delete this venue? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default VenueList;