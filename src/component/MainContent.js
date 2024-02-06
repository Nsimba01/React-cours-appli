
import '../css/maincontent.css';

/*
import  scolaire from '../images/maviescolaire.jpg'; 


import  coffre from '../images/coffreautresor.jpeg'; */


import '../css/header.css';

import presentation_img from '../images/arbredusavoir.jpg';

// <img alt="Salle de classe" src={scolaire} className="scolarite"  />
function MainContent() {
    return (
 

    <>

     <div className="presentation" >

        <img src={presentation_img} alt="L'arbre du savoir"  />

        <p>

             Bienvenue dans <strong>"L'Arbre du Savoir"</strong>. <br/><br/>
             Ici, tu trouveras l'ensemble des connaissances, méthodes et outils<br/> qui te serviront tout au long de ta vie. <br/><br/>
             Toutefois, garde toujours à l'esprit que la discipline est la clé <br/> de l'accomplissement de toute grande chose. <br/>t Sois donc patient, et surtout régulier dans ton apprentissage. <br/><br/>
             Je te souhaite toute la réussite que tu mérites.  <br/><br/>



        </p>

     </div>      

     <div className='container'>


          <div className='element'>

              <h1> scolarité </h1>

          </div>


          <div className='element'>


              <h1> Finance </h1>

            
          </div>


          
          <div className='element'>


               <h1> Autres </h1>

            
          </div>

      
      </div>
        
       

      </>


    );
  }
   
  export default MainContent;

