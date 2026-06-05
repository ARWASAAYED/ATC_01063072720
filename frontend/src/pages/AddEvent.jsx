import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Button, Alert, Upload, Checkbox, Card, Row, Col, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { eventAPI, venueAPI, speakerAPI } from '../utils/api';

const { TextArea } = Input;
const { Option } = Select;

const AddEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [venues, setVenues] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venuesRes, speakersRes] = await Promise.all([
          venueAPI.getVenues(),
          speakerAPI.getSpeakers()
        ]);
        setVenues(venuesRes.data);
        setSpeakers(speakersRes.data);
      } catch (err) {
        setError('Error loading venues and speakers. Please try again later.');
      }
    };
    fetchData();
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

    // Validate numeric fields
    if (isNaN(values.ticketPrice) || values.ticketPrice < 0) {
      setError('Ticket price must be a non-negative number.');
      setLoading(false);
      return;
    }
    if (isNaN(values.ticketQuantity) || values.ticketQuantity < 1) {
      setError('Ticket quantity must be at least 1.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('endDate', values.endDate.toISOString());
    formData.append('venue', values.venue);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('isFeatured', values.isFeatured ? 'true' : 'false');
    formData.append('tickets', JSON.stringify([{
      type: values.ticketType,
      price: Number(values.ticketPrice),
      quantity: Number(values.ticketQuantity),
      available: Number(values.ticketQuantity),
    }]));
    if (values.speakers && values.speakers.length > 0) {
      formData.append('speakers', JSON.stringify(values.speakers));
    }
    
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
      console.log('Adding file to FormData:', fileList[0].originFileObj.name);
    }

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(` - ${key}:`, value);
    }

    try {
      const res = await eventAPI.createEvent(formData);
      setLoading(false);
      const eventId = res.data?._id || res.data?.id;
      if (res.success && eventId) {
        setSuccess('Event created successfully!');
        form.resetFields();
        setFileList([]);
        setTimeout(() => navigate(`/event/${eventId}`), 2000);
      } else {
        setError('Failed to create event: Invalid response format');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.map(e => e.msg).join(', ') ||
                          err.message ||
                          'Error creating event';
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
      console.log('File list changed:', newFileList);
      setFileList(newFileList.slice(-1));
    },
    fileList,
    accept: 'image/jpeg,image/png,image/gif',
    multiple: false,
    listType: 'picture',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h3 className="mb-4 title">Add New Event</h3>
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
          category: 'Conference',
          ticketType: 'General',
          ticketPrice: 99.99,
          ticketQuantity: 10,
          isFeatured: false,
        }}
      >
        <Form.Item
          label="Event Title"
          name="title"
          rules={[{ required: true, message: 'Please input the event title!' }, { min: 3, message: 'Title must be at least 3 characters' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }, { min: 10, message: 'Description must be at least 10 characters' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please select a category!' }]}
        >
          <Select>
            <Option value="Conference">Conference</Option>
            <Option value="Seminar">Seminar</Option>
            <Option value="Workshop">Workshop</Option>
            <Option value="Concert">Concert</Option>
            <Option value="Exhibition">Exhibition</Option>
            <Option value="Sports">Sports</Option>
            <Option value="Party">Party</Option>
            <Option value="Networking">Networking</Option>
            <Option value="Theater">Theater</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Start Date & Time"
              name="startDate"
              rules={[{ required: true, message: 'Please select the start date!' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date & Time"
              name="endDate"
              rules={[
                { required: true, message: 'Please select the end date!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('startDate') < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('End date must be after start date'));
                  },
                }),
              ]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Venue"
          name="venue"
          rules={[{ required: true, message: 'Please select a venue!' }]}
        >
          <Select placeholder="Select a venue">
            {venues.map(venue => (
              <Option key={venue._id} value={venue._id}>
                {venue.name} - {venue.city}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please input the address!' }, { min: 3, message: 'Address must be at least 3 characters' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="City"
          name="city"
          rules={[{ required: true, message: 'Please input the city!' }, { min: 2, message: 'City must be at least 2 characters' }]}
        >
          <Input />
        </Form.Item>
        <Card title="Ticket Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ticket Type"
                name="ticketType"
                rules={[{ required: true, message: 'Please input the ticket type!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Price ($)"
                name="ticketPrice"
                rules={[
                  { required: true, message: 'Please input the price!' },
                  {
                    validator: (_, value) =>
                      value >= 0 ? Promise.resolve() : Promise.reject('Price must be non-negative!'),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`}
                  parser={value => Number(value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Quantity"
                name="ticketQuantity"
                rules={[
                  { required: true, message: 'Please input the quantity!' },
                  {
                    validator: (_, value) =>
                      value >= 1 ? Promise.resolve() : Promise.reject('Quantity must be at least 1!'),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  step={1}
                  precision={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`}
                  parser={value => Number(value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Form.Item
          label="Speakers"
          name="speakers"
        >
          <Select mode="multiple" placeholder="Select speakers">
            {speakers.map(speaker => (
              <Option key={speaker._id} value={speaker._id}>
                {speaker.name} - {speaker.company}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Event Image"
          name="image"
        >
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Upload Image (JPEG/PNG/GIF, max 5MB)</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="isFeatured" valuePropName="checked">
          <Checkbox>Feature this event</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={() => navigate('/admin/event-list')} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddEvent;