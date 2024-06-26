// src/component/validationUtils.js
import { getDatabase, ref, get, child } from "firebase/database";
import bcrypt from 'bcryptjs';

export const validatePassword = (password) => ({
  length: password.length >= 10,
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password)
});

export const validatePseudo = (pseudo) => pseudo.length >= 5;

export const handleLogin = async (pseudo, password, loginCallback, navigateCallback, setErrorMessage, setSuccessMessage) => {
  try {
    const dbRef = ref(getDatabase());
    const snapshot = await get(child(dbRef, `users/${pseudo}`));

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        setSuccessMessage("Vous êtes connecté !");
        setErrorMessage(null);
        loginCallback();
        navigateCallback('/home');
      } else {
        setErrorMessage("Le mot de passe est incorrect.");
        setSuccessMessage(null);
      }
    } else {
      setErrorMessage("Veuillez vous enregistrer !");
      setSuccessMessage(null);
    }
  } catch (error) {
    setErrorMessage("Une erreur s'est produite lors de la connexion/inscription. Veuillez réessayer.");
    setSuccessMessage(null);
    console.error("Erreur lors de l'enregistrement des données:", error);
  }
};
