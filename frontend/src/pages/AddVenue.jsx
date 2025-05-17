import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Alert, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { venueAPI, eventAPI } from '../utils/api';

const { TextArea } = Input;
const { Option } = Select;

const AddVenue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [events, setEvents] = useState([]);

  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventAPI.getEvents({ limit: 100 });
        if (res.success) {
          setEvents(res.data);
        } else {
          setError('Failed to load events');
        }
      } catch (err) {
        setError('Error loading events');
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <Alert
        message="Access Denied"
        description="This page is restricted to admin users only."
        type="error"
        showIcon
        style={{ margin: '50px auto', maxWidth: 600 }}
      />
    );
  }

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('country', values.country);
    formData.append('capacity', values.capacity);
    formData.append('amenities', JSON.stringify(values.amenities || []));
    formData.append('events', JSON.stringify(values.events || []));
    if (values.contactEmail) formData.append('contactEmail', values.contactEmail);
    if (values.contactPhone) formData.append('contactPhone', values.contactPhone);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
      console.log('Adding file to FormData:', fileList[0].originFileObj.name);
    }

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(` - ${key}:`, value);
    }

    try {
      const res = await venueAPI.createVenue(formData);
      setLoading(false);
      const venueId = res.data?._id;
      if (res.success && venueId) {
        setSuccess('Venue created successfully!');
        form.resetFields();
        setFileList([]);
        setTimeout(() => navigate(`/venue/${venueId}`), 2000);
      } else {
        setError('Failed to create venue: Invalid response format');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.map(e => e.msg).join(', ') ||
                          err.message ||
                          'Error creating venue';
      setError(errorMessage);
      console.error('Error details:', err.response?.data || err);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      if (!isImage) {
        setError('You can only upload JPEG, PNG, or GIF images!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        setError('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    fileList,
    accept: 'image/jpeg,image/png,image/gif',
    multiple: false,
    listType: 'picture'
  };

  const amenityOptions = [
    'WiFi', 'Parking', 'Air Conditioning', 'Stage', 'Sound System', 'Projector', 'Catering', 'Security'
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h3 className="mb-4 title">Add New Venue</h3>
      {success && (
        <Alert
          message="Success"
          description={success}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          capacity: 100,
          amenities: [],
          events: []
        }}
      >
        <Form.Item
          label="Venue Name"
          name="name"
          rules={[
            { required: true, message: 'Please input the venue name!' },
            { max: 100, message: 'Name cannot be more than 100 characters' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please input the address!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="City"
          name="city"
          rules={[{ required: true, message: 'Please input the city!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: 'Please input the country!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Capacity"
          name="capacity"
          rules={[
            { required: true, message: 'Please input the capacity!' },
            { validator: (_, value) => value >= 1 ? Promise.resolve() : Promise.reject('Capacity must be at least 1!') }
          ]}
        >
          <InputNumber min={1} step={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Amenities"
          name="amenities"
        >
          <Select mode="multiple" placeholder="Select amenities">
            {amenityOptions.map(amenity => (
              <Option key={amenity} value={amenity}>
                {amenity}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Events"
          name="events"
        >
          <Select mode="multiple" placeholder="Select events">
            {events.map(event => (
              <Option key={event._id} value={event._id}>
                {event.title} ({new Date(event.startDate).toLocaleDateString()})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Contact Email"
          name="contactEmail"
          rules={[
            { type: 'email', message: 'Please input a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Phone"
          name="contactPhone"
          rules={[
            { pattern: /^\+?[\d\s-]{7,15}$/, message: 'Please input a valid phone number!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Venue Image"
          name="image"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload Image (JPEG/PNG/GIF, max 5MB)</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={() => navigate('/admin/venue-list')} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Creating...' : 'Create Venue'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddVenue;