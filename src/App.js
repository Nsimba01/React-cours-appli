// src/App.js
import React from 'react';
import Header from './component/Header.js';
import './css/App.css';
import videoBg from './assets/foret.mp4';
import { AuthProvider } from './component/AuthContext';

function App() {
  return (
    <AuthProvider>
      <video src={videoBg} autoPlay loop muted />
      <div className="content">
        <Header />
      </div>
    </AuthProvider>
  );
}

export default App;

