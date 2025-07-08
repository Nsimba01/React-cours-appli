
import React from 'react';
import '../css/footer.css';



function Footer() {
  return (

    <> 

<div className="footer">
    <div className="footer-content">
        <div className='footer-position'>
            <h3 className='title-design'> Présentation </h3>
            <p> Qui sommes nous ?  </p>
            <p> Notre mission  </p>
        </div>

        <div className='footer-position'>
            <h3 className='title-design'> Informations légales </h3>
            <p> Conditions générales </p>
            <p> Politique de confidentialité </p>
            <p> Gestion de cookies </p>
        </div>

        <div className='footer-position'>
            <h3  className='title-design'> Partenaires </h3>
            <p> Nos partenaires </p>
            <p> Devenir partenaires </p>
            <p> Nous aider</p>
        </div>

        <div className='footer-position'>
            <h3 className='title-design'> Aide et contact </h3>
            <p> Prise en main </p>
            <p> Contact</p>
        </div>
    </div>

    <div className="footer-legal">
        ©2024 arbredusavoir.fr (tous droits réservés)
    </div>
</div>





     </>
                  
  );
}

export default Footer;

