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
  const [showPassword, setShowPassword] = useState(false);

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
    handleLogin(
      formData.username, 
      formData.password, 
      login, 
      navigate, 
      (error) => {
        setErrorMessage(error);
      },
      setSuccessMessage
    );
  };

  const toggleShowPassword = () => {
    setShowPassword(prevState => !prevState);
  };

  const handleCreateAccount = () => {
    navigate('/creation');
  };

  return (
    <div className="form-login">
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Pseudo: <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              onFocus={() => setIsPseudoFocused(true)} 
              onBlur={() => setIsPseudoFocused(false)} 
              aria-invalid={!pseudoValidation}
              aria-describedby="pseudo-validation"
            />
          </label>
          {isPseudoFocused && (
            <div id="pseudo-validation">
              <span style={{ color: pseudoValidation ? "green" : "red" }}>
                Au moins 5 caractères
              </span>
            </div>
          )}
          <br />
          <label>
            Mot de passe: 
            <div style={{ position: "relative", display: "inline-block" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                onFocus={() => setIsPasswordFocused(true)} 
                onBlur={() => setIsPasswordFocused(false)} 
                aria-invalid={!Object.values(passwordValidation).every(Boolean)}
                aria-describedby="password-validation"
              />
              <span 
                onClick={toggleShowPassword} 
                style={{ position: "absolute", right: 10, top: 5, cursor: "pointer" }}
              >
                {showPassword ? '\u{1F441}\u{200D}\u{1F5E8}' : '\u{1F441}'}
              </span>
            </div>
          </label>
          <br />
          {isPasswordFocused && (
            <div id="password-validation">
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

          <br/> <br/>

          <p onClick={handleCreateAccount} style={{ cursor: 'pointer' }}>Je  veux  créer mon espace </p>

          <p onClick={() => navigate('/reset_password')} style={{ cursor: 'pointer' }}>Mot de passe oublié ?</p>
          
 

         {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          
     
          <br /><br />
       
        </div>
      </form>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
  
    </div>
  );
}

export default LoginHover;
