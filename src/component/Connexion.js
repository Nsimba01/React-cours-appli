// src/components/Connexion.js
import React, { useState, useContext } from "react";
import { getDatabase, ref, get, child } from "firebase/database";
import bcrypt from 'bcryptjs';
import { useNavigate } from 'react-router-dom';
import '../css/connexion.css';
import { AuthContext } from './AuthContext';

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

  const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData((prevState) => ({ ...prevState, [name]: value }));
      if (name === "password") {
          validatePassword(value);
      } else if (name === "pseudo") {
          validatePseudo(value);
      }
  };

  const validatePassword = (password) => {
      setPasswordValidation({
          length: password.length >= 10,
          uppercase: /[A-Z]/.test(password),
          number: /[0-9]/.test(password)
      });
  };

  const validatePseudo = (pseudo) => {
      setPseudoValidation(pseudo.length >= 5);
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
                  login();  // Mise à jour de l'état de connexion
                  navigate('/home');  // Redirection après connexion réussie
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

  return (
      <div className="formulaire">
          <p>Veuillez vous connecter !</p>
          <form onSubmit={handleSubmit}>
              <div>
                  <label>
                      <pre>
                          Pseudo:      <input type="text" name="pseudo" value={formData.pseudo} onChange={handleChange} aria-label="Pseudo" onFocus={() => setIsPseudoFocused(true)} onBlur={() => setIsPseudoFocused(false)} />
                      </pre>
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
                      Mot de passe: <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} aria-label="Mot de passe" />
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
                      id="aligner-button"
                      disabled={!Object.values(passwordValidation).every(value => value) || !pseudoValidation}
                  />
              </div>
          </form>
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
  );
}

export default Connexion;
