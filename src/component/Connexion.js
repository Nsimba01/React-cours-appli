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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
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
                    <input type="submit" value="Connexion/Inscription" id="aligner-button" />
                    </pre>
                </div>
            </form>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
    );
}

export default Connexion;
