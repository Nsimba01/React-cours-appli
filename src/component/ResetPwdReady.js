import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import '../css/resetPwdReady.css';

function ResetPwdReady() {
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      const db = getDatabase();
      const tokenRef = ref(db, 'reset_tokens/' + token);

      get(tokenRef).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const now = Date.now();

          if (now < data.expiration) {
            setIsValidToken(true);
            setMessage('Le lien est valide. Vous pouvez maintenant réinitialiser votre mot de passe.');
          } else {
            setIsValidToken(false);
            setMessage('Ce lien a expiré.');
          }
        } else {
          setIsValidToken(false);
          setMessage('Le lien est invalide.');
        }
      }).catch(error => {
        setMessage('Une erreur s\'est produite.');
        console.error("Erreur lors de la vérification du jeton:", error);
      });
    } else {
      setMessage('Aucun jeton fourni.');
    }
  }, [location]);

  return (
    <div className="reset-pwd-ready">
      <h1>{isValidToken ? 'Bienvenue !' : ' '}</h1>
      <p>{message}</p>
    </div>
  );
}

export default ResetPwdReady;
