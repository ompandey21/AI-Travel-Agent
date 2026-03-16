import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Components/Home/Home';
import Auth from './Components/Auth/Auth';
import Navbar from './Components/Navbar/Navbar';
import ProtectedRoute from './utils/ProtectedRoute';
import TripCreationPage from './Components/CreateTrip/TripForm';
function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/auth' element = {<Auth/>}/>
          <Route path='/' element = {<Home/>}/>
          <Route path='/createTrip' 
            element = {
            <ProtectedRoute>
              <TripCreationPage/>
            </ProtectedRoute>
            }/>
        </Routes>
      </Router>
    </>
  )
}

export default App
