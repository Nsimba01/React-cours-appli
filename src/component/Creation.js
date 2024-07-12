import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import '../css/creation.css';

function Creation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pseudo: "",
    password: "",
    confirmPassword: "",
    email: "",
    nom: "",
    prenom: "",
    sexe: "homme",
    dateNaissance: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Implement your form submission logic here
    // For demonstration purposes, let's just log the form data
    console.log("Form submitted:", formData);

    setSuccessMessage("Votre compte a été créé !");
    setErrorMessage(null);

    // Redirect to home or login page after successful creation
    navigate('/connexion');
  };

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
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-label="Mot de passe"
              required
            />
          </label>
          <br />
          <label>
            Confirmation de mot de passe:
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-label="Confirmation de mot de passe"
              required
            />
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
