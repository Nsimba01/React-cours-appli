
import '../css/maincontent.css';

/*
import  scolaire from '../images/maviescolaire.jpg'; 


import  coffre from '../images/coffreautresor.jpeg'; */


import '../css/header.css';

import presentation_img from '../images/arbredusavoir.jpg';

import img_scolaire from '../images/maviescolaire.jpg';

import log_euro from '../images/logo_euro.png';

// <img alt="Salle de classe" src={scolaire} className="scolarite"  />
function MainContent() {
    return (
 

    <>



<div className="divexterne"  style={{ marginTop: '2px' }} >
   <table class="tableau">
    <tr>
      <td class="cellule">
        <img src={presentation_img} alt="presentation" />
      </td>
      <td class="cellule">



            Bienvenue dans <strong>"L'Arbre du Savoir"</strong>. <br/><br/>
             Ici, tu trouveras l'ensemble des connaissances, méthodes et outils<br/><br/>
             qui te serviront tout au long de ta vie. <br/><br/>
             Toutefois, garde toujours à l'esprit que la discipline est la clé <br/><br/> de l'accomplissement de toute grande chose.
             <br/><br/> Sois donc patient, et surtout régulier dans ton apprentissage. <br/><br/>
             Je te souhaite toute la réussite que tu mérites.  <br/><br/>
       



      </td>
    </tr>
  </table>

  </div>









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

