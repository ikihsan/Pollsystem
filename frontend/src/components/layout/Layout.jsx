import React from 'react';
import Header from './Header.jsx';
import NotificationContainer from './NotificationContainer.jsx';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <NotificationContainer />
    </div>
  );
};

export default Layout;