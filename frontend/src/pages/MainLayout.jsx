import React, { useState } from 'react';
import { AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineDashboard, AiOutlineUser, AiOutlineShoppingCart } from 'react-icons/ai';
import { SiBrandfolder } from 'react-icons/si';
import { BiCategoryAlt } from 'react-icons/bi';
import { FaClipboardList, FaBloggerB } from 'react-icons/fa';
import { ImBlog } from 'react-icons/im';
import { IoIosNotifications } from 'react-icons/io';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu, theme, Alert } from 'antd';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Non-admin or unauthenticated users see access denied
  if (!user || user.role !== 'admin') {
    return (
      <Alert
        message="Access Denied"
        description="This page is restricted to admin users only. Please log in as an admin."
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
        }
        style={{ margin: '50px auto', maxWidth: 600 }}
      />
    );
  }

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2 className='text-white fs-5 text-center py-3 mb-0'>
            <span className='sm-logo'>EC</span>
            <span className='lg-logo'>EVENT CHAMP</span>
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['']}
          onClick={({ key }) => {
            if (key === 'log out') {
              logout();
              navigate('/login');
            } else {
              navigate(key);
            }
          }}
          items={[
            {
              key: '',
              icon: <AiOutlineDashboard className='fs-4' />,
              label: 'Dashboard',
            },
            {
              key: 'users',
              icon: <AiOutlineUser className='fs-4' />,
              label: 'Users',
            },
            {
              key: 'catalog',
              icon: <FaBloggerB className='fs-4' />,
              label: 'Catalog',
              children: [
                {
                  key: 'add-event',
                  icon: <FaBloggerB className='fs-5' />,
                  label: 'Add Event',
                },
                {
                  key: 'event-list',
                  icon: <ImBlog className='fs-5' />,
                  label: 'Event List',
                },
                {
                  key: 'add-venue',
                  icon: <ImBlog className='fs-5' />,
                  label: 'Add Venue',
                },
                {
                  key: 'venue-list',
                  icon: <ImBlog className='fs-5' />,
                  label: 'Venue List',
                },
                {
                  key: 'add-speaker',
                  icon: <ImBlog className='fs-5' />,
                  label: 'Add Speaker',
                },
                {
                  key: 'speaker-list',
                  icon: <ImBlog className='fs-5' />,
                  label: 'Speaker List',
                },
              ],
            },
            {
              key: 'bookings',
              icon: <FaClipboardList className='fs-4' />,
              label: 'Bookings',
            },
            
            { type: 'divider' },
            {
              key: 'log out',
              icon: <FaClipboardList className='fs-4' />,
              label: 'Log out',
            },
          ]}
        />
      </Sider>
      <Layout className='site-layout'>
        <Header className='d-flex justify-content-between ps-1 pe-5'
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <AiOutlineAlignRight /> : <AiOutlineAlignLeft />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className='d-flex gap-3 align-items-center'>
            <div className='position-relative'>
              <IoIosNotifications className='fs-4' />
              <span className='badge rounded-circle p-1 position-absolute'>3</span>
            </div>
            <div className='d-flex gap-3 align-items-center dropdown'>
              <div>
                <img
                  className="rounded-circle"
                  width={45}
                  height={45}
                  src="https://i.pinimg.com/736x/97/22/2f/97222fa158251b2feb29efb5c5103f57.jpg"
                  alt=""
                />
              </div>
              <div
                role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <h5 className='mb-0'>{user.name}</h5>
                <p className='mb-0'>{user.email}</p>
              </div>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <Link
                    className="dropdown-item py-1 mb-1"
                    style={{ height: "auto", lineHeight: "20px" }}
                    to="/admin"
                  >
                    View Profile
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item py-1 mb-1"
                    style={{ height: "auto", lineHeight: "20px" }}
                    to="/login"
                    onClick={logout}
                  >
                    Signout
                  </Link>
                </li>
              </div>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;