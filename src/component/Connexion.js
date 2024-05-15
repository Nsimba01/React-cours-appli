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
    const [isPasswordFocused, setIsPasswordFocused] = useState(false); // État pour suivre le focus sur le champ de mot de passe

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
        if (name === "password") {
            validatePassword(value);
        }
    };

    const validatePassword = (password) => {
        setPasswordValidation({
            length: password.length >= 10,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password)
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!Object.values(passwordValidation).every(value => value)) {
            setErrorMessage("Le mot de passe ne remplit pas les critères de validation.");
            setSuccessMessage(null);
            return;
        }

        try {
            const hashedPassword = await encryptPassword(formData.password);
            const db = getDatabase();
            await set(ref(db, 'users/' + formData.pseudo), {
                pseudo: formData.pseudo,
                password: hashedPassword
            });

            setSuccessMessage("Votre compte a été créé avec succès !");
            setErrorMessage(null);
            setFormData({ pseudo: "", password: "" });
            setPasswordValidation({ length: false, uppercase: false, number: false });
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la création de votre compte. Veuillez réessayer.");
            setSuccessMessage(null);
            console.error("Erreur lors de l'enregistrement des données:", error);
        }
    };

    const encryptPassword = async (password) => {
        try {
            const saltRounds = 10;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            console.error("Erreur lors du hachage du mot de passe:", error);
            throw new Error("Erreur lors du hachage du mot de passe");
        }
    };

    return (
        <div className="formulaire">
            <p>Veuillez vous connecter !</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
               

                        <pre> 
 
                        Pseudo:      <input type="text" name="pseudo" value={formData.pseudo} onChange={handleChange}aria-label="Pseudo" />
 
                        </pre>
                    </label>
                    <br />
                    <label>
                        Mot de passe:
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            aria-label="Mot de passe"
                        />
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
                        value="Connexion/Inscription"
                        id="aligner-button"
                        disabled={!Object.values(passwordValidation).every(value => value)}
                    />
                </div>
            </form>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
    );
}

export default Connexion;
