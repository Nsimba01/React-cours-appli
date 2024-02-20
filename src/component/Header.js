

import logos from '../images/arbredusavoir.jpg';

import img_btn_espace from '../images/boutonespace.png'; 

import {BrowserRouter as Router,Routes,Route,Link,Navigate} from "react-router-dom";

import MainContent from './MainContent.js';

import Connexion from './Connexion.js';

import LoginHover from './LoginHover.js';







function Header() {





    return (
  

    <Router> 

     <div className="row">

      
        <div className=" col"><Link to="/home">  <img src={logos} className="bloc_titre_logo" alt="logo" />  </Link></div>
      
        <div className=" col" id="button2"><h1 className="titre"> Titre principal </h1></div>
      
       

         <div className=" col">
          
          
         

                <div className="dropdown">

                  <Link to="/connexion"> 
              
                    <div  className="button_espace">


        
                 
                      
                          <img className="bloc_titre_boutonespace_image" src={img_btn_espace} alt="bouton-space"/> 
                          
                                    Bouton Espace 
                                    
                      </div>

                      </Link> 

                      <div class="dropdown-content">

<<<<<<< HEAD
                    


                          <LoginHover/>

                         
=======

                          <LoginHover/>
>>>>>>> 91ecae31d1c67c43943c06350b6fc4f734c6fced
  
                      
  
                      </div>

                  </div>
                      
             
              
              
          </div>
    

       
        
      </div>

 


    

        <Routes>

             <Route exact path="/home" element={<MainContent />}>  </Route>

             <Route exact path="/connexion" element={<Connexion />}>  </Route>

             <Route
                        path="*"
                        element={<Navigate to="/home" />}
                    />
             
        </Routes>


       

      </Router>

  
    );
  }
   
  export default Header;

     /*

      {isHovering && (
          

          <ConnexionHover/>


       )}  */