import React, { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import emailjs from 'emailjs-com';
import '../css/connexion.css';
import { generateResetToken } from './tokenUtils';

function ResetPassword() {
  // États
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [message, setMessage] = useState('');
  const [pseudos, setPseudos] = useState([]);
  const [selectedPseudo, setSelectedPseudo] = useState(localStorage.getItem('pseudo') || '');
  const [step, setStep] = useState('email');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonText, setButtonText] = useState('Vérifier'); // Gestion du texte du bouton

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
          pseudo: pseudo,
        };

        await emailjs.send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM')
          .then((response) => {
            console.log('Email envoyé avec succès:', response);
            setMessage(`Email envoyé pour ${pseudo}.`);
          })
          .catch((error) => {
            console.error('Erreur EmailJS:', error);
            setMessage(`Erreur lors de l'envoi de l'email : ${error.text || error.message}`);
          });

        // Réinitialisation après envoi
        setEmail('');
        setSelectedPseudo('');
        setPseudos([]);
        setStep('email');
        setIsButtonDisabled(true);
        setButtonText('Vérifier'); // Remettre le texte du bouton à 'Vérifier'
      } else {
        setMessage('Pseudo non trouvé.');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de l\'email.');
      console.error('Erreur:', error);
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
        setButtonText('Valider'); // Change le texte du bouton à "Valider"
      }
    } else if (step === 'pseudo') {
      if (!selectedPseudo) {
        setMessage('Veuillez sélectionner un pseudo.');
        return;
      }
      await sendResetEmail(selectedPseudo);
    }
  };

  // Gestion du champ email
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsButtonDisabled(!inputEmail.includes('@'));
  };

  // Gestion du changement de pseudo
  const handlePseudoChange = (e) => {
    setSelectedPseudo(e.target.value);
  };

  return (
    <div className="formulaire-reset-pwd">
      <h2>Réinitialisation de mot de passe</h2>   <br/>

      {step === 'pseudo' && (
        <p style={{ color: 'green', marginBottom: '10px' }}>
          Plusieurs comptes ont été identifiés. Choisi ton pseudo dans  <br/>
          dans la liste ci-dessous puis cliquer sur le bouton Valider
        </p>
      )}

      <form onSubmit={handleSubmit} className="reset-pwd-form">
        {step === 'email' && (
          <label>
            Mail : &nbsp;
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
            <div>
              <label>
                Pseudo :
                <select className='select-pseudo'
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

        <button
          type="submit"
          id="aligner-button"
          disabled={step === 'pseudo' ? !selectedPseudo : isButtonDisabled}
        >
          {buttonText}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
