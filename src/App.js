import './App.css';
import Amplify,  { Auth } from "aws-amplify"
import awsconfig from "./aws-exports"

Amplify.configure(awsconfig) //Base React App with AWS Amplify configured
//decided to create my own Auth UI instead of the prebuilt one that Amplify provides 

function App() { 
  return (
    <div className="App">
      <header className="App-header"> 

      </header>
    </div>
  );
}

export default App;
