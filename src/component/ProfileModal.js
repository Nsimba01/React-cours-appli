import React, { useEffect, useState, useContext } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { AuthContext } from './AuthContext';
import btn_on_connexion from '../images/connexion_on.png';
import { HiPencil } from 'react-icons/hi';
import '../css/ProfileModal.css';

function ProfileModal({ onClose }) {
  const { pseudo: pseudoContext } = useContext(AuthContext);
  const pseudo = pseudoContext || localStorage.getItem('pseudo') || '';

  const [userData,       setUserData]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [openFields,     setOpenFields]     = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [saveMessage,    setSaveMessage]    = useState('');
  const [isSaving,       setIsSaving]       = useState(false);

  useEffect(() => {
    if (!pseudo) { setLoading(false); return; }

    const fetchUser = async () => {
      try {
        const db       = getDatabase();
        const snapshot = await get(ref(db, `users/${pseudo}`));
        if (snapshot.exists()) setUserData(snapshot.val());
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

  const toggleField = (fieldKey) => {
    setOpenFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
    if (openFields[fieldKey]) {
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });
    }
  };

  const handlePendingChange = (fieldKey, value) => {
    setPendingChanges(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleCancel = () => {
    setOpenFields({});
    setPendingChanges({});
    setSaveMessage('');
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const db      = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      await update(userRef, pendingChanges);

      setUserData(prev => ({ ...prev, ...pendingChanges }));
      setOpenFields({});
      setPendingChanges({});
      setSaveMessage('Modifications enregistrées !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      setSaveMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    {
      label:    'Pseudo',
      value:    pseudo,
      fieldKey: 'pseudo',  // ✅ crayon activé
      masked:   false,
      type:     'text',
    },
    {
      label:    'Mot de passe',
      value:    '••••••••••',
      fieldKey: 'password',
      masked:   true,
      type:     'password',
    },
    {
      label:    'Nom',
      value:    userData?.nom        || '—',
      fieldKey: 'nom',
      type:     'text',
    },
    {
      label:    'Prénom',
      value:    userData?.prenom     || '—',
      fieldKey: 'prenom',
      type:     'text',
    },
    {
      label:    'Sexe',
      value:    userData?.sexe       || '—',
      fieldKey: 'sexe',
      type:     'select',
    },
    {
      label: 'Date de naissance',
      value: userData?.dateNaissance
        ? new Date(userData.dateNaissance).toLocaleDateString('fr-FR')
        : '—',
      fieldKey: 'dateNaissance',
      type:     'date',
    },
    {
      label:    'Mail',
      value:    userData?.email      || '—',
      fieldKey: 'email',
      type:     'email',
    },
  ];

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div
      className="profile-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Profil utilisateur"
    >
      <div className="profile-modal">

        <button className="profile-close-btn" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {loading ? (
          <p className="profile-loading">Chargement...</p>
        ) : (
          <>
            {/* En-tête */}
            <div className="profile-header">
              <span className="profile-pseudo-title">{pseudo || '—'}</span>
            </div>

            <div className="profile-divider" />

            {/* Corps */}
            <div className="profile-body">

              {/* Icône avatar */}
              <div className="profile-avatar">
                <img
                  src={btn_on_connexion}
                  alt="Profil connecté"
                  className="profile-avatar-img"
                  onContextMenu={e => e.preventDefault()}
                />
                <HiPencil size={14} color="black" style={{ display: 'block', margin: '6px auto 0' }} />
              </div>

              {/* Infos */}
              <div className="profile-info">
                {fields.map(({ label, value, fieldKey, masked, type }) => (
                  <div key={label} className="profile-field-block">

                    {/* Ligne principale */}
                    <div className="profile-row">
                      <span className="profile-label">{label}</span>
                      <span className={`profile-value ${masked ? 'profile-value--masked' : ''}`}>
                        {value}
                      </span>

                      {/* Icône HiPencil */}
                      {fieldKey && (
                        <span
                          className="profile-edit-icon"
                          onClick={() => toggleField(fieldKey)}
                          title={`Modifier ${label}`}
                        >
                          <HiPencil size={14} />
                        </span>
                      )}
                    </div>

                    {/* Zone édition inline */}
                    {fieldKey && openFields[fieldKey] && (
                      <div className="profile-edit-block">

                        {/* Actuel */}
                        <div className="profile-edit-row">
                          <span className="profile-edit-label">Actuel :</span>
                          <input
                            type={masked ? 'password' : 'text'}
                            value={value === '—' ? '' : value}
                            disabled
                            className="profile-edit-input profile-edit-input--disabled"
                          />
                        </div>

                        {/* Nouveau */}
                        <div className="profile-edit-row">
                          <span className="profile-edit-label">Nouveau :</span>

                          {type === 'select' ? (
                            <select
                              className="profile-edit-input"
                              value={pendingChanges[fieldKey] || ''}
                              onChange={e => handlePendingChange(fieldKey, e.target.value)}
                            >
                              <option value="">(choisir)</option>
                              <option value="homme">Garçon</option>
                              <option value="femme">Fille</option>
                            </select>
                          ) : (
                            <input
                              type={type || 'text'}
                              className="profile-edit-input"
                              placeholder={`Nouveau ${label.toLowerCase()}`}
                              value={pendingChanges[fieldKey] || ''}
                              onChange={e => handlePendingChange(fieldKey, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message sauvegarde */}
            {saveMessage && (
              <p className="profile-save-message">{saveMessage}</p>
            )}

            {/* Boutons Valider / Annuler */}
            {hasPendingChanges && (
              <div className="profile-actions">
                <button
                  className="profile-btn-cancel"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  className="profile-btn-save"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;