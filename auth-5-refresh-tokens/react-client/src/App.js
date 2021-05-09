import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import * as api from './api';
import {FaFacebookF,FaGithub} from 'react-icons/fa'
import qs from 'query-string'

function App() {
  const [authenticated,set_authenticated] = useState(false);
  const [loading,set_loading] = useState(false);
  const [user,set_user] = useState(null);
  const [access_token,set_access_token] = useState(null);
  const [content,set_content] = useState('no content yet...');

  useEffect(()=>{
    if(window.location.search && window.location.search.includes('token')){
      console.log('search - ',window.location.search)
      const search = qs.parse(window.location.search);
      console.log('qs - ',search)
      const profile = JSON.parse(search.profile)
      const {token} = search
      console.log('profile - ',profile)
      console.log('token - ',token)
      if(profile && token){
       set_authenticated(true)
       set_user(profile)
       //  localStorage.setItem('token',token) //not secure
       set_access_token(token) //store access_token in-memory
 
       //remove query string and path from url...
       window.history.replaceState({}, document.title, "/");
      }
    }else if(!access_token){
      //ask access_token from server, in case refresh_token already exists as an httpOnly cookie
      const get_access = async ()=> {
          const response = await api.get_access_token();
          if('access_token' in response && 'profile' in response){
            set_access_token(response.access_token);
            set_authenticated(true);
            set_user(JSON.parse(response.profile))
          }else{
            alert('please login')
          }
      }
      get_access()
    }
  },[access_token])

  const connect = provider =>{
     set_loading(true)
     window.location.href = `http://localhost:3030/api/auth/${provider}`;  
  }

  const logout = async _ =>{
    const response = await api.logout()
    if(response.status === 'You are logged out'){
      set_authenticated(false)
      set_user(null)
      // localStorage.removeItem('token') //not secure
      set_access_token(null)
    }
  }
  const get_protected = async _ =>{
    //const token = localStorage.getItem('token') //not secure
    const token = access_token;
    const response = await api.get_protected({token})
    set_content(response.payload)
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <div className="top-box">
          <h1>Auth demo</h1>
          <img src={logo} className="logo" alt="logo" />
        </div>
        
        <p>Authenticated:<span className="lightblue-text">{' '+authenticated}</span></p>
        <p>Loading:<span className="lightblue-text">{' '+loading}</span></p>
        <div className="profile-box">
          {user && <>
            <p>{user.name}</p>
            <img className="profile-img" src={user && user.photo} alt="avatar" />
            </>}
        </div>
        <div className="buttons-box">
          {authenticated?
          <button className="btn" onClick={logout}>Logout</button>
          : <div>
              <button className="oauth-btn" onClick={()=> connect('github')}><FaGithub/></button>
              <button className="oauth-btn" onClick={()=> connect('facebook')}><FaFacebookF/></button>
            </div>
          }
          <button className="btn" onClick={get_protected}>get protected content</button>
        </div>
        <p className="content">{content}</p>
      </header>
    </div>
  );
}

export default App;

//:<button className="btn" onClick={login}>Login</button>}