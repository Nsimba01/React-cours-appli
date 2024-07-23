import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, child } from "firebase/database";
import emailjs from 'emailjs-com';
import '../css/connexion.css'; // Assurez-vous d'importer le CSS

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dbRef = ref(getDatabase());
    try {
      const snapshot = await get(child(dbRef, `users`));
      let emailExists = false;
      let userName = '';
      snapshot.forEach(userSnapshot => {
        if (userSnapshot.val().email === email) {
          emailExists = true;
          userName = userSnapshot.val().name; // Supposons que le nom de l'utilisateur est stocké sous 'name'
        }
      });

      if (emailExists) {
        // Envoyer l'email de réinitialisation
        const templateParams = {
          to_name: userName, // Nom de l'utilisateur récupéré depuis Firebase
          to_email: email, // Email saisi par l'utilisateur dans le formulaire
          from_name: 'Lemba', // Votre nom ou le nom de votre application
          from_email: 'lemba.nsimba.arnaud.freelance@gmail.com', // Votre adresse email configurée dans EmailJS
          message: 'Veuillez ré-initialiser votre mot de passe !' // Message de réinitialisation de mot de passe
        };
        

        emailjs.send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM')
          .then((response) => {
            console.log('Email envoyé avec succès!', response.status, response.text);
            setMessage('Un email de réinitialisation a été envoyé.');
          }, (error) => {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            setMessage('Une erreur s\'est produite lors de l\'envoi de l\'email. Veuillez réessayer.');
          });
      } else {
        setMessage('Aucun compte n\'est associé à cet email.');
      }
    } catch (error) {
      setMessage('Une erreur s\'est produite. Veuillez réessayer.');
      console.error("Erreur lors de la vérification de l'email:", error);
    }
  };

  return (
    <div className="formulaire">
      <h2>Réinitialiser le mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
        <button type="submit" id="aligner-button">Envoyer</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
