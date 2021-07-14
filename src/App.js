import React, { useEffect, useState } from 'react'
import './App.css';
import Amplify,  { Auth } from "aws-amplify"
import awsconfig from "./aws-exports"
import { Form, FormGroup, FormInput, Card, CardBody, CardTitle, Button, ButtonGroup} from 'shards-react'

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"

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
  }

  const signUp = async () => {
      const {username, password, email} = authState
      await Auth.signUp({username, password, attributes: {email}})
              .then((result)=> {
                console.log(result)
                updateAuthState(()=>({...authState, authType: 'confirmRegister'}))
              })
              .catch((err)=>{
                console.log(err)
                if(err.name === "UsernameExistsException"){
                  alert("This username already exists!")
                }
              })
    
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
            .catch((err)=>{
              console.log("error data ", err)
              if(err.name === "UserNotConfirmedException") {
                updateAuthState(()=>({...authState, authType: 'confirmRegister'}))
              }  
            })
    
  }



  return (
    <div className="App">
      <div className="App-header">
      {
        authType === 'register' &&      //Register form: requires > username, password & email
        <Card>
          <CardBody>
            <CardTitle>Register an Account</CardTitle>
            <Form>
              <FormGroup>
                <FormInput name="username" onChange={onChange} placeholder="Username"/>
              </FormGroup>
              <FormGroup>
                <FormInput name="password" onChange={onChange} type="password" placeholder="Pasword"/>
              </FormGroup>
              <FormGroup>
                <FormInput name="email" onChange={onChange} placeholder="Email"/>
              </FormGroup>
            </Form>
            <ButtonGroup>
              <Button onClick={signUp}>Register</Button>
              <Button theme="secondary" onClick={()=>updateAuthState(()=>({...authState, authType: 'logIn'}))}>Log In Intead</Button>
            </ButtonGroup>
          </CardBody>
        </Card>
      }
      {
        authType === 'confirmRegister' &&    //Confirm registration form: requires > username & confirmation code (sent via email)
        
        <Card>
        <CardBody>
          <CardTitle>Confirm your Account</CardTitle>
          <p>Check your email for a confirmation code</p>
          <Form>
            <FormGroup>
              <FormInput name="username" onChange={onChange} placeholder="Username"/>
            </FormGroup>
            <FormGroup>
              <FormInput name="authCode" onChange={onChange} placeholder="Authorization Code"/>
            </FormGroup>
          </Form>
          <ButtonGroup>
            <Button onClick={confirmSignUp}>Confirm</Button>
          </ButtonGroup>
        </CardBody>
      </Card>
      }
      {
        authType === 'logIn' &&       //Log in form: requires > username & password
        <Card>
          <CardBody>
            <CardTitle>Log into Account</CardTitle>
            <Form>
              <FormGroup>
                <FormInput name="username" onChange={onChange} placeholder="Username"/>
              </FormGroup>
              <FormGroup>
                <FormInput name="password" onChange={onChange} type="password" placeholder="Pasword"/>
              </FormGroup>
            </Form>
            <ButtonGroup>
              <Button onClick={signIn}>Log in</Button>
              <Button theme="secondary" onClick={()=>updateAuthState(()=>({...authState, authType: 'register'}))}>Register an account</Button>
            </ButtonGroup>
          </CardBody>
        </Card>
      }
      {
        authType === 'loggedIn' &&    //Logged in state: Shows content of the app after being authorized
        
        <Card>
          <CardBody>
            <CardTitle>Hello World</CardTitle>
            <p>A link to the <a href="https://github.com/branfung/aws-user-auth-app">code</a> for this app</p>
            <p>And a link to <a href="https://github.com/branfung">my github</a></p>
            <ButtonGroup>
              <Button theme="danger" onClick={
               () => Auth.signOut().then(()=>updateAuthState(()=>({...authState, authType: 'logIn'})))
             }>Log out</Button>
            </ButtonGroup>
          </CardBody>
        </Card>
      }

      </div>
    </div>
  );
}

export default App;
