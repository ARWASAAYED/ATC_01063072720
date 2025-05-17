import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button, Select } from 'antd';
import { useCart } from '../context/CartContext';
import { bookingAPI, authAPI } from '../utils/api';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); 
  const [user, setUser] = useState(null);
  const [pageSize, setPageSize] = useState(10); 
  const { cancelBooking } = useCart();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          setError('Failed to fetch user data. Please log in.');
        }
      } catch (err) {
        setError('Failed to fetch user data. Please log in.');
      }
    };
    fetchUser();
  }, []);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const response = await bookingAPI.getBookings();
        if (response.success) {
          const bookingData = Array.isArray(response.data)
            ? response.data
            : response.data && Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setBookings(
            bookingData.map((booking, i) => ({
              key: i + 1,
              id: booking._id,
              event: booking.event?.title || 'Unknown Event',
              ticketType: booking.tickets?.map(t => t.ticketType).join(', ') || 'Unknown',
              quantity: booking.tickets?.reduce((sum, t) => sum + t.quantity, 0) || 0,
              totalAmount: typeof booking.totalAmount === 'number' ? booking.totalAmount : 0,
              bookingStatus: booking.bookingStatus || 'Unknown',
              createdAt: booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString()
                : 'Unknown',
              userName: booking.user?.name || 'Unknown',
              userEmail: booking.user?.email || 'Unknown',
            }))
          );
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const response = await cancelBooking(bookingId);
      if (response.success) {
        setBookings(
          bookings.map(booking =>
            booking.id === bookingId ? { ...booking, bookingStatus: 'cancelled' } : booking
          )
        );
      } else {
        setError(response.message || 'Failed to cancel booking');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (value) => {
    setPageSize(value);
  };

  // Non-authenticated users see access denied
  if (!user) {
    return (
      <Alert
        message="Access Denied"
        description="Please log in to view your bookings."
        type="error"
        showIcon
      />
    );
  }

  const columns = [
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
    },
    {
      title: 'Ticket Type',
      dataIndex: 'ticketType',
      key: 'ticketType',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status) => {
        const color =
          status === 'confirmed' ? 'green' : status === 'cancelled' ? 'red' : 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    ...(user.role === 'admin'
      ? [
          {
            title: 'User',
            key: 'user',
            render: (_, record) => `${record.userName} (${record.userEmail})`,
          },
        ]
      : []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.bookingStatus === 'confirmed' && (
          <Button
            type="link"
            icon={<CloseCircleOutlined />}
            onClick={() => handleCancelBooking(record.id)}
            loading={actionLoading === record.id}
            danger
          >
            Cancel
          </Button>
        ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Bookings</h3>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Show:</span>
        <Select value={pageSize} onChange={handlePageSizeChange} style={{ width: 120 }}>
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
          <Option value={100}>100</Option>
        </Select>
      </div>
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : bookings.length === 0 ? (
        <Alert
          message="No Bookings"
          description="You have no bookings. Browse events to book tickets."
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={bookings}
          pagination={{ pageSize, showSizeChanger: false }}
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default BookingList;