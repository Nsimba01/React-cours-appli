import React, { useEffect, useState, useContext } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { AuthContext } from './AuthContext';
import btn_on_connexion from '../images/connexion_on.png';
import { HiPencil } from 'react-icons/hi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [showCurrentPassword,  setShowCurrentPassword]  = useState(false);
  const [showNewPassword,      setShowNewPassword]      = useState(false);
  const [showConfirmPassword,  setShowConfirmPassword]  = useState(false);
  const [confirmPassword,      setConfirmPassword]      = useState('');
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // --- états de validation des champs "Nouveau"
  const [newFieldFocused,    setNewFieldFocused]    = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({ length: false, uppercase: false, number: false });
  const [pseudoValidation,   setPseudoValidation]   = useState({ length: false, available: false, checking: false });
  const [emailValidation,    setEmailValidation]    = useState(false);
  const pseudoTimeoutRef = React.useRef(null);

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
    setOpenFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
    if (openFields[fieldKey]) {
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setConfirmPassword('');
      setConfirmPasswordFocused(false);
      setNewFieldFocused(null);
      setPasswordValidation({ length: false, uppercase: false, number: false });
      setPseudoValidation({ length: false, available: false, checking: false });
      setEmailValidation(false);
    }
  };

  const handleCancel = () => {
    setOpenFields({});
    setPendingChanges({});
    setSaveMessage('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setConfirmPassword('');
    setConfirmPasswordFocused(false);
    setNewFieldFocused(null);
    setPasswordValidation({ length: false, uppercase: false, number: false });
    setPseudoValidation({ length: false, available: false, checking: false });
    setEmailValidation(false);
  };

  const handleSave = async () => {
    // désactivé pour le moment
  };

  // --- validation à la saisie du champ "Nouveau"
  const validateNewValue = (fieldKey, value) => {
    if (fieldKey === 'password') {
      setPasswordValidation({
        length:    value.length >= 10,
        uppercase: /[A-Z]/.test(value),
        number:    /[0-9]/.test(value),
      });
    }

    if (fieldKey === 'pseudo') {
      const p = value.trim();
      if (p.length < 5) {
        setPseudoValidation({ length: false, available: false, checking: false });
        return;
      }
      setPseudoValidation(prev => ({ ...prev, length: true, checking: true }));
      if (pseudoTimeoutRef.current) clearTimeout(pseudoTimeoutRef.current);
      pseudoTimeoutRef.current = setTimeout(async () => {
        try {
          const db       = getDatabase();
          const snapshot = await get(ref(db, `users/${p}`));
          setPseudoValidation({ length: true, available: !snapshot.exists(), checking: false });
        } catch {
          setPseudoValidation({ length: true, available: false, checking: false });
        }
      }, 500);
    }

    if (fieldKey === 'email') {
      setEmailValidation(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    }
  };

  const handlePendingChange = (fieldKey, value) => {
    let formattedValue = value;

    if (fieldKey === 'nom') {
      formattedValue = value.toUpperCase();
    }

    if (fieldKey === 'prenom') {
      formattedValue = value
        .split(/([\s-])/)
        .map((part) => {
          if (part.trim().length > 0 && !/[\s-]/.test(part)) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          return part;
        })
        .join('');
    }

    setPendingChanges(prev => ({ ...prev, [fieldKey]: formattedValue }));
    validateNewValue(fieldKey, formattedValue);
  };

  // --- messages de validation selon le champ
  const renderValidationMessage = (fieldKey) => {
    if (newFieldFocused !== fieldKey) return null;

    if (fieldKey === 'password') return (
      <div className="validation-message" aria-live="polite">
        <span style={{ color: passwordValidation.length    ? 'RGB(51,204,51)' : 'red' }}>Au moins 10 caractères</span><br />
        <span style={{ color: passwordValidation.uppercase ? 'RGB(51,204,51)' : 'red' }}>Au moins une majuscule</span><br />
        <span style={{ color: passwordValidation.number    ? 'RGB(51,204,51)' : 'red' }}>Au moins 1 chiffre</span>
      </div>
    );

    if (fieldKey === 'pseudo') return (
      <div className="validation-message" aria-live="polite">
        <span style={{ color: pseudoValidation.length    ? 'RGB(51,204,51)' : 'red' }}>Au moins 5 caractères</span><br />
        <span style={{ color: pseudoValidation.available ? 'RGB(51,204,51)' : pseudoValidation.checking ? 'orange' : 'red' }}>
          {pseudoValidation.checking ? 'Vérification en cours...' : pseudoValidation.available ? 'Pseudo disponible' : 'Pseudo indisponible'}
        </span>
      </div>
    );

    if (fieldKey === 'email') return (
      <div className="validation-message" aria-live="polite">
        <span style={{ color: emailValidation ? 'RGB(51,204,51)' : 'red' }}>Une adresse email valide</span>
      </div>
    );

    if (fieldKey === 'nom' || fieldKey === 'prenom') return (
      <div className="validation-message" aria-live="polite">
        <span style={{ color: (pendingChanges[fieldKey] || '').trim().length > 0 ? 'RGB(51,204,51)' : 'red' }}>
          Ce champ ne peut pas être vide
        </span>
      </div>
    );

    return null;
  };

  const passwordsMatch = confirmPassword === (pendingChanges['password'] || '');
const age = userData?.dateNaissance
  ? Math.floor((new Date() - new Date(userData.dateNaissance)) / (365.25 * 24 * 60 * 60 * 1000))
  : null;

const fields = [
  { label: 'Pseudo',            value: pseudo,                                                                                        fieldKey: 'pseudo',        masked: false, type: 'text'     },
  { label: 'Mot de passe',      value: '••••••••••',                                                                                  fieldKey: 'password',      masked: true,  type: 'password' },
  { label: 'Nom',               value: userData?.nom          || '—',                                                                 fieldKey: 'nom',                          type: 'text'     },
  { label: 'Prénom',            value: userData?.prenom       || '—',                                                                 fieldKey: 'prenom',                       type: 'text'     },
  { label: 'Sexe',              value: !userData?.sexe ? '—' : userData.sexe === 'homme' ? (age !== null && age >= 18 ? 'Homme' : 'Garçon') : (age !== null && age >= 18 ? 'Femme' : 'Fille'), fieldKey: 'sexe', type: 'select' },
  { label: 'Date de naissance', value: userData?.dateNaissance ? new Date(userData.dateNaissance).toLocaleDateString('fr-FR') : '—', fieldKey: 'dateNaissance',                type: 'date'     },
  { label: 'Mail',              value: userData?.email        || '—',                                                                 fieldKey: 'email',                        type: 'email'    },
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

        <button className="profile-close-btn" onClick={onClose} aria-label="Fermer">✕</button>

        {loading ? (
          <p className="profile-loading">Chargement...</p>
        ) : (
          <>
            <div className="profile-header">
               <span className="profile-pseudo-title">
                   {pseudo ? pseudo.charAt(0).toUpperCase() + pseudo.slice(1).toLowerCase() : '—'}
              </span>
            </div>

            <div className="profile-divider" />

            <div className="profile-body">

              <div className="profile-avatar">
                <img
                  src={btn_on_connexion}
                  alt="Profil connecté"
                  className="profile-avatar-img"
                  onContextMenu={e => e.preventDefault()}
                />
                <HiPencil size={14} color="black" style={{ display: 'block', margin: '6px auto 0' }} />
              </div>

              <div className="profile-info">
                {fields.map(({ label, value, fieldKey, masked, type }) => (
                  <div key={label} className="profile-field-block">

                    <div className="profile-row">
                      <span className="profile-label" >
                        {label}
                      </span>
                      <span className={`profile-value ${masked ? 'profile-value--masked' : ''}`}>{value}</span>
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

                    {fieldKey && openFields[fieldKey] && (
                      <div className="profile-edit-block">

                        {/* Actuel */}
                        <div className="profile-edit-row">
                          <span className="profile-edit-label">Actuel :</span>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type={masked ? (showCurrentPassword ? 'text' : 'password') : 'text'}
                              value={value === '—' ? '' : value}
                              title= "Mot de passe actuel"
                              disabled
                              className="profile-edit-input profile-edit-input--disabled"
                              style={{ width: '100%', paddingRight: masked ? '32px' : '8px', boxSizing: 'border-box' }}
                            />
                            {masked && (
                              <span
                                onClick={() => setShowCurrentPassword(p => !p)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '15px' }}
                              >
                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nouveau */}
                        <div className="profile-edit-row">
                          <span className="profile-edit-label">Nouveau :</span>
                          <div style={{ position: 'relative', flex: 1 }}>
                            {type === 'select' ? (
                              <select
                                className="profile-edit-input"
                                value={pendingChanges[fieldKey] || ''}
                                onChange={e => handlePendingChange(fieldKey, e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                              >
                                <option value="">(choisir)</option>
                                <option value="homme">Garçon</option>
                                <option value="femme">Fille</option>
                              </select>
                            ) : (
                              <input
                                type={masked ? (showNewPassword ? 'text' : 'password') : (type || 'text')}
                                className="profile-edit-input"
                                placeholder={`Nouveau ${label.toLowerCase()}`}
                                value={pendingChanges[fieldKey] || ''}
                                onChange={e => handlePendingChange(fieldKey, e.target.value)}
                                onFocus={() => setNewFieldFocused(fieldKey)}
                                onBlur={() => setNewFieldFocused(null)}
                                title="Nouveau mot de passe"
                                style={{ width: '100%', paddingRight: masked ? '32px' : '8px', boxSizing: 'border-box' }}
                              />
                            )}
                            {masked && (
                              <span
                                onClick={() => setShowNewPassword(p => !p)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '15px' }}
                              >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Messages de validation du nouveau mot de passe */}
                        {renderValidationMessage(fieldKey)}

                        {/* Confirmation mot de passe */}
                        {fieldKey === 'password' && (
                          <>
                            <div className="profile-edit-row">
                              <span className="profile-edit-label">Confirmer :</span>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  className="profile-edit-input"
                                  placeholder="Confirmer le mot de passe"
                                  value={confirmPassword}
                                  onChange={e => setConfirmPassword(e.target.value)}
                                  onFocus={() => setConfirmPasswordFocused(true)}
                                  onBlur={() => setConfirmPasswordFocused(false)}
                                  style={{ width: '100%', paddingRight: '32px', boxSizing: 'border-box' }}
                                  title="Confirmation du nouveau mot de passe"
                                />
                                <span
                                  onClick={() => setShowConfirmPassword(p => !p)}
                                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '15px' }}
                                >
                                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                              </div>
                            </div>

                            {/* Message correspondance mots de passe */}
                            {confirmPasswordFocused && confirmPassword.length > 0 && (
                              <div className="validation-message" aria-live="polite">
                                <span style={{ color: passwordsMatch ? 'RGB(51,204,51)' : 'red' }}>
                                  {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {saveMessage && <p className="profile-save-message">{saveMessage}</p>}

            {hasPendingChanges && (
              <div className="profile-actions">
                <button className="profile-btn-cancel" onClick={handleCancel} disabled={isSaving}>
                  Annuler
                </button>
                <button className="profile-btn-save" disabled={isSaving}>
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