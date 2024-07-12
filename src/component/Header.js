import React, { useContext, useState } from 'react';
import logos from '../images/arbredusavoir.jpg';
import btn_off_connexion from '../images/connexion_off.png';
import btn_on_connexion from '../images/connexion_on.png';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import MainContent from './MainContent.js';
import Connexion from './Connexion.js';
import LoginHover from './LoginHover.js';
import Creation from './Creation.js'; // Importer le nouveau composant
import { AuthContext } from './AuthContext';

function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);

  const handleLogout = () => {
    logout(); // Appelle la fonction de déconnexion
  };

  return (
    <Router>
      <div className="row">
        <div className="col"><Link to="/home"><img src={logos} className="bloc_titre_logo" alt="logo" /></Link></div>
        <div className="col" id="button2"><h1 className="titre">Titre principal</h1></div>
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
                  style={{ width: '100px', height: '100px' }}
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
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
              </Link>
            )}
            <div className="dropdown-content">
              {isAuthenticated && (isHovered || isDropdownHovered) ? (
                <button onClick={handleLogout}>Déconnexion</button>
              ) : (
                !isAuthenticated && <LoginHover />
              )}
            </div>
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/home" element={<MainContent />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/creation" element={<Creation />} /> {/* Ajout de la route */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default Header;
