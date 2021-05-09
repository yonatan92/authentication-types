import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as api from './api';

function App() {
  const [authenticated,set_authenticated] = useState(false);
  const [user,set_user] = useState(null);
  const [content,set_content] = useState('no content yet...');
  
  const login = async e =>{
    const response = await api.login()
    if(response.status === "you are authenticated"){
      set_authenticated(true)
      set_user(response.user)
    }
  }
  const logout = async e => {
    const response = await api.logout()
    if(response.status === 'You are logged out'){
      set_authenticated(false)
      set_user(null)
    }
  }
  const get_protected = async e =>{
    const response = await api.get_protected()
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
