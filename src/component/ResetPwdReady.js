import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../css/resetPwdReady.css';
import { validatePassword } from './validationUtils';

function ResetPwdReady() {
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedPseudo = localStorage.getItem('pseudo');
    setEmail(storedEmail);
    setPseudo(storedPseudo);

    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      const db = getDatabase();
      const tokenRef = ref(db, 'reset_tokens/' + token);
      get(tokenRef).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const now = Date.now();
          if (now < data.expiration) {
            setIsValidToken(true);
            setMessage('Le lien est valide. Vous pouvez maintenant réinitialiser votre mot de passe.');
          } else {
            setIsValidToken(false);
            setMessage('Ce lien a expiré.');
          }
        } else {
          setIsValidToken(false);
          setMessage('Le lien est invalide.');
        }
      }).catch(error => {
        setMessage("Une erreur s'est produite.");
        console.error("Erreur lors de la vérification du jeton:", error);
      });
    } else {
      setMessage('Aucun jeton fourni.');
    }
  }, [location]);

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setNewPassword(value);
    setPasswordValidation(validatePassword(value));
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    if (value !== newPassword) {
      setError('Les mots de passe ne correspondent pas.');
    } else {
      setError('');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!Object.values(passwordValidation).every(Boolean)) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      await update(userRef, { password: newPassword });
      setMessage('Votre mot de passe a été réinitialisé avec succès.');
      setError('');
    } catch (error) {
      setMessage("Une erreur s'est produite lors de la réinitialisation du mot de passe.");
      console.error('Erreur de réinitialisation:', error);
    }
  };

  const isFormValid = newPassword === confirmPassword && Object.values(passwordValidation).every(Boolean);

  return (
    <div className="reset-pwd-ready">
      <h1>{isValidToken ? `Bienvenue ${pseudo} !` : ''}</h1>
      <p>{message}</p>
      <p>Email: {email}</p>
      <p>Pseudo: {pseudo}</p>
      {isValidToken && (
        <form onSubmit={handlePasswordReset} className="password-reset-form">
          <label>
            Nouveau mot de passe:
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={handlePasswordChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="eye-icon"
              />
            </div>
          </label>
          {isPasswordFocused && (
            <div id="password-validation">
              <span style={{ color: passwordValidation.length ? "green" : "red" }}>
                Au moins 10 caractères
              </span><br />
              <span style={{ color: passwordValidation.uppercase ? "green" : "red" }}>
                Au moins une majuscule
              </span><br />
              <span style={{ color: passwordValidation.number ? "green" : "red" }}>
                Au moins un chiffre
              </span>
            </div>
          )}
          <label>
            Confirmez le nouveau mot de passe:
            <div className="password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-icon"
              />
            </div>
          </label>
          {error && <p className="error">{error}</p>}
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid}
            style={{
              opacity: isFormValid ? 1 : 0.5,
              cursor: isFormValid ? 'pointer' : 'not-allowed'
            }}
          >
            Réinitialiser le mot de passe
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPwdReady;
