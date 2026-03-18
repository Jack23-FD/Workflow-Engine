import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-container" style={{ flexDirection: 'column' }}>
    <div className="spinner" />
    <div className="loader-text">{text}</div>
  </div>
);

export default Loader;
