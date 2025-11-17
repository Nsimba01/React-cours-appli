import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set, get } from "firebase/database";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../css/button-width-height-global.css';
import '../css/creation.css';

function Creation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pseudo: "",
    password: "",
    email: "",
    nom: "",
    prenom: "",
    sexe: "vide",
    dateNaissance: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);

  // message unique affiché sous le bouton (séquentiel)
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false); // pour la transition fade

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  });
  const [pseudoValidation, setPseudoValidation] = useState({
    length: false,
    available: false,
    checking: false
  });
  const [emailValidation, setEmailValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // refs pour debounce pseudo et timers d'erreur séquentielle
  const pseudoTimeoutRef = useRef(null);
  const timersRef = useRef([]);

  // Validation du mot de passe
  const validatePassword = (password) => ({
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });

  // Validation email (retourne bool)
  const isEmailValidFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Nettoyage des timers de la séquence d'erreurs + debounce
  const clearAllTimers = useCallback(() => {
    if (pseudoTimeoutRef.current) {
      clearTimeout(pseudoTimeoutRef.current);
      pseudoTimeoutRef.current = null;
    }
    if (timersRef.current && timersRef.current.length) {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    }
  }, []);

  // Validation du pseudo avec debounce propre
  const validatePseudoDebounced = useCallback(async (pseudo) => {
    const p = (pseudo || "").trim();

    if (pseudoTimeoutRef.current) {
      clearTimeout(pseudoTimeoutRef.current);
    }

    if (p.length < 5) {
      setPseudoValidation({ length: false, available: false, checking: false });
      return;
    }

    setPseudoValidation(prev => ({ ...prev, length: true, checking: true }));
    pseudoTimeoutRef.current = setTimeout(async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${p}`);
        const snapshot = await get(userRef);
        const available = !snapshot.exists();
        setPseudoValidation({ length: true, available, checking: false });
      } catch (error) {
        console.error("Erreur lors de la vérification du pseudo:", error);
        setPseudoValidation({ length: true, available: false, checking: false });
      }
      pseudoTimeoutRef.current = null;
    }, 500);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Renvoie la liste des messages d'erreur (ordre voulu)
  const getInvalidMessages = useCallback(() => {
    const msgs = [];
    const { pseudo, password, nom, prenom, sexe, dateNaissance, email } = formData;

    // Pseudo
    if (!pseudo || pseudo.trim().length < 5 || !pseudoValidation.available || pseudoValidation.checking) {
      msgs.push("Ton pseudo n'est pas valide");
    }

    // Mot de passe
    if (!password || !Object.values(passwordValidation).every(Boolean)) {
      msgs.push("Ton mot de passe n'est pas valide");
    }

    // Nom
    if (!nom || !nom.trim()) {
      msgs.push("Ton nom n'est pas valide");
    }

    // Prénom
    if (!prenom || !prenom.trim()) {
      msgs.push("Ton prénom n'est pas valide");
    }

    // Sexe
    if (sexe === "vide") {
      msgs.push("Tu dois sélectionner un sexe");
    }

    // Date de naissance
    if (!dateNaissance) {
      msgs.push("Ta date de naissance n'est pas valide");
    }

    // Email
    if (!email || !emailValidation) {
      msgs.push("Ton email n'est pas valide");
    }

    return msgs;
  }, [formData, pseudoValidation, passwordValidation, emailValidation]);

  // Affiche séquentiellement les messages d'erreur avec fade-in / fade-out
  const showSequentialErrors = useCallback(() => {
    clearAllTimers();
    setErrorMessage(null);
    setErrorVisible(false);

    const messages = getInvalidMessages();
    if (!messages.length) return;

    const displayMs = 1700; // durée d'affichage pleine visibilité par message (modifiable)
    const transitionMs = 400; // durée du fade-in/fade-out (modifiable)
    let accumulatedDelay = 0;

    messages.forEach((msg, idx) => {
      const isLast = idx === messages.length - 1;

      // Timer to set the message and fade it in
      const showTimer = setTimeout(() => {
        if (isFormValid || isSubmitting) {
          clearAllTimers();
          return;
        }
        setErrorMessage(msg);
        // small tick to ensure message exists in DOM then fade in
        const visTimer = setTimeout(() => setErrorVisible(true), 20);
        timersRef.current.push(visTimer);

        // If not last, schedule fade-out after displayMs
        if (!isLast) {
          const hideTimer = setTimeout(() => {
            setErrorVisible(false);
          }, displayMs);
          timersRef.current.push(hideTimer);

          // after fade-out completes, clear the message to prepare next one
          const clearTimer = setTimeout(() => {
            setErrorMessage(null);
          }, displayMs + transitionMs);
          timersRef.current.push(clearTimer);
        }
        // If last: keep it visible — do not schedule hide/clear
      }, accumulatedDelay);

      timersRef.current.push(showTimer);

      // increase accumulatedDelay by full cycle (show duration + fade time) for next message
      accumulatedDelay += displayMs + transitionMs;
    });
  }, [clearAllTimers, getInvalidMessages, isFormValid, isSubmitting]);

  // Gestion des changements de champs (annule la séquence d'erreurs)
  const handleChange = (event) => {
    const { name, value } = event.target;

    clearAllTimers();
    setErrorMessage(null);
    setErrorVisible(false);

    if (name === "pseudo") {
      const normalized = value.replace(/\s+/g, " ");
      setFormData((prev) => ({ ...prev, [name]: normalized }));
      validatePseudoDebounced(normalized);
      return;
    }

    if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setEmailValidation(isEmailValidFormat(value));
      return;
    }

    if (name === "password") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setPasswordValidation(validatePassword(value));
      return;
    }

    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChangeSexe = (e) => {
    const { value } = e.target;
    clearAllTimers();
    setErrorMessage(null);
    setErrorVisible(false);
    setFormData((prevState) => ({ ...prevState, sexe: value }));
  };

  const handleNomChange = (e) => {
    const { value } = e.target;
    clearAllTimers();
    setErrorMessage(null);
    setErrorVisible(false);
    setFormData((prevState) => ({ ...prevState, nom: value.trim().toUpperCase() }));
  };

  const handlePrenomChange = (e) => {
    clearAllTimers();
    setErrorMessage(null);
    setErrorVisible(false);
    const value = e.target.value;
    const formatted = value
      .split(/([\s-])/)
      .map((part) => {
        if (part.trim().length > 0 && !/[\s-]/.test(part)) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part;
      })
      .join('');
    setFormData((prevState) => ({ ...prevState, prenom: formatted }));
  };

  // Validation du formulaire
  useEffect(() => {
    const { nom, prenom, sexe, dateNaissance } = formData;
    const isPseudoValid = pseudoValidation.length && pseudoValidation.available && !pseudoValidation.checking;
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    const isEmailValid = emailValidation;

    const isValid = isPseudoValid &&
                    isPasswordValid &&
                    isEmailValid &&
                    nom.trim().length > 0 &&
                    prenom.trim().length > 0 &&
                    sexe !== "vide" &&
                    dateNaissance;
    setIsFormValid(isValid);
  }, [pseudoValidation, passwordValidation, emailValidation, formData]);

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  // handleSubmit accepte maintenant un appel direct sans event
  const handleSubmit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();

    if (!isFormValid || isSubmitting) {
      showSequentialErrors();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorVisible(false);

    try {
      const pseudoTrim = formData.pseudo.trim();
      const db = getDatabase();
      const userRef = ref(db, 'users/' + pseudoTrim);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setErrorMessage("Ce pseudo est déjà pris. Veuillez en choisir un autre.");
        setErrorVisible(true);
        setIsSubmitting(false);
        return;
      }

      const userData = {
        email: formData.email.trim(),
        nom: formData.nom,
        prenom: formData.prenom,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance,
        password: formData.password, // ⚠️ hash côté serveur en prod
      };

      await set(userRef, userData);
      setSuccessMessage("Votre compte a été créé avec succès !");
      setErrorMessage(null);
      setErrorVisible(false);
      setTimeout(() => navigate('/connexion'), 1200);
    } catch (error) {
      console.error("Erreur lors de la création du compte :", error);
      setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
      setErrorVisible(true);
      setIsSubmitting(false);
    }
  };

  // Lors du clic sur le bouton : si invalide -> lancer la séquence, sinon -> soumettre
  const handleButtonClick = (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) {
      showSequentialErrors();
    } else {
      handleSubmit();
    }
  };

  // styles pour le message d'erreur (fade)
  const transitionMs = 400; // doit matcher transitionMs défini dans showSequentialErrors
  const errorStyle = {
    opacity: errorVisible ? 1 : 0,
    transition: `opacity ${transitionMs}ms ease`,
    color: "red",
    fontStyle: "italic",
    fontSize: "13px",
    fontWeight: "normal",
    marginTop: "15px"
  };

  return (
    <div className="formulaireCreate" id="creation-form">
      <p>Création de mon espace</p>
      <form onSubmit={handleSubmit} noValidate>
        {/* Pseudo */}
        <div className="form-row-creation">
          <label htmlFor="pseudo">Pseudo:</label>
          <div className="input-container-create" style={{ position: 'relative' }}>
            <input
              id="pseudo"
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              aria-label="Pseudo"
              required
              onFocus={() => setIsPseudoFocused(true)}
              onBlur={() => setIsPseudoFocused(false)}
              autoComplete="off"
              inputMode="text"
            />
          </div>
        </div>
        {isPseudoFocused && (
          <div className="validation-message" aria-live="polite">
            <span style={{ color: pseudoValidation.length ? "RGB(51,204,51)" : "red" }}>
              Au moins 5 caractères
            </span>
            <br />
            <span style={{ color: pseudoValidation.available ? "RGB(51,204,51)" : pseudoValidation.checking ? "orange" : "red" }}>
              {pseudoValidation.checking ? "Vérification en cours..." : (pseudoValidation.available ? "Pseudo disponible" : "Pseudo indisponible")}
            </span>
          </div>
        )}

        {/* Mot de passe */}
        <div className="form-row-creation">
          <label htmlFor="password">Mot de passe:</label>
          <div className="input-container-create" style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-label="Mot de passe"
              required
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              style={{
                height: '25px',
                padding: '4px 35px 4px 8px',
                borderRadius: '5px',
                boxSizing: 'border-box',
                fontSize: '15px',
                width: '100%'
              }}
            />
            {/* PICTOGRAMME OEIL : span cliquable (gardé comme demandé) */}
            <span
              onClick={toggleShowPassword}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-39%)',
                cursor: 'pointer',
                color: '#333',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {isPasswordFocused && (
          <div className="validation-message" aria-live="polite">
            <span style={{ color: passwordValidation.length ? "RGB(51,204,51)" : "red" }}>
              Au moins 10 caractères
            </span>
            <br />
            <span style={{ color: passwordValidation.uppercase ? "RGB(51,204,51)" : "red" }}>
              Au moins une majuscule
            </span>
            <br />
            <span style={{ color: passwordValidation.number ? "RGB(51,204,51)" : "red" }}>
              Au moins 1 chiffre
            </span>
          </div>
        )}

        {/* Nom */}
        <div className="form-row-creation">
          <label htmlFor="nom">Nom:</label>
          <div className="input-container-create">
            <input
              id="nom"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleNomChange}
              aria-label="Nom"
              required
            />
          </div>
        </div>

        {/* Prénom */}
        <div className="form-row-creation">
          <label htmlFor="prenom">Prénom :</label>
          <div className="input-container-create">
            <input
              id="prenom"
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handlePrenomChange}
              aria-label="Prénom"
              required
            />
          </div>
        </div>

        {/* Sexe */}
        <div className="form-row-creation">
          <label htmlFor="sexe">Sexe:</label>
          <div className="input-container-create">
            <select
              id="sexe"
              name="sexe"
              value={formData.sexe}
              onChange={handleChangeSexe}
              required
            >
              <option value="vide">(vide)</option>
              <option value="femme">Fille</option>
              <option value="homme">Garçon</option>
            </select>
          </div>
        </div>

        {/* Date de naissance */}
        <div className="form-row-creation">
          <label htmlFor="dateNaissance">Date de naissance: </label>
          <div className="input-container-create">
            <input
              id="dateNaissance"
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={(e) => { clearAllTimers(); setErrorMessage(null); setErrorVisible(false); setFormData(prev => ({ ...prev, dateNaissance: e.target.value })); }}
              aria-label="Date de naissance"
              required
            />
          </div>
        </div>

        {/* Mail */}
        <div className="form-row-creation">
          <label htmlFor="email">Mail:</label>
          <div className="input-container-create">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-label="Mail"
              required
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              style={{ marginBottom: '10px' }}
              autoComplete="email"
            />
          </div>
        </div>
        {isEmailFocused && (
          <div className="validation-message" aria-live="polite">
            <span style={{ color: emailValidation ? "RGB(51,204,51)" : "red" }}>
              Une adresse email valide
            </span>
          </div>
        )}

        {/* Bouton de soumission — non-disabled pour capturer le clic */}
        <div className="form-row-creation">
          <button
            type="button"
            onClick={handleButtonClick}
            id="aligner-button-create"
            aria-disabled={(!isFormValid || isSubmitting).toString()}
            tabIndex={0}
            style={{
              backgroundColor: isFormValid && !isSubmitting ? 'RGB(51,204,51)' : 'rgb(211, 211, 211)',
              cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease',
              border: "1px solid black",
              padding: '6px 12px',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? "Création en cours..." : "Création"}
          </button>
        </div>

        {/* Lien "Déjà un espace ?" */}
        <p
          className="link"
          onClick={() => !isSubmitting && navigate('/connexion')}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'underline',
            color: 'black',
            fontStyle: 'italic',
            fontSize: '13px',
          }}
        >
          Déjà un espace ?
        </p>
      </form>

      {/* Affichage des messages sous le bouton avec transition */}
      <div style={{ minHeight: '22px',fontSize: '15px' }}>
        {errorMessage && (
          <p role="alert" aria-live="assertive" style={errorStyle}>
            {errorMessage}
          </p>
        )}
      </div>

      {/* Message de succès */}
      {successMessage && <p role="status" aria-live="polite" style={{ color: "RGB(51,204,51)" }}>{successMessage}</p>}
    </div>
  );
}

export default Creation;