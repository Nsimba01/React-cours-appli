import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import bcrypt from 'bcryptjs';
import '../css/resetPwdReady.css';
import { validatePassword } from './validationUtils';

function ResetPwdReady() {
  const [message, setMessage] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const emailFromUrl = query.get('email');
    setEmail(emailFromUrl);

    if (token) {
      const db = getDatabase();
      const tokenRef = ref(db, `reset_tokens/${token}`);
      get(tokenRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const now = Date.now();

            if (now < data.expiration) {
              setIsValidToken(true);
              setMessage('Le lien est valide. Tu peux à présent réinitialiser ton mot de passe.');
              if (data.pseudo) {
                setPseudo(data.pseudo);
              } else {
                setMessage('Pseudo introuvable dans les données du lien.');
              }
            } else {
              setIsValidToken(false);
              setMessage('Ce lien a expiré.');
            }
          } else {
            setIsValidToken(false);
            setMessage('Le lien est invalide.');
          }
        })
        .catch(error => {
          setMessage("Une erreur s'est produite.");
          console.error("Erreur lors de la vérification du jeton :", error);
        });
    } else {
      setMessage('Aucun jeton fourni.');
    }
  }, [location]);

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setNewPassword(value);
    setPasswordValidation(validatePassword(value));
    setShowInvalidMessage(false);

    if (confirmPassword) {
      setConfirmPasswordValidation(validatePassword(confirmPassword));
      if (confirmPassword !== value) {
       
      } else {
        setError('');
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    setConfirmPasswordValidation(validatePassword(value));
    setShowInvalidMessage(false);
    
    if (value !== newPassword) {
   
    } else {
      setError('');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    if (
      !Object.values(passwordValidation).every(Boolean) ||
      !Object.values(confirmPasswordValidation).every(Boolean)
    ) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      setConfirmationEmail(email);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await update(userRef, { password: hashedPassword });
      setMessage("Ton mot de passe a été modifié avec succès.");
      setError('');
      setEmail('');
      setTimeout(() => {
        navigate('/connexion');
      }, 5000);
    } catch (error) {
      setMessage("Une erreur s'est produite lors de la réinitialisation du mot de passe.");
      console.error('Erreur de réinitialisation :', error);
    }
  };

  const handleButtonClick = (e) => {
    if (!isFormValid) {
      e.preventDefault();
      setShowInvalidMessage(true);
    } else {
      handlePasswordReset(e);
    }
  };

  const isFormValid =
    newPassword === confirmPassword &&
    Object.values(passwordValidation).every(Boolean) &&
    Object.values(confirmPasswordValidation).every(Boolean);

  return (
    <div className="reset-pwd-ready">

      {isValidToken && (
        <form className="password-reset-form">
          <h4>Réinitialisation du mot de passe</h4>
          {message && (
            <div>
              <p style={message === 'Le lien est valide. Tu peux à présent réinitialiser ton mot de passe.' ? { color: 'RGB(51,204,51)',
                marginBottom: '25px',fontWeight:'normal',fontSize:'15px'
               } : {}}>
                {message}
              </p>
              {message === 'Le lien est valide. Tu peux à présent réinitialiser ton mot de passe.' && (
                <div className="user-info">
                  <p>Pseudo :<strong style={{fontSize:'15px'}}> {pseudo}  </strong></p>
                  <p>Mail : <strong style={{fontSize:'15px'}}> {email}</strong></p>
                </div>
              )}
              {confirmationEmail && (
                <p style={{ color: 'green' }}>
                  Un mail de confirmation a été envoyé à ton adresse « {confirmationEmail} ».
                </p>
              )}
            </div>
          )}
          <br />
          <label>
            Nouveau mot de passe
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
                style={{
                 marginTop: '-5px',
                }}
                className="eye-icon"
              />
            </div>
          </label>
          {isPasswordFocused && (
            <div id="password-validation">
              <span style={{ color: passwordValidation.length ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins 10 caractères
              </span><br />
              <span style={{ color: passwordValidation.uppercase ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins 1 majuscule
              </span><br />
              <span style={{ color: passwordValidation.number ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins un chiffre
              </span>
            </div>
          )}
          <label>
            Confirmation du nouveau mot de passe
            <div className="password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                required
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  marginTop: '-5px',
                 }}
                className="eye-icon"
              />
            </div>
          </label>
          {isConfirmPasswordFocused && (
            <div id="confirm-password-validation">
              <span style={{ color: confirmPasswordValidation.length ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins 10 caractères
              </span><br />
              <span style={{ color: confirmPasswordValidation.uppercase ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins 1 majuscule
              </span><br />
              <span style={{ color: confirmPasswordValidation.number ? "RGB(51,204,51)" : "red",fontStyle:'normal',fontSize:'13px' }}>
                Au moins 1 chiffre
              </span>
            </div>
          )}
         
          {error && <p className="error">{error}</p>}
          <button
            type="button"
            className="submit-btn"
            onClick={handleButtonClick}
            style={{
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              marginBottom: '15px',
              backgroundColor: isFormValid ? 'RGB(51,204,51)' : ''
             
            }}
          >
            Valider
          </button>

          {showInvalidMessage && (
            <p style={{ color: 'red', fontWeight: 'normal', fontStyle: 'italic' }}>
              Ton nouveau mot de passe est invalide ou les 2 saisies ne sont pas identiques
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default ResetPwdReady;