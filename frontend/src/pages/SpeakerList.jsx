
import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button, Modal, message } from 'antd';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { speakerAPI } from '../utils/api';

const SpeakerList = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState(null);
  const { user } = useAuth();


  const fetchSpeakers = async () => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    try {
      const response = await speakerAPI.getSpeakers();
      const speakerData = Array.isArray(response.data)
        ? response.data
        : response.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setSpeakers(
        speakerData.map((speaker, i) => ({
          key: i + 1,
          id: speaker._id,
          name: speaker.name,
          company: speaker.company || 'N/A',
          position: speaker.position || 'N/A',
          expertise: speaker.expertise || [],
          bio: speaker.bio,
        }))
      );
      setError(null);
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setError(err.message || 'Failed to fetch speakers');
      message.error('Failed to load speakers');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteSpeaker = async () => {
    if (!speakerToDelete) return;

    try {
      setLoading(true);
      await speakerAPI.deleteSpeaker(speakerToDelete);
      message.success('Speaker deleted successfully');
      fetchSpeakers();
    } catch (err) {
      console.error('Error deleting speaker:', err);
      setError(err.message || 'Failed to delete speaker');
      message.error('Failed to delete speaker');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSpeakerToDelete(null);
    }
  };

  // Confirm delete
  const confirmDelete = (speakerId) => {
    setSpeakerToDelete(speakerId);
    setDeleteModalVisible(true);
  };

  
  const handleUpdateSpeaker = (speakerId) => {
    if (!speakerId) return;
    try {
      window.location.href = `/admin/edit-speaker/${speakerId}`;
    } catch (err) {
      console.error('Error navigating to edit page:', err);
      message.error('Failed to navigate to edit page');
    }
  };

  useEffect(() => {
    fetchSpeakers();
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    {
      title: 'Expertise',
      dataIndex: 'expertise',
      key: 'expertise',
      render: (expertise) => (
        expertise.length > 0 ? (
          expertise.map((exp, index) => (
            <Tag color="blue" key={index}>
              {exp.toUpperCase()}
            </Tag>
          ))
        ) : (
          <Tag color="gray">NONE</Tag>
        )
      ),
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      render: (bio) => (bio.length > 100 ? `${bio.substring(0, 100)}...` : bio),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            onClick={() => handleUpdateSpeaker(record.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Edit Speaker"
          >
            <FaEdit />
          </Button>
          <Button
            danger
            onClick={() => confirmDelete(record.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Delete Speaker"
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Speaker List</h3>
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
          dataSource={speakers}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
      <Modal
        title="Delete Speaker"
        open={deleteModalVisible}
        onOk={handleDeleteSpeaker}
        confirmLoading={loading}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSpeakerToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          disabled: loading,
        }}
      >
        <p>Are you sure you want to delete this speaker? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default SpeakerList;