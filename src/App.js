import React, { useEffect, useState } from 'react'
import './App.css';
import Amplify,  { Auth } from "aws-amplify"
import awsconfig from "./aws-exports"

Amplify.configure(awsconfig) //Base React App with AWS Amplify configured
//decided to create my own Auth UI instead of the prebuilt one that Amplify provides 

const initialAuthState = {username: '', password: '', email: '', authCode: '', authType: 'logIn'} //authTypes: register, confirmRegister, logIn, loggedIn

function App() { 
  const [authState, updateAuthState] = useState(initialAuthState)
  const [user, updateUser] = useState(null)
  useEffect(()=>{
    session()
  }, [])

  const session = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      updateUser(user)
      updateAuthState(()=>({...authState, authType: 'loggedIn'}))
    } catch (err) {
      console.log(err)
    }
  }

  const { authType } = authState
  const onChange = (e) => {
    e.persist()
    updateAuthState(()=>({...authState, [e.target.name]:e.target.value}))
    // console.log(authState.username, authState.password, authState.email)
  }

  const signUp = async () => {
      const {username, password, email} = authState
      await Auth.signUp({username, password, attributes: {email}})
              .then((result)=> {
                console.log(result)
                updateAuthState(()=>({...authState, authType: 'confirmRegister'}))
              })
              .catch((err)=>console.log(err))
    
  }
  const confirmSignUp = async () => {
    const {username, authCode} = authState
    await Auth.confirmSignUp(username, authCode)
            .then((result)=> {
              console.log(result)
              updateAuthState(()=>({...authState, authType: 'logIn'}))
            })
            .catch((err)=>console.log(err))
    
  }
  const signIn = async () => {
    const {username, password} = authState
    await Auth.signIn(username, password)
            .then((result)=> {
              console.log(result)
              updateAuthState(()=>({...authState, authType: 'loggedIn'}))
            })
            .catch((err)=>console.log(err))
    
  }



  return (
    <div className="App">
      <div className="App-header">
      {
        authType === 'register' &&      //Register form: requires > username, password & email
        <div>
            <h3>Register an account</h3>
            <input name="username" onChange={onChange} placeholder="Username"></input>
            <input name="password" onChange={onChange} type="password" placeholder="Pasword"></input>
            <input name="email" onChange={onChange} placeholder="Email"></input>

            <button onClick={signUp}>Register</button>
            <button onClick={()=>updateAuthState(()=>({...authState, authType: 'logIn'}))}>Log In Instead</button>
        </div>
      }
      {
        authType === 'confirmRegister' &&    //Confirm registration form: requires > username & confirmation code (sent via email)
        <div>
            <input name="username" onChange={onChange} placeholder="Username"></input>
            <input name="authCode" onChange={onChange} placeholder="Authorization Code"></input>

            <button onClick={confirmSignUp}>Confirm Account</button>
        </div>
      }
      {
        authType === 'logIn' &&       //Log in form: requires > username & password
        <div>
            <h3>Log into your account</h3>
            <input name="username" onChange={onChange} placeholder="Username"></input>
            <input name="password" onChange={onChange} type="password" placeholder="Pasword"></input>

            <button onClick={signIn}>Log in</button>
            <button onClick={()=>updateAuthState(()=>({...authState, authType: 'register'}))}>Register an account</button>
        </div>
      }
      {
        authType === 'loggedIn' &&    //Logged in state: Shows content of the app after being authorized
        <div>
            <h1>Hello World</h1>
            <button onClick={
              () => Auth.signOut().then(()=>updateAuthState(()=>({...authState, authType: 'logIn'})))
            }>Log Out</button>
        </div>
      }

      </div>
    </div>
  );
}

export default App;
