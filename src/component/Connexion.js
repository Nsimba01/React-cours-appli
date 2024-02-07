
import React, { useState } from "react";
import '../css/connexion.css';



function Connexion() {

    const[formData,setFormData]=useState({

        username:"",
        password:""

    });


    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
      };

      const handleSubmit = (event) => {
        event.preventDefault();
        console.log(formData);
      };


    return (

        <>


      <div  className="formulaire"> 
        
        <p> Veuillez vous connecter  ! </p>


            <form  onSubmit={handleSubmit}>

       
                <div>

                    <pre>

                         <label> Pseudo :       <input type="text" name="username"  value={formData.username} onChange={handleChange}/>   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password"  value={formData.password}  onChange={handleChange}/> </label> <br/>
      
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