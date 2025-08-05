import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set, get } from "firebase/database";
import bcrypt from 'bcryptjs';
import '../css/button-width-height-global.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../css/creation.css';

function Creation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pseudo: "",
    password: "",
    email: "",
    nom: "",
    prenom: "",
    sexe: "vide",
    dateNaissance: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  });
  const [pseudoValidation, setPseudoValidation] = useState({
    length: false,
    available: false
  });
  const [emailValidation, setEmailValidation] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const validatePassword = (password) => ({
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });

  const validatePseudo = async (pseudo) => {
    const lengthValid = pseudo.length >= 5;
    let available = false;
    if (lengthValid) {
      const db = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      const snapshot = await get(userRef);
      available = !snapshot.exists();
    }
    setPseudoValidation({ length: lengthValid, available });
  };

  const validateEmail = (email) => {
    setEmailValidation(email.includes('@'));
  };

  const handleChangeSexe = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      sexe: value,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    } else if (name === "pseudo") {
      validatePseudo(value);
    } else if (name === "email") {
      validateEmail(value);
    }
  };

  const handleNomChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      nom: value.toUpperCase(),
    }));
  };

  const handlePrenomChange = (e) => {
    const value = e.target.value;
    const formatted = value
      .split(/([\s-])/)  // conserve espaces et traits d'union
      .map((part) => {
        if (part.trim().length > 0 && !/[\s-]/.test(part)) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part;
      })
      .join('');
    setFormData((prevState) => ({ ...prevState, prenom: formatted }));
  };

useEffect(() => {
  const { nom, prenom, sexe, dateNaissance } = formData;
  const isPseudoValid = pseudoValidation.length && pseudoValidation.available;
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isEmailValid = emailValidation;

  const isFormValid = isPseudoValid && isPasswordValid && isEmailValid &&
                      nom && prenom && sexe !== "vide" && dateNaissance;
  setIsFormValid(isFormValid);
}, [pseudoValidation, passwordValidation, emailValidation, formData]);


  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    setShowCriteria(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    setShowCriteria(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid) {
      setErrorMessage("Veuillez vérifier que tous les critères sont remplis.");
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, 'users/' + formData.pseudo);
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const userData = {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance,
        password: hashedPassword,
      };
      await set(userRef, userData);
      setSuccessMessage("Votre compte a été créé avec succès !");
      setErrorMessage(null);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (error) {
      console.error("Erreur lors de la création du compte :", error);
      setErrorMessage("Une erreur s'est produite lors de la création du compte. Veuillez réessayer.");
    }
  };

  return (
    <div className="formulaireCreate" id="creation-form">
      <p>Création de mon espace</p>
      <form onSubmit={handleSubmit}>
        {/* Pseudo */}
        <div className="form-row">
          <label>Pseudo:</label>
          <div className="input-container-create">
            <input
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              aria-label="Pseudo"
              required
              onFocus={() => setIsPseudoFocused(true)}
              onBlur={() => setIsPseudoFocused(false)}
            />
          </div>
        </div>
        {isPseudoFocused && (
          <div className="validation-message">
            <span style={{ color: pseudoValidation.length ? "green" : "red" }}>
              Au moins 5 caractères
            </span>
            <br />
            <span style={{ color: pseudoValidation.available ? "green" : "red" }}>
              Pseudo disponible
            </span>
          </div>
        )}

        {/* Mot de passe */}
        <div className="form-row">
          <label>Mot de passe:</label>
          <div className="input-container-create" style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-label="Mot de passe"
              required
              style={{ width: "87%" }}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
            />
            <span
              onClick={toggleShowPassword}
              style={{ position: "absolute", right: 10, top: 2, cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        {isPasswordFocused && showCriteria && (
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

        {/* Nom */}
        <div className="form-row">
          <label>Nom:</label>
          <div className="input-container-create">
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleNomChange}
              aria-label="Nom"
              required
            />
          </div>
        </div>

        {/* Prénom */}
        <div className="form-row">
          <label htmlFor="prenom">Prénom :</label>
          <div className="input-container-create">
            <input
              id="prenom"
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handlePrenomChange}
              aria-label="Prénom"
              required
              style={{ width: '87%' }}
            />
          </div>
        </div>

        {/* Sexe */}
        <div className="form-row">
          <label>Sexe:</label>
          <div className="input-container-create">
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChangeSexe}
              required
            >
              <option value="vide">(vide)</option>
              <option value="femme">Fille</option>
              <option value="homme">Garçon</option>
            </select>
          </div>
        </div>

        {/* Date de naissance */}
        <div className="form-row-create">
          <label>Date de naissance: </label>
          <div className="input-container-create">
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              aria-label="Date de naissance"
              required
            />
          </div>
        </div>

        {/* Mail */}
        <div className="form-row">
          <label>Mail:</label>
          <div className="input-container-create">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-label="Mail"
              required
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              style={{ marginBottom: '10px' }}
            />
          </div>
        </div>
        {isEmailFocused && (
          <div className="validation-message">
            <span style={{ color: emailValidation ? "green" : "red" }}>
              Une adresse email valide
            </span>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="form-row">
          <input
            type="submit"
            value="Création"
            id="aligner-button-create"
            style={{
              backgroundColor: isFormValid ? 'rgb(146,208,80)': 'lightgray',
    
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease'
            }}
            disabled={!isFormValid}
          />
        </div>

        {/* Lien "Déjà un espace ?" */}
        <p
         className="link"
          onClick={() => navigate('/connexion')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'underline',
            color: 'black',
            fontStyle: 'italic',
            fontSize: '13px',
          }}
        >
          Déjà un espace ?
        </p>
      </form>

      {/* Affichage des messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default Creation;
