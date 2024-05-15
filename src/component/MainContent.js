
import '../css/maincontent.css';

/*
import  scolaire from '../images/maviescolaire.jpg'; 


import  coffre from '../images/coffreautresor.jpeg'; */


import '../css/header.css';

import img_scolaire from '../images/maviescolaire.jpg';

import log_euro from '../images/logo_euro.png';


import React from 'react';



function MainContent() {



    return (
 

    <>



<div className='module_container'>


          <div className='module_element'>

              <h1> scolarité </h1>

              <img src={img_scolaire} alt="scolaire" />


          </div>


          <div className='module_element'>


              <h1> Finance </h1>

              <img src={log_euro} alt="logo euro" />

            

            
          </div>


          
          <div className='module_element'>

<h1> Autres </h1>

            
          </div>
</div>

     
        
       

      </>


    );
  }
   

  export default MainContent;


