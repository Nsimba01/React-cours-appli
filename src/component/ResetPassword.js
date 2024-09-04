import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import emailjs from 'emailjs-com';
import '../css/connexion.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = getDatabase();
    
    try {
      // Vérifiez si l'email existe dans la base de données
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      let userFound = false;
      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData.email === email) {
          userFound = true;
        }
      });

      if (!userFound) {
        setMessage('Aucun compte associé à cet email.');
        return;
      }

      // Si l'email existe, générer un token de réinitialisation
      const token = generateUniqueToken(); // Une fonction pour générer un jeton unique
      const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes
      await set(ref(db, 'reset_tokens/' + token), { expiration });

      const templateParams = {
        to_name: 'Utilisateur', // Remplacez par le nom de l'utilisateur ou obtenez-le d'une autre manière
        to_email: email,
        reset_link: `http://localhost:3000/reset-pwd-process?token=${token}`
      };

      await emailjs.send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM');
      setMessage('Un email de réinitialisation a été envoyé.');
    } catch (error) {
      setMessage('Une erreur s\'est produite lors de l\'envoi de l\'email. Veuillez réessayer.');
      console.error("Erreur lors de l'envoi de l'email:", error);
    }
  };

  const generateUniqueToken = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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
