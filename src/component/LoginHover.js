// src/component/LoginHover.js
import React, { useState, useContext } from "react";
import '../css/login_hover.css';
import { validatePassword, validatePseudo, handleLogin } from './validationUtils';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [pseudoValidation, setPseudoValidation] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    } else if (name === "username") {
      setPseudoValidation(validatePseudo(value));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!Object.values(passwordValidation).every(value => value)) {
      setErrorMessage("Le mot de passe ne remplit pas les critères de validation.");
      setSuccessMessage(null);
      return;
    }

    if (!pseudoValidation) {
      setErrorMessage("Le pseudo ne remplit pas les critères de validation.");
      setSuccessMessage(null);
      return;
    }

    handleLogin(formData.username, formData.password, login, navigate, setErrorMessage, setSuccessMessage);
  };

  return (
    <div className="form-login">
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Pseudo: <input type="text" name="username" value={formData.username} onChange={handleChange} onFocus={() => setIsPseudoFocused(true)} onBlur={() => setIsPseudoFocused(false)} />
          </label>
          {isPseudoFocused && (
            <div>
              <span style={{ color: pseudoValidation ? "green" : "red" }}>
                Au moins 5 caractères
              </span>
            </div>
          )}
          <br />
          <label>
            Mot de passe: <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} />
          </label>
          <br />
          {isPasswordFocused && (
            <div>
              <span style={{ color: passwordValidation.length ? "green" : "red" }}>
                Au moins 10 caractères
              </span>
              <br />
              <span style={{ color: passwordValidation.uppercase ? "green" : "red" }}>
                Au moins une majuscule
              </span>
              <br />
              <span style={{ color: passwordValidation.number ? "green" : "red" }}>
                Au moins 1 chiffre
              </span>
            </div>
          )}
          <input
            type="submit"
            value="Connexion"
            disabled={!Object.values(passwordValidation).every(value => value) || !pseudoValidation}
          />
          <br /><br />
          <b>Sinon créer un compte !</b>
        </div>
      </form>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default LoginHover;
