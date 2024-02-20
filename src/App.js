import Header from './component/Header.js';

import './css/App.css';


import videoBg from './assets/CLASSE-DU-CE1-AU-CM2.mp4';


function App() {


  return (




      <>


        <video src={videoBg} autoPlay loop muted />

          <div className="content"> 
    
              <Header/>

          </div>

       

       </>
   
    


    

   


  );
}

export default App;

//      <img src={logo} className="App-logo" alt="logo" />