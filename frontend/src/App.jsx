import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Components/Home/Home';
import Auth from './Components/Auth/Auth';
import Navbar from './Components/Navbar/Navbar';

function App() {

  return (
    <>
      
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element = {<Home/>}/>
          <Route path='/auth' element = {<Auth/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
