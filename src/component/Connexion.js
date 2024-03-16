import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import '../css/connexion.css';

function Connexion() {
    const [formData, setFormData] = useState({
        mail: "",
        password: ""
    });
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFocus = () => {
        setShowPasswordTooltip(true);
    };

    const handleBlur = () => {
        setShowPasswordTooltip(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const auth = getAuth();
        const email = formData.mail;

        // Tentative de création de compte
        createUserWithEmailAndPassword(auth, email, formData.password)
            .then(() => {
                // L'utilisateur a été créé avec succès
                setSuccessMessage("Votre compte a été créé avec succès !");
                setErrorMessage(null);
            })
            .catch((error) => {
                if (error.code === "auth/email-already-in-use") {
                    // L'email est déjà utilisé, connectez-vous plutôt
                    signInWithEmailAndPassword(auth, email, formData.password)
                        .then(() => {
                            // L'authentification réussie
                            setSuccessMessage("Vous êtes connecté !");
                            setErrorMessage(null);
                        })
                        .catch((signInError) => {
                            // L'authentification a échoué
                            setErrorMessage("Mot de passe incorrect. Veuillez réessayer.");
                            setSuccessMessage(null);
                            console.error("Erreur d'authentification:", signInError);
                        });
                } else {
                    // Une erreur s'est produite lors de la création de l'utilisateur
                    setErrorMessage("Une erreur s'est produite lors de la création de votre compte. Veuillez réessayer.");
                    setSuccessMessage(null);
                    console.error("Erreur lors de la création de l'utilisateur:", error);
                }
            });
    };
  
    return (

  

    


      <div  className="formulaire"> 
        
        <p> Veuillez vous connecter  ! </p>


            <form  onSubmit={handleSubmit}>

       
                <div>

                    <pre>

                         <label> Email :       <input type="email" name="mail"  value={formData.mail} onChange={handleChange}/>   </label> <br/>
    
                         Mot de passe : <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}/>
                        {showPasswordTooltip &&  <span className="tooltip">      Au moins 6 caractères</span>}
      
                     </pre>

                     <input type="submit" value="connexion/inscription" id="aligner-button" />

                </div>

             </form>

             
             {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

             {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            
        </div>
    
 

    )

}
export default Connexion;