// src/App.js
import React from 'react';
import '../css/footer.css';



function Footer() {
  return (

    <> 

    <div className="footer">


         <div className='footer-position'>

              <h3> Présentation </h3>

              <p> Qui sommes nous ?  </p>

              <p> Notre mission  </p>

         </div>

         <div className='footer-position'>

    
              <h3> Informations légales </h3>

              <p> Conditions générales </p>

              <p> Politique de confidencialité </p>

              <p> Gestion de cookies </p>

         </div>


         
         <div className='footer-position'>

    
              <h3>Partenaires </h3>

              <p> Nos partenaires </p>

              <p> Dévenir partenaires </p>

              <p> Nous aider</p>

         </div>


           
         <div className='footer-position'>

    
              <h3> Aide et contact </h3>

              <p> Prise en main </p>

              <p> Contact</p>

       

         </div>

     </div>


     </>
                  
  );
}

export default Footer;

