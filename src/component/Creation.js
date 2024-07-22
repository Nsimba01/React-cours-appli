import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set, get } from "firebase/database";
import bcrypt from 'bcryptjs';

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

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    }
  };

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

      // Vérifier si l'utilisateur existe déjà
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setErrorMessage("Ce pseudo est déjà utilisé. Veuillez en choisir un autre.");
        return;
      }

      // Hash du mot de passe avant de le stocker
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      // Création de l'objet utilisateur à stocker
      const userData = {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance,
        password: hashedPassword,
      };

      // Enregistrement de l'utilisateur dans la base de données
      await set(userRef, userData);

      setSuccessMessage("Votre compte a été créé avec succès !");
      setErrorMessage(null);

      // Redirection vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de la création du compte :", error);
      setErrorMessage("Une erreur s'est produite lors de la création du compte. Veuillez réessayer.");
    }
  };

  const validatePassword = (password) => ({
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });

  return (
    <div className="formulaire">
      <p>Créer votre espace !</p>
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
              required
            />
          </label>
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
                required
              />
              <span 
                onClick={toggleShowPassword} 
                style={{ position: "absolute", right: 10, top: 2, cursor: "pointer" }}
              >
                {showPassword ? '\u{1F441}\u{200D}\u{1F5E8}' : '\u{1F441}'}
              </span>
            </div>
            <br />
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
          </label>
          <br />
          <label>
            Mail:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-label="Mail"
              required
            />
          </label>
          <br />
          <label>
            Nom:
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              aria-label="Nom"
              required
            />
          </label>
          <br />
          <label>
            Prénom:
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              aria-label="Prénom"
              required
            />
          </label>
          <br />
          <label>
            Sexe:
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              required
            >
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </label>
          <br />
          <label>
            Date de naissance:
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              aria-label="Date de naissance"
              required
            />
          </label>
          <br />
          <input
            type="submit"
            value="Création"
            id="aligner-button"
          />
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

export default Creation;