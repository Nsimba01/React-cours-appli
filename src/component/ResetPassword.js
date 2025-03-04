import React, { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import emailjs from 'emailjs-com';
import '../css/connexion.css';
import { generateResetToken } from './tokenUtils';

function ResetPassword() {
  // États pour gérer l'email, le message, les pseudos, l'étape et la soumission du formulaire
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [message, setMessage] = useState('');
  const [pseudos, setPseudos] = useState([]);
  const [selectedPseudo, setSelectedPseudo] = useState(localStorage.getItem('pseudo') || '');
  const [step, setStep] = useState('email'); // 'email' ou 'pseudo'
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); // Pour masquer le formulaire après envoi

  // Fonction pour envoyer l'email de réinitialisation
  const sendResetEmail = async (pseudo) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const token = await generateResetToken(pseudo);
        const resetLink = `http://localhost:3000/reset-pwd-process?token=${token}`;
        const templateParams = {
          to_name: userData.name || 'Utilisateur',
          to_email: email,
          reset_link: resetLink,
          pseudo: pseudo, // Le pseudo sera inclus dans le template EmailJS
        };

        await emailjs.send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM');

        localStorage.setItem('email', email);
        localStorage.setItem('pseudo', pseudo);

        setMessage(`Email envoyé pour ${pseudo}.`);
        setIsSubmitted(true); // Masquer le formulaire une fois l'email envoyé
      } else {
        setMessage('Pseudo non trouvé.');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de l\'email.');
      console.error('Erreur EmailJS:', error);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 'email') {
      if (!email.includes('@')) {
        setMessage('Veuillez entrer un email valide.');
        return;
      }
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
      if (associatedPseudos.length === 0) {
        setMessage('Aucun compte n’est associé à cet email.');
        return;
      } else if (associatedPseudos.length === 1) {
        setSelectedPseudo(associatedPseudos[0]);
        await sendResetEmail(associatedPseudos[0]);
      } else {
        setPseudos(associatedPseudos);
        setStep('pseudo');
      }
    } else if (step === 'pseudo') {
      if (!selectedPseudo) {
        setMessage('Veuillez sélectionner un pseudo.');
        return;
      }
      await sendResetEmail(selectedPseudo);
    }
  };

  // Gestion des changements dans le champ email
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    // Active le bouton si l'email semble valide (on vérifie simplement la présence de '@')
    setIsButtonDisabled(!inputEmail.includes('@'));
  };

  // Gestion du changement de sélection du pseudo (étape "pseudo")
  const handlePseudoChange = (e) => {
    setSelectedPseudo(e.target.value);
  };

  return (
    <div className="formulaire">
      <h2>Réinitialiser le mot de passe</h2>
      
      {/* On affiche le formulaire uniquement si l'email n'a pas encore été envoyé */}
      {!isSubmitted && (
        <form onSubmit={handleSubmit}>
          {step === 'email' && (
            <label>
              Mail :
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </label>
          )}

          {step === 'pseudo' && (
            <>
              <p style={{ color: 'green', marginBottom: '10px' }}>
                Merci de choisir le pseudo souhaité.
              </p>
              <div>
                <label>
                  Pseudo :
                  <select
                    value={selectedPseudo}
                    onChange={handlePseudoChange}
                    required
                  >
                    <option value=""> </option>
                    {pseudos.map((pseudo) => (
                      <option key={pseudo} value={pseudo}>
                        {pseudo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}

          <button type="submit" id="aligner-button" disabled={isButtonDisabled}>
            Valider
          </button>
        </form>
      )}

      {/* Affichage du message, que le formulaire soit affiché ou non */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
