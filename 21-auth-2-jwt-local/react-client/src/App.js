import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import * as api from './api';

function App() {
  const [authenticated,set_authenticated] = useState(false);
  const [user,set_user] = useState(null);
  const [content,set_content] = useState('no content yet...');
  
  const login = async e =>{
    e.preventDefault();
    const response = await api.login()
    if(response.status === "you are authenticated"){
      set_authenticated(true)
      set_user(response.payload)
      localStorage.setItem('token',response.token)
    }
  }
  const logout = async e =>{
    e.preventDefault();
    const response = await api.logout() // no need for that...
    set_authenticated(false)
    set_user(null)
    localStorage.removeItem('token')
  }
  const get_protected = async e =>{
    e.preventDefault();
    const token = localStorage.getItem('token')
    const response = await api.get_protected({token})
    set_content(response.payload)
    
  }
  useEffect(()=> {
    const get_data = async ()=> {
      const token = localStorage.getItem('token')
      const response = await api.get_my_user_data({token})
      if(response.status == 'OK'){
        set_authenticated(true)
        set_user(response.payload)
      }
    }
    get_data()
  },[])
  return (
    <div className="App">
      <header className="App-header">
        <div className="top-box">
          <h1>Auth demo</h1>
          <img src={logo} className="logo" alt="logo" />
        </div>
        
        <p>Authenticated:<span className="lightblue-text">{' '+authenticated}</span></p>
        <div><span className="lightblue-text">user:</span>
        <pre>{JSON.stringify(user,null,2)}</pre>
        </div>
        <div>
          {authenticated?
          <button className="btn" onClick={logout}>Logout</button>
          :<button className="btn" onClick={login}>Login</button>}
          <button className="btn" onClick={get_protected}>get protected content</button>
        </div>
        <p>{content}</p>
      </header>
    </div>
  );
}

export default App;
