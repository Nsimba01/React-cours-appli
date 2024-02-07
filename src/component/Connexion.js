
<<<<<<< HEAD
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


=======
import '../css/connexion.css';

function Connexion() {
>>>>>>> f2b20866f54867d42cb1a4e4d6f2bb247fef0687
    return (

        <>


      <div  className="formulaire"> 
        
        <p> Veuillez vous connecter  ! </p>


<<<<<<< HEAD
            <form  onSubmit={handleSubmit}>
=======
            <form>
>>>>>>> f2b20866f54867d42cb1a4e4d6f2bb247fef0687

       
                <div>

                    <pre>

<<<<<<< HEAD
                         <label> Pseudo :       <input type="text" name="username"  value={formData.username} onChange={handleChange}/>   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password"  value={formData.password}  onChange={handleChange}/> </label> <br/>
=======
                         <label> Pseudo :       <input type="text" name="username" />   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password"  /> </label> <br/>
>>>>>>> f2b20866f54867d42cb1a4e4d6f2bb247fef0687
      
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