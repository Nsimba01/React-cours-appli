import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
    <div className="form-row">
      <label htmlFor="pseudo">Pseudo :</label>
      <div className="input-container">
        <input 
          type="text" 
          id="pseudo"
          name="pseudo" 
          value={formData.pseudo} 
          onChange={handleChange} 
          aria-label="Pseudo" 
          onFocus={() => setIsPseudoFocused(true)} 
          onBlur={() => setIsPseudoFocused(false)} 
          required 
        />
      </div>
    </div>
    {isPseudoFocused && (
      <div className="validation-message">
        <span style={{ color: pseudoValidation ? "green" : "red" }}>
          Au moins 5 caractères
        </span>
      </div>
    )}
    <div className="form-row">
      <label htmlFor="motdepasse">Mot de passe :</label>
      <div className="input-container">
        <input 
          type={showPassword ? "text" : "password"} 
          id="motdepasse"
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          aria-label="Mot de passe" 
          onFocus={() => setIsPasswordFocused(true)} 
          onBlur={() => setIsPasswordFocused(false)} 
          required 
        />
        <span className="toggle-password" onClick={toggleShowPassword}>
        {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
    </div>
    {isPasswordFocused && (
      <div className="validation-message">
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
    <div className="form-row">
      <input
        type="submit"
        value="Connexion"
        className="submit-btn"
        disabled={!Object.values(passwordValidation).every(value => value) || !pseudoValidation}
      />
    </div>
    <p onClick={() => navigate('/creation')} className="link">
      Pas encore d'espace ?
    </p>
    <p onClick={() => navigate('/reset_password')} className="link">
      Mot de passe oublié ?
    </p>
  </form>
  {successMessage && <p className="success">{successMessage}</p>}
  {errorMessage && (
    <div className="error">
      <p>{errorMessage}</p>
    </div>
  )}
</div>


  );
}

export default Connexion;
