import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import MainContent from './MainContent.js';
import Connexion from './Connexion.js';
import LoginHover from './LoginHover.js';
import Creation from './Creation.js';
import ResetPassword from './ResetPassword.js';
import ResetPwdReady from './ResetPwdReady.js'; // Importer le nouveau composant
import { AuthContext } from './AuthContext';
import logos from '../images/Logo-app.png'; // Importer l'image du logo
import btn_off_connexion from '../images/connexion_off.jpg'; // Importer l'image du bouton de connexion off
import btn_on_connexion from '../images/connexion_on.png'; // Importer l'image du bouton de connexion on

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
        <div className="col"><Link to="/home"><img src={logos} className="bloc_titre_logo" alt="logo"  onContextMenu={(e) => e.preventDefault()}  /></Link></div>
        <div className="col" id="button2"><h1 className="titre">Arbre du Savoir</h1></div>
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
                  style={{ width: '100px', height: '4rem' }}
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
                    style={{ width: '100px', height: '4rem' } } onContextMenu={(e) => e.preventDefault()}
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
        <Route path="/creation" element={<Creation />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/reset-pwd-process" element={<ResetPwdReady />} /> {/* Ajout de la route */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default Header;