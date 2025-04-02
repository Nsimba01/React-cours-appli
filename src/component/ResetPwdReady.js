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

    if (token) {
      const db = getDatabase();
      const tokenRef = ref(db, `reset_tokens/${token}`);
      get(tokenRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Données du token :", data); // Ajout pour le débogage
            const now = Date.now();

            if (now < data.expiration) {
              setIsValidToken(true);
              setMessage('Le lien est valide. Tu peux à présent réinitialiser ton mot de passe.');

              // Vérification du pseudo dans les données du token
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

    // Si le champ de confirmation contient déjà une valeur, on vérifie la correspondance et la validité
    if (confirmPassword) {
      setConfirmPasswordValidation(validatePassword(confirmPassword));
      if (confirmPassword !== value) {
        setError('Les mots de passe ne correspondent pas.');
      } else {
        setError('');
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    setConfirmPasswordValidation(validatePassword(value));
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

      // Hashage du mot de passe avec bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mise à jour du mot de passe dans Firebase
      await update(userRef, { password: hashedPassword });
      setMessage('Votre mot de passe a été réinitialisé avec succès.');
      setError('');

      // Redirection vers la page de connexion après succès
      setTimeout(() => {
        navigate('/connexion');
      }, 2000); // 2 secondes de délai avant la redirection
    } catch (error) {
      setMessage("Une erreur s'est produite lors de la réinitialisation du mot de passe.");
      console.error('Erreur de réinitialisation :', error);
    }
  };

  // On vérifie que les deux champs sont identiques et que tous les critères sont validés
  const isFormValid =
    newPassword === confirmPassword &&
    Object.values(passwordValidation).every(Boolean) &&
    Object.values(confirmPasswordValidation).every(Boolean);

  return (
    <div className="reset-pwd-ready">
      <h3>{isValidToken ? `Bienvenue ${pseudo || ''},` : ''}</h3>

      {isValidToken && (
        <form onSubmit={handlePasswordReset} className="password-reset-form">
          <h4>Réinitialisation du mot de passe</h4>
          <p>{message}</p>
          <br/>
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
                className="eye-icon"
              />
            </div>
          </label>
          {isConfirmPasswordFocused && (
            <div id="confirm-password-validation">
              <span style={{ color: confirmPasswordValidation.length ? "green" : "red" }}>
                Au moins 10 caractères
              </span><br />
              <span style={{ color: confirmPasswordValidation.uppercase ? "green" : "red" }}>
                Au moins une majuscule
              </span><br />
              <span style={{ color: confirmPasswordValidation.number ? "green" : "red" }}>
                Au moins un chiffre
              </span>
            </div>
          )}
          {isConfirmPasswordFocused && confirmPassword !== newPassword && (
            <p style={{ color: 'red' }}>Les mots de passe doivent être identiques.</p>
          )}
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
            Valider
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPwdReady;
