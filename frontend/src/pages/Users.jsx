import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert } from 'antd';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      
      if (!user || user.role !== 'admin') return;

      setLoading(true);
      try {
        const res = await api.get('/users');
        
        const nonAdminUsers = res.data.data.filter(u => u.role !== 'admin');
        setUsers(
          nonAdminUsers.map((user, i) => ({
            key: i + 1,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: new Date(user.createdAt).toLocaleDateString(),
          }))
        );
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="green">{role.toUpperCase()}</Tag>
      ),
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Users</h3>
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
          dataSource={users}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default Users;