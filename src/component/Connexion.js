import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, child } from "firebase/database";
import bcrypt from 'bcryptjs';
import '../css/connexion.css';
import { AuthContext } from './AuthContext';
import { validatePassword, validatePseudo } from './validationUtils';

function Connexion() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pseudo: "",
    password: ""
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [pseudoValidation, setPseudoValidation] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    } else if (name === "pseudo") {
      setPseudoValidation(validatePseudo(value));
    }
  };

  const handleSubmit = async (event) => {
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

    try {
      const dbRef = ref(getDatabase());
      const snapshot = await get(child(dbRef, `users/${formData.pseudo}`));

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const passwordMatch = await bcrypt.compare(formData.password, userData.password);

        if (passwordMatch) {
          setSuccessMessage("Vous êtes connecté !");
          setErrorMessage(null);
          login();
          navigate('/home');
        } else {
          setErrorMessage("Le mot de passe est incorrect.");
          setSuccessMessage(null);
        }
      } else {
        setErrorMessage("Veuillez vous enregistrer !");
        setSuccessMessage(null);
      }
    } catch (error) {
      setErrorMessage("Une erreur s'est produite lors de la connexion/inscription. Veuillez réessayer.");
      setSuccessMessage(null);
      console.error("Erreur lors de l'enregistrement des données:", error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <div className="formulaire">
      <p>Veuillez vous connecter !</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Pseudo:
            <input 
              type="text" 
              name="pseudo" 
              value={formData.pseudo} 
              onChange={handleChange} 
              aria-label="Pseudo" 
              onFocus={() => setIsPseudoFocused(true)} 
              onBlur={() => setIsPseudoFocused(false)} 
              required 
            />
          </label>
          <br />
          {isPseudoFocused && (
            <div>
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
                aria-label="Mot de passe" 
                onFocus={() => setIsPasswordFocused(true)} 
                onBlur={() => setIsPasswordFocused(false)} 
                required 
              />
              <span 
                onClick={toggleShowPassword} 
                style={{ position: "absolute", right: 10, top: 2, cursor: "pointer" }}
              >
                {showPassword ? '\u{1F441}\u{200D}\u{1F5E8}' : '\u{1F441}'}
              </span>
            </div>
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
          <br />
          <input
            type="submit"
            value="Connexion"
            id="aligner-button"
            disabled={!Object.values(passwordValidation).every(value => value) || !pseudoValidation}
          />
          <p onClick={() => navigate('/creation')} style={{ cursor: 'pointer' }}>je veux créer mon espace</p>
          <p onClick={() => navigate('/reset_password')} style={{ cursor: 'pointer' }}>Mot de passe oublié ?</p>
        </div>
      </form>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && (
        <div>
          <p style={{ color: "red" }}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default Connexion;
