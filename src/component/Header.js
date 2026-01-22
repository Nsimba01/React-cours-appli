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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomOut, setIsZoomOut] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1009);

  // Détection du zoom
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

  // Détection de la largeur d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1009);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer le dropdown au clic à l'extérieur (seulement pour petits écrans)
  useEffect(() => {
    if (!isLargeScreen) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown')) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isLargeScreen]);

  const toggleDropdown = (e) => {
    if (!isLargeScreen) {
      e.preventDefault();
      e.stopPropagation();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleMouseEnter = () => {
    if (isLargeScreen) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isLargeScreen) {
      setIsHovered(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsHovered(false);
  };

  // Afficher le dropdown si :
  // - Grand écran ET survol
  // - Petit écran ET clic
  const showDropdown = isLargeScreen ? isHovered : isDropdownOpen;

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
          <div className="dropdown">
            {isAuthenticated ? (
              <div
                className="button_espace"
                onClick={toggleDropdown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer' }}
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
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
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

            {/* Dropdown content - LoginHover ou Déconnexion */}
            {showDropdown && (
              <div 
                className="dropdown-content-wrapper"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {isAuthenticated ? (
                  <div className="dropdown-content-deconnexion">
                    <button
                      onClick={handleLogout}
                      style={{ borderRadius: '7px', fontWeight: 'bold' }}
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <LoginHover />
                )}
              </div>
            )}
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