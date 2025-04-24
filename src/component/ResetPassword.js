import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import emailjs from 'emailjs-com';
import '../css/connexion.css';
import { generateResetToken } from './tokenUtils';

function ResetPassword() {
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pseudos, setPseudos] = useState([]);
  const [selectedPseudo, setSelectedPseudo] = useState(localStorage.getItem('pseudo') || '');
  const [step, setStep] = useState('email');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonText, setButtonText] = useState('Vérifier');
  const [emailExists, setEmailExists] = useState(false); // État pour suivre l'existence de l'email
  const [emailSent, setEmailSent] = useState(false); // État pour suivre si l'email a été envoyé

  useEffect(() => {
    setButtonText(step === 'pseudo' ? 'Valider' : 'Vérifier');
  }, [step]);

  const checkEmailExists = async (email) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    let exists = false;

    snapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.email === email) {
        exists = true;
      }
    });

    setEmailExists(exists);
  };

  const sendResetEmail = async (pseudo) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${pseudo}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const token = await generateResetToken(pseudo);
        const resetLink = `http://localhost:3000/reset-pwd-process?token=${token}&email=${email}`;
        const templateParams = {
          to_name: userData.name || 'Utilisateur',
          to_email: email,
          reset_link: resetLink,
          pseudo: pseudo,
        };

        await emailjs
          .send('service_z2vqh5i', 'template_48nncre', templateParams, 'k9E-hi9Gv6XCXnZWM')
          .then((response) => {
            console.log('Email envoyé avec succès:', response);
            setSuccessMessage(`Un lien de réinitialisation de ton mot de passe a été envoyé à l’adresse « ${email} ». Ce lien sera valable 10 minutes.`);
            setErrorMessage('');
            setEmailSent(true); // Mettre à jour l'état emailSent
          })
          .catch((error) => {
            console.error('Erreur EmailJS:', error);
            setErrorMessage(`Erreur lors de l'envoi de l'email : ${error.text || error.message}`);
            setSuccessMessage('');
          });

        setEmail('');
        setSelectedPseudo('');
        setPseudos([]);
        setStep('email');
        setIsButtonDisabled(true);
        setButtonText('Vérifier');
        setEmailExists(false); // Réinitialiser l'état emailExists
      } else {
        setErrorMessage('Pseudo non trouvé.');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'envoi de l\'email.');
      console.error('Erreur:', error);
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step === 'email') {
      if (!email.includes('@')) {
        setErrorMessage('Veuillez entrer un email valide.');
        setSuccessMessage('');
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
        setErrorMessage('Aucun compte n’est associé à ce mail.');
        setSuccessMessage('');
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
        setErrorMessage('Veuillez sélectionner un pseudo.');
        setSuccessMessage('');
        return;
      }
      await sendResetEmail(selectedPseudo);
    }
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsButtonDisabled(!inputEmail.includes('@'));
    if (inputEmail.includes('@')) {
      checkEmailExists(inputEmail); // Vérifier l'existence de l'email en temps réel
    } else {
      setEmailExists(false); // Réinitialiser l'état emailExists si l'email n'est pas valide
    }
  };

  const handlePseudoChange = (e) => {
    setSelectedPseudo(e.target.value);
  };

  useEffect(() => {
    let timer;
    if (errorMessage) {
      timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [errorMessage]);

  return (
    <div className="formulaire-reset-pwd">
      <h2   style={{fontStyle:"19px" }}>Réinitialisation du mot de passe</h2>
      {!emailSent ? (
        <>
          <br />
          {step === 'pseudo' && (
            <p style={{ color: 'green', marginBottom: '10px' }}>
              Plusieurs comptes ont été identifiés. Choisis ton pseudo dans <br />
              la liste ci-dessous puis clique sur le bouton Valider.
            </p>
          )}

          <form onSubmit={handleSubmit} className="reset-pwd-form">
            <br />
            {step === 'email' && (
              <label>
                Mail : &nbsp;
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  aria-required="true"
                />
              </label>
            )}

            {step === 'pseudo' && (
              <div>
                <label>
                  Pseudo :
                  <select
                    className="select-pseudo"
                    value={selectedPseudo}
                    onChange={handlePseudoChange}
                    required
                    aria-required="true"
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
            )}

            <button
              type="submit"
              id="aligner-button"
              disabled={step === 'pseudo' ? !selectedPseudo : isButtonDisabled}
              style={{
                backgroundColor: step === 'email' ? (emailExists ? 'rgb(146,208,80)' : 'rgb(211,211,211)') : undefined,
              }} // Style conditionnel uniquement pour le bouton "Vérifier"
            >
              {buttonText}
            </button>
          </form>

          {errorMessage && <p style={{ color: 'red', marginTop: '-5%' }}>{errorMessage}</p>}
        </>
      ) : (
        <div>
          <p style={{ color: 'green',fontStyle:'italic' }}>{successMessage}</p>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
