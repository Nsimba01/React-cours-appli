import React, { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";
import bcrypt from 'bcryptjs'; // Importer bcrypt pour le hachage sécurisé
import '../css/connexion.css';

function Connexion() {
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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
        if (name === "password") {
            validatePassword(value);
        }
    };

    const validatePassword = (password) => {
        const newPasswordValidation = {
            length: password.length >= 10,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password)
        };
        setPasswordValidation(newPasswordValidation);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Vérifier si tous les critères de validation du mot de passe sont satisfaits
            if (Object.values(passwordValidation).every(value => value)) {
                // Hacher le mot de passe avant l'envoi à Firebase
                const hashedPassword = await encryptPassword(formData.password);

                // Enregistrer les données dans Firebase
                const db = getDatabase();
                await set(ref(db, 'users/' + formData.pseudo), {
                    pseudo: formData.pseudo,
                    password: hashedPassword
                });

                setSuccessMessage("Votre compte a été créé avec succès !");
                setErrorMessage(null);
                setFormData({ pseudo: "", password: "" }); // Effacer les champs après envoi
                setPasswordValidation({
                    length: false,
                    uppercase: false,
                    number: false
                });
            } else {
                setErrorMessage("Le mot de passe ne remplit pas les critères de validation.");
                setSuccessMessage(null);
            }
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la création de votre compte. Veuillez réessayer.");
            setSuccessMessage(null);
            console.error("Erreur lors de l'enregistrement des données:", error);
        }
    };

    // Fonction de hachage sécurisé du mot de passe
    const encryptPassword = async (password) => {
        try {
            const saltRounds = 10; // Nombre de tours de salage pour bcrypt
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log("Hachage du mot de passe généré avec succès :", hashedPassword); // Ajout d'un journal pour afficher le hachage généré
            return hashedPassword;
        } catch (error) {
            console.error("Erreur lors du hachage du mot de passe:", error);
            throw new Error("Erreur lors du hachage du mot de passe");
        }
    };

    return (
        <div className="formulaire">
            <p> Veuillez vous connecter ! </p>
            <form onSubmit={handleSubmit}>
                <div>

                    <pre> 
                    <label> Pseudo :       <input type="text" name="pseudo" value={formData.pseudo} onChange={handleChange} /> </label> <br />
                    <label> Mot de passe : <input type="password" name="password" value={formData.password} onChange={handleChange} /> </label> <br />
                    </pre>
                    
                    <div>
                        <span style={{ color: passwordValidation.length ? "green" : "red" }}>Au moins 10 caractères</span> <br />
                        <span style={{ color: passwordValidation.uppercase ? "green" : "red" }}>Au moins une majuscule</span> <br />
                        <span style={{ color: passwordValidation.number ? "green" : "red" }}>Au moins 1 chiffre</span>
                    </div>
                    <input type="submit" value="Connexion/Inscription" id="aligner-button" disabled={!Object.values(passwordValidation).every(value => value)} />
                </div>
            </form>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
    );
}

export default Connexion;
