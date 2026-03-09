import React, { useEffect, useState, useContext } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { AuthContext } from './AuthContext';
import btn_on_connexion from '../images/connexion_on.png';
import '../css/ProfileModal.css';

function ProfileModal({ onClose }) {
  const { pseudo: pseudoContext } = useContext(AuthContext);

  // ✅ fallback localStorage si le contexte n'est pas encore initialisé
  const pseudo = pseudoContext || localStorage.getItem('pseudo') || '';

  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!pseudo) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const db       = getDatabase();
        const snapshot = await get(ref(db, `users/${pseudo}`));
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } catch (err) {
        console.error('Erreur chargement profil :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pseudo]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="profile-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Profil utilisateur"
    >
      <div className="profile-modal">

        <button
          className="profile-close-btn"
          onClick={onClose}
          aria-label="Fermer le profil"
        >
          ✕
        </button>

        {loading ? (
          <p className="profile-loading">Chargement...</p>
        ) : (
          <>
            {/* En-tête : pseudo centré */}
            <div className="profile-header">
              <span className="profile-pseudo-title">{pseudo || '—'}</span>
            </div>

            <div className="profile-divider" />

            {/* Corps : icône à gauche + infos à droite */}
            <div className="profile-body">

              <div className="profile-avatar">
                <img
                  src={btn_on_connexion}
                  alt="Profil connecté"
                  className="profile-avatar-img"
                  onContextMenu={e => e.preventDefault()}
                />
              </div>

              <div className="profile-info">
                {[
                  { label: 'Pseudo',          value: pseudo },
                  { label: 'Mot de passe',     value: '••••••••••', masked: true },
                  { label: 'Nom',              value: userData?.nom           || '—' },
                  { label: 'Prénom',           value: userData?.prenom        || '—' },
                  { label: 'Sexe',             value: userData?.sexe          || '—' },
                  {
                    label: 'Date de naissance',
                    value: userData?.dateNaissance
                      ? new Date(userData.dateNaissance).toLocaleDateString('fr-FR')
                      : '—'
                  },
                  { label: 'Mail', value: userData?.email || '—' },
                ].map(({ label, value, masked }) => (
                  <div key={label} className="profile-row">
                    <span className="profile-label">{label}</span>
                    <span className={`profile-value ${masked ? 'profile-value--masked' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;