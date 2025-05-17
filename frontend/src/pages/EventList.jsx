import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button, Modal, message, Select, Radio } from 'antd';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import EventService from '../services/EventService';
import { eventAPI } from '../utils/api';

const { Option } = Select;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [paginationType, setPaginationType] = useState('paginated');
  const { user } = useAuth();
  const [totalEvents, setTotalEvents] = useState(0);

 
  const fetchEvents = async () => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    try {
      const response = await EventService.getEvents();
      const eventData = Array.isArray(response.data)
        ? response.data
        : response.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];
      
      setTotalEvents(eventData.length);
      setEvents(
        eventData.map((event, i) => ({
          key: i + 1,
          id: event._id,
          title: event.title || 'Unknown',
          category: event.category || null,
          startDate: event.startDate
            ? new Date(event.startDate).toLocaleDateString()
            : 'Unknown',
          venue: event.venue || 'Unknown',
          city: event.city || 'Unknown',
        }))
      );
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      message.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setLoading(true);
      await eventAPI.deleteEvent(eventToDelete);
      message.success('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
      message.error('Failed to delete event');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setEventToDelete(null);
    }
  };

  //  delete
  const confirmDelete = (eventId) => {
    setEventToDelete(eventId);
    setDeleteModalVisible(true);
  };

  // update 
  const handleUpdateEvent = (eventId) => {
    if (!eventId) return;
    try {
      window.location.href = `/admin/events/edit/${eventId}`;
    } catch (err) {
      console.error('Error navigating to edit page:', err);
      message.error('Failed to navigate to edit page');
    }
  };

  
  const handlePageSizeChange = (value) => {
    setPageSize(value);
  };

  
  const handlePaginationTypeChange = (e) => {
    setPaginationType(e.target.value);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

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
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        category ? <Tag color="blue">{category.toUpperCase()}</Tag> : <Tag color="gray">NONE</Tag>
      ),
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            onClick={() => handleUpdateEvent(record.id)}
            style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Edit Event"
          >
            <FaEdit />
          </Button>
          <Button
            danger
            onClick={() => confirmDelete(record.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Delete Event"
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Event List</h3>
      <div style={{ marginBottom: 16 }}>
     
      </div>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Radio.Group onChange={handlePaginationTypeChange} value={paginationType}>
          <Radio.Button value="paginated">Paginated</Radio.Button>
          <Radio.Button value="all">Show All</Radio.Button>
        </Radio.Group>
        
        {paginationType === 'paginated' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>Events per page:</span>
            <Select value={pageSize} onChange={handlePageSizeChange} style={{ width: 120 }}>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </div>
        )}
      </div>
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : events.length === 0 ? (
        <Alert
          message="No Events"
          description="No events found. Create a new event to get started."
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={events}
          pagination={
            paginationType === 'paginated' 
              ? { 
                  pageSize, 
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }
              : false
          }
          scroll={{ x: true }}
        />
      )}
      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Event"
        open={deleteModalVisible}
        onOk={handleDeleteEvent}
        confirmLoading={loading}
        onCancel={() => {
          setDeleteModalVisible(false);
          setEventToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          disabled: loading,
        }}
      >
        <p>Are you sure you want to delete this event? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default EventList;