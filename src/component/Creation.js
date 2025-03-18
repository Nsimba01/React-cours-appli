import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set, get } from "firebase/database";
import bcrypt from 'bcryptjs';
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
    sexe: "homme",
    dateNaissance: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  });

  const [showCriteria, setShowCriteria] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => ({
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  useEffect(() => {
    if (Object.values(passwordValidation).every(Boolean)) {
      const timer = setTimeout(() => {
        setShowCriteria(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowCriteria(true);
    }
  }, [passwordValidation]);

  const toggleShowPassword = () => {
    setShowPassword(prevState => !prevState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Object.values(passwordValidation).every(Boolean)) {
      setErrorMessage("Veuillez vérifier que tous les critères de mot de passe sont remplis.");
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, 'users/' + formData.pseudo);

      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setErrorMessage("Ce pseudo est déjà utilisé. Veuillez en choisir un autre.");
        return;
      }

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

      setTimeout(() => {
        navigate('/connexion');
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de la création du compte :", error);
      setErrorMessage("Une erreur s'est produite lors de la création du compte. Veuillez réessayer.");
    }
  };

  return (
    <div className="formulaire">
      <p>Créer votre espace !</p>
      <form onSubmit={handleSubmit}>
        {/* Pseudo */}
        <div className="form-row">
          <label>Pseudo:</label>
          <div className="input-container">
            <input
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              aria-label="Pseudo"
              required
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="form-row">
          <label>Mot de passe:</label>
          <div className="input-container" style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-label="Mot de passe"
              required
              style={{ width: "100%" }}
            />
            <span
              onClick={toggleShowPassword}
              style={{ position: "absolute", right: 10, top: 2, cursor: "pointer" }}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Critères de mot de passe */}
         
        </div>

        {showCriteria && (
            <div className="criteria" style={{ marginTop: "10px" }}>
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
          <div className="input-container">
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              aria-label="Nom"
              required
            />
          </div>
        </div>

        {/* Prénom */}
        <div className="form-row">
          <label>Prénom:</label>
          <div className="input-container">
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              aria-label="Prénom"
              required
            />
          </div>
        </div>

        {/* Sexe */}
        <div className="form-row">
          <label>Sexe:</label>
          <div className="input-container">
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              required
            >
              <option value="vide"> (vide) </option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
        </div>

        {/* Date de naissance */}
        <div className="form-row">
          <label>Date de naissance:</label>
          <div className="input-container">
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
          <div className="input-container">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-label="Mail"
              required
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="form-row">
          <input
            type="submit"
            value="Création"
            id="aligner-button"
          />
        </div>
      </form>

      {/* Affichage des messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default Creation;
