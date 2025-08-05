import React, { useState, useContext } from "react";
import '../css/login_hover.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { validatePassword, validatePseudo, handleLogin } from './validationUtils';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import '../css/button-width-height-global.css';

function LoginHover() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);
  const [pseudoValidation, setPseudoValidation] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const checkUserExists = async (username) => {
    if (username) {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        return snapshot.exists();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur :', error);
        return false;
      }
    }
    return false;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    } else if (name === "username") {
      setPseudoValidation(validatePseudo(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Object.values(passwordValidation).every(v => v)) {
      setErrorMessage("Le mot de passe ne remplit pas les critères de validation.");
      setSuccessMessage(null);
      return;
    }

    if (!pseudoValidation) {
      setErrorMessage("Le pseudo doit avoir au moins 5 caractères.");
      setSuccessMessage(null);
      return;
    }

    const userExists = await checkUserExists(formData.username);
    if (!userExists) {
      setErrorMessage("Ton pseudo est incorrect.");
      setSuccessMessage(null);
      return;
    }

    handleLogin(
      formData.username,
      formData.password,
      login,
      navigate,
      (error) => setErrorMessage(error),
      (message) => setSuccessMessage(message)
    );
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const handleCreateAccount = () => navigate('/creation');

  // Vérifie si le formulaire est prêt pour la soumission
  const isFormValid = pseudoValidation && Object.values(passwordValidation).every(v => v);

  return (
    <div className="form-login">
      <form onSubmit={handleSubmit}>
        <div>
          {/* Pseudo */}
          <p>
            <label style={{ fontSize: '15px', marginBottom: "10px" }}>
              Pseudo
            </label>
          </p>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setIsPseudoFocused(true)}
            onBlur={() => setIsPseudoFocused(false)}
            aria-invalid={!pseudoValidation}
            aria-describedby="pseudo-validation"
            style={{ marginTop: "-5px", width: "100%" }}
          />
          {isPseudoFocused && (
            <div id="pseudo-validation">
              <span style={{ color: pseudoValidation ? "white" : "red" }}>
                Au moins 5 caractères
              </span>
            </div>
          )}
          <br />
          {/* Mot de passe */}
          <label style={{ fontSize: '15px', marginTop: "-5px" }}>
            Mot de passe <br />
          </label>
          <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={handlePasswordBlur}
              aria-invalid={!Object.values(passwordValidation).every(Boolean)}
              aria-describedby="password-validation"
              style={{ width: "100%", paddingRight: "30px" }}
            />
            <span
              onClick={toggleShowPassword}
              style={{ position: "absolute", right: 10, top: "33%", transform: "translateY(-50%)", cursor: "pointer" }}
              className="toggle-password-login-hover"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <br />
          {isPasswordFocused && (
            <div id="password-validation">
              <span style={{ color: passwordValidation.length ? "white" : "red" }}>
                Au moins 10 caractères
              </span>
              <br />
              <span style={{ color: passwordValidation.uppercase ? "white" : "red" }}>
                Au moins une majuscule
              </span>
              <br />
              <span style={{ color: passwordValidation.number ? "white" : "red" }}>
                Au moins 1 chiffre
              </span>
            </div>
          )}
          {/* Bouton Connexion */}
          <button
            type="submit"
            style={{
              backgroundColor: isFormValid ? '#4caf50' : undefined,
              fontSize: '15px',
              cursor: 'pointer',
              color: isFormValid ?'white' : 'black',
              width: "100%",
              borderRadius: '7px'
            }}
          >
            Connexion
          </button>

          <br /><br />
          <p onClick={handleCreateAccount} className="linkHoverForm"
            style={{ cursor: 'pointer', marginBottom: "0px", textDecoration: 'underline' }}>
            Pas encore d'espace ?
          </p>
          <p onClick={() => navigate('/reset_password')} className="linkHoverForm"
            style={{ cursor: 'pointer', marginTop: "0px",marginBottom:"18px", textDecoration: 'underline' }}>
            Mot de passe oublié ?
          </p>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </form>
      {successMessage && <p style={{ color: "white" }}>{successMessage}</p>}
    </div>
  );
}

export default LoginHover;
