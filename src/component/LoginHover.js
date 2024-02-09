
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

                    <center> 

     
                         <label> Pseudo :        <input type="text" name="username"  width="28" value={formData.username} onChange={handleChange}/>   </label> <br/>
    
                         <label> Mot de passe : <input type="password" name="password" width="28"  value={formData.password}  onChange={handleChange}/> </label> <br/>
      

                          <div id="button-place"> 
                             
                             <input type="submit" value="connexion"  /> <b>sinon créer un compte ! </b>

                          </div>
                    </center>

                </div>

             </form>

          
            
        </div>
        
 
 

    )

}
export default LoginHover;