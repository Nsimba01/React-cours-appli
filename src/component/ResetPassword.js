import React, { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import emailjs from 'emailjs-com';
import '../css/connexion.css';
import { generateResetToken } from './tokenUtils'; // Importez la fonction de génération de token

function ResetPassword() {
  const [email, setEmail] = useState(localStorage.getItem('email') || ''); // Pré-remplir si l'email existe déjà dans localStorage
  const [message, setMessage] = useState('');
  const [pseudos, setPseudos] = useState([]);
  const [selectedPseudo, setSelectedPseudo] = useState(localStorage.getItem('pseudo') || ''); // Pré-remplir si le pseudo existe déjà dans localStorage
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPseudo) {
      setMessage('Veuillez sélectionner un pseudo.');
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${selectedPseudo}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const token = await generateResetToken(selectedPseudo); // Générez le token
        const resetLink = `http://localhost:3000/reset-pwd-process?token=${token}`;

        // Mettez à jour templateParams avec le vrai nom de l'utilisateur et le pseudo
        const templateParams = {
          to_name: userData.name || 'Utilisateur', // Remplacez par le nom de l'utilisateur ou utilisez 'Utilisateur' par défaut
          to_email: email,
          reset_link: resetLink,
          pseudo: selectedPseudo // Ajoutez le pseudo ici
        };

        await emailjs.send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM');

        // Stocker les informations dans localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('pseudo', selectedPseudo);

        setMessage(`Email envoyé pour ${selectedPseudo}`);
      } else {
        setMessage('Pseudo non trouvé.');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de l\'email.');
      console.error('Erreur EmailJS:', error);
    }
  };

  const handleEmailBlur = async () => {
    if (!email) return;

    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);

    const associatedPseudos = [];
    snapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.email === email) {
        associatedPseudos.push(userSnapshot.key);
      }
    });

    if (associatedPseudos.length > 1) {
      setPseudos(associatedPseudos);
      setIsButtonDisabled(false);
    } else if (associatedPseudos.length === 1) {
      setSelectedPseudo(associatedPseudos[0]);
      setIsButtonDisabled(false);
    } else {
      setPseudos([]);
      setSelectedPseudo('');
      setIsButtonDisabled(true);
      setMessage('Aucun compte associé à cet email.');
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
            onBlur={handleEmailBlur}
            required
          />
        </label>

        {pseudos.length > 1 && (
          <div>
            <label>
              Sélectionnez un pseudo:
              <select
                value={selectedPseudo}
                onChange={(e) => setSelectedPseudo(e.target.value)}
                required
              >
                <option value="">-- Sélectionnez un pseudo --</option>
                {pseudos.map((pseudo) => (
                  <option key={pseudo} value={pseudo}>
                    {pseudo}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <button type="submit" id="aligner-button" disabled={isButtonDisabled}>
          Envoyer
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
