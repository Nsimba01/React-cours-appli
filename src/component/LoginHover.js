
import React, { useState } from "react";
import '../css/login_hover.css';



function LoginHover() {

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



      <div  className="form-login"> 
    

            <form  onSubmit={handleSubmit}>

       
                <div>

                 
     
                         <label> Pseudo :        <input type="text" name="username"   value={formData.username} onChange={handleChange}/>   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password" value={formData.password}  onChange={handleChange}/> </label> <br/>
      

                          <div> 
                             
                             <input type="submit" value="connexion"  /> <br/> <br/>
                             
                              <b>sinon créer un compte ! </b>

                          </div>
                    

                </div>

             </form>

          
            
        </div>
        
 
 

    )

}
export default LoginHover;