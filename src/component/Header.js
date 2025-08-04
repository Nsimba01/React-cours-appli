import React, { useContext, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';

import MainContent       from './MainContent';
import Connexion         from './Connexion';
import LoginHover        from './LoginHover';
import Creation          from './Creation';
import ResetPassword     from './ResetPassword';
import ResetPwdReady     from './ResetPwdReady';
import { AuthContext }   from './AuthContext';

import logos             from '../images/Logo-app.png';
import btn_off_connexion from '../images/connexion_off.png';
import btn_on_connexion  from '../images/connexion_on.png';

function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isHovered, setIsHovered]               = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isZoomOut, setIsZoomOut]               = useState(false);

  // 1. Détection du zoom via devicePixelRatio ou visualViewport.scale
  useEffect(() => {
    const detectZoom = () => {
      const scaleVV = window.visualViewport?.scale;
      const dpr     = window.devicePixelRatio;
      const zoomLevel = scaleVV ?? dpr;
      setIsZoomOut(zoomLevel < 1);
    };

    window.addEventListener('resize', detectZoom);
    detectZoom();
    return () => window.removeEventListener('resize', detectZoom);
  }, []);

  const handleLogout = () => logout();

  return (
    <Router>
      <div className="row">
        {/* LOGO */}
        <div className="col">
          <Link to="/home">
            <img
              src={logos}
              className="bloc_titre_logo"
              alt="logo"
              onContextMenu={e => e.preventDefault()}
              style={{
                transform: isZoomOut ? 'scale(0.7)' : 'scale(1)',
                transformOrigin: 'left top'
              }}
            />
          </Link>
        </div>

        {/* TITRE */}
        <div className="col" id="button2">
          <h1 className="titre">Arbre du Savoir</h1>
        </div>

        {/* BOUTON CONNEXION / ESPACE */}
        <div className="col">
          <div
            className="dropdown"
            onMouseEnter={() => setIsDropdownHovered(true)}
            onMouseLeave={() => setIsDropdownHovered(false)}
          >
            {isAuthenticated ? (
              <div
                className="button_espace"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                  className="bloc_titre_boutonespace_image"
                  src={btn_on_connexion}
                  alt="bouton-space"
                  style={{ width: '50px', height: '30px' }}
                />
              </div>
            ) : (
              <Link to="/connexion">
                <div
                  className="button_espace"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <img
                    className="bloc_titre_boutonespace_image"
                    src={btn_off_connexion}
                    alt="bouton-space"
                    style={{ width: '60px', height: '3rem' }}
                    onContextMenu={e => e.preventDefault()}
                  />
                </div>
              </Link>
            )}

            <div className="dropdown-content">
              {isAuthenticated && (isHovered || isDropdownHovered) ? (
                <button onClick={handleLogout}  style={{ borderRadius: '7px', fontWeight: 'bold' }}   >Déconnexion</button>
              ) : (
                !isAuthenticated && <LoginHover />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROUTES */}
      <Routes>
        <Route path="/home"             element={<MainContent />} />
        <Route path="/connexion"        element={<Connexion />} />
        <Route path="/creation"         element={<Creation />} />
        <Route path="/reset_password"   element={<ResetPassword />} />
        <Route path="/reset-pwd-process" element={<ResetPwdReady />} />
        <Route path="/"                  element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default Header;
