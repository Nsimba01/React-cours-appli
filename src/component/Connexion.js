
import '../css/connexion.css';

function Connexion() {
    return (

        <>


      <div  className="formulaire"> 
        
        <p> Veuillez vous connecter  ! </p>


            <form>

       
                <div>

                    <pre>

                         <label> Pseudo :       <input type="text" name="username" />   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password"  /> </label> <br/>
      
                     </pre>

                     <input type="submit" value="connexion" id="aligner-button" />

                </div>

             </form>

             Je n'ai pas encore de compte 
            
        </div>
        
        </>
 

    )

}
export default Connexion;