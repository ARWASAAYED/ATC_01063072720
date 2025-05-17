
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { speakerAPI } from '../utils/api';

const { TextArea } = Input;

const AddSpeaker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileList, setFileList] = useState([]);

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
    formData.append('company', values.company || '');
    formData.append('position', values.position || '');
    formData.append('bio', values.bio);
    const expertiseArray = values.expertise
      ? values.expertise.split(',').map((item) => item.trim()).filter((item) => item)
      : [];
    formData.append('expertise', JSON.stringify(expertiseArray));
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
      console.log('Adding file to FormData:', fileList[0].originFileObj.name);
    }
    // Add social media fields
    const socialMedia = {
      twitter: values.socialMedia?.twitter || '',
      linkedin: values.socialMedia?.linkedin || '',
      facebook: values.socialMedia?.facebook || '',
      instagram: values.socialMedia?.instagram || '',
    };
    formData.append('socialMedia', JSON.stringify(socialMedia));

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(` - ${key}:`, value);
    }

    try {
      const res = await speakerAPI.createSpeaker(formData);
      setLoading(false);
      const speakerId = res.data?._id;
      if (res.success && speakerId) {
        setSuccess('Speaker created successfully!');
        form.resetFields();
        setFileList([]);
        setTimeout(() => navigate(`/speaker/${speakerId}`), 2000);
      } else {
        setError('Failed to create speaker: Invalid response format');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        err.response?.data?.message ||
        err.message ||
        'Error creating speaker';
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
    listType: 'picture',
  };

  const urlValidator = (_, value) => {
    if (!value) return Promise.resolve();
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
    if (urlPattern.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid URL');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h3 className="mb-4 title">Add New Speaker</h3>
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
      >
        <Form.Item
          label="Speaker Name"
          name="name"
          rules={[{ required: true, message: 'Please input the speaker name!' }, { min: 3, message: 'Name must be at least 3 characters' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Company"
          name="company"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Position"
          name="position"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Bio"
          name="bio"
          rules={[
            { required: true, message: 'Please input the biography!' },
            { min: 10, message: 'Bio must be at least 10 characters' },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Expertise (comma-separated)"
          name="expertise"
          rules={[
            { required: true, message: 'Please input at least one area of expertise!' },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject('Expertise is required');
                const expertiseArray = value.split(',').map((item) => item.trim()).filter((item) => item);
                if (expertiseArray.length === 0) {
                  return Promise.reject('Please provide at least one non-empty expertise');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="e.g. Technology, Leadership, Marketing" />
        </Form.Item>
        <Form.Item
          label="Speaker Image"
          name="image"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload Image (JPEG/PNG/GIF, max 5MB)</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="Twitter URL"
          name={['socialMedia', 'twitter']}
          rules={[{ validator: urlValidator }]}
        >
          <Input placeholder="e.g. https://twitter.com/username" />
        </Form.Item>
        <Form.Item
          label="LinkedIn URL"
          name={['socialMedia', 'linkedin']}
          rules={[{ validator: urlValidator }]}
        >
          <Input placeholder="e.g. https://linkedin.com/in/username" />
        </Form.Item>
        <Form.Item
          label="Facebook URL"
          name={['socialMedia', 'facebook']}
          rules={[{ validator: urlValidator }]}
        >
          <Input placeholder="e.g. https://facebook.com/username" />
        </Form.Item>
        <Form.Item
          label="Instagram URL"
          name={['socialMedia', 'instagram']}
          rules={[{ validator: urlValidator }]}
        >
          <Input placeholder="e.g. https://instagram.com/username" />
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={() => navigate('/admin/speaker-list')} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Creating...' : 'Create Speaker'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddSpeaker;