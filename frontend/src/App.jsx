import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Auth from "./Components/Auth/Auth";
import Navbar from "./Components/Navbar/Navbar";
import ProtectedRoute from "./utils/ProtectedRoute";
import TripCreationPage from "./Components/CreateTrip/TripForm";
import MyTrip from "./Components/CreateTrip/MyTrip";
import ProfilePage from "./Components/Profile/ProfilePage";
import TripDashboard from "./Components/Trip/TripDashboard";
import InviteConfirmPage from "./Components/Invite/InvitePage";
import ItineraryPage from "./Components/Itinerary/ItineraryPage";
function App() {
  return (
    <>
      <Router>
        
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/createpassword/:token" element={<Auth />} />
          <Route path="/join-trip" element={<InviteConfirmPage />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/createTrip"
            element={
              <ProtectedRoute>
                <TripCreationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:tripId/itinerary"
            element={
              <ProtectedRoute>
                <ItineraryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
