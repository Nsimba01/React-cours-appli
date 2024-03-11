
import Header from './component/Header.js';
import './css/App.css';
import videoBg from './assets/foret.mp4';


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
