import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { HashRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <UserProvider>
      <App />
      </UserProvider>
    </Router>
  </React.StrictMode>
)
