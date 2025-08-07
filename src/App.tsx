import React from 'react';
import './App.css';
import { Button, Card, Input, Modal } from './components/common';
import { Navigation, StatsCard } from './components/admin';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', active: true },
    { label: 'Driver Management', path: '/drivers', badge: '12' },
    { label: 'Student Management', path: '/students' },
    { label: 'Parent Portal', path: '/parents' },
    { label: 'Route Planning', path: '/routes' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
  ];

  const userInfo = {
    name: 'Admin User',
    role: 'System Administrator'
  };

  return (
    <div className="vitgo-app">
      <Navigation 
        items={navigationItems}
        logo={<div className="vitgo-logo">VITGO Admin</div>}
        userInfo={userInfo}
        onItemClick={(path) => console.log('Navigate to:', path)}
        onLogout={() => console.log('Logout clicked')}
      />
      
      <main className="vitgo-main-content">
        <div className="vitgo-content-wrapper">
          <header className="vitgo-page-header">
            <h1>VITGO Transportation Management System</h1>
            <p>Welcome to the React Component Library</p>
          </header>

          <div className="vitgo-stats-grid">
            <StatsCard
              title="Total Students"
              value="2,847"
              subtitle="Active registrations"
              trend={{ value: 12, isPositive: true, label: 'vs last month' }}
              color="primary"
            />
            <StatsCard
              title="Active Drivers"
              value="156"
              subtitle="Currently on duty"
              trend={{ value: 5, isPositive: true, label: 'vs last week' }}
              color="success"
            />
            <StatsCard
              title="Routes"
              value="42"
              subtitle="Daily routes"
              color="warning"
            />
            <StatsCard
              title="Incidents"
              value="3"
              subtitle="This week"
              trend={{ value: 8, isPositive: false, label: 'vs last week' }}
              color="danger"
            />
          </div>

          <div className="vitgo-demo-section">
            <Card>
              <h2>Component Demo</h2>
              <div className="vitgo-demo-grid">
                <div className="vitgo-demo-item">
                  <h3>Buttons</h3>
                  <div className="vitgo-button-group">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                <div className="vitgo-demo-item">
                  <h3>Input Field</h3>
                  <Input
                    label="Student ID"
                    placeholder="Enter student ID"
                    type="text"
                  />
                </div>

                <div className="vitgo-demo-item">
                  <h3>Modal</h3>
                  <Button onClick={() => setIsModalOpen(true)}>
                    Open Modal
                  </Button>
                  <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Student Details"
                    size="medium"
                  >
                    <p>This is a demo modal showing how the VITGO component library works.</p>
                    <Input label="Student Name" placeholder="Enter name" />
                    <br />
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                      Save Changes
                    </Button>
                  </Modal>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
