import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from './components/register';
import Login from './components/login';
import HomePage from './components/homepage';
import SecurityQuestions from './components/securityQuestions';
import SecurityQuestionsLogin from './components/securityQuestionsLogin';
import CaeserCipherLogin from './components/caeserCipherLogin';

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route exact path='/' element={<Register />} />

        <Route exact path='/login' element={<Login />} />

        <Route exact path='/dashboard' element={<HomePage />} />

        <Route exact path='/SecurityQuestions' element={<SecurityQuestions />} />
        
        <Route exact path='/SecurityQuestionsLogin' element={<SecurityQuestionsLogin />} />

        <Route exact path='/CaeserCipherLogin' element={<CaeserCipherLogin />} />

      </Routes>
    </BrowserRouter>

  );
}

export default App;
