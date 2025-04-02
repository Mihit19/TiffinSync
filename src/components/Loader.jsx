import React from 'react';
//import './App.css';

export default function Loader() {
  return (
    <div className="loader">
      <div className="tiffin-stack">
        <div className="tiffin-top"></div>
        <div className="tiffin-middle"></div>
        <div className="tiffin-bottom"></div>
      </div>
      <p className="loading-text">Preparing your tiffin...</p>
    </div>
  );
}