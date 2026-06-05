import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Calendar from "./pages/Calendar";
import Speakers from "./pages/Speakers";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import SpeakerDetails from "./pages/SpeakerDetails";
import Schedule from "./pages/Schedule";
import Pages from "./pages/Pages";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import EventList from "./pages/EventList";
import VenueList from "./pages/VenueList";
import AddEvent from "./pages/AddEvent";
import AddVenue from "./pages/AddVenue";
import AddSpeaker from "./pages/AddSpeaker";
import SpeakerList from "./pages/SpeakerList";
import BookingList from "./pages/BookingList";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";


export default function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venue/:id" element={<VenueDetails />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/speaker/:id" element={<SpeakerDetails />} />
            <Route path="/admin" element={<MainLayout />} >
            <Route index element={<Dashboard/>}/>
            <Route path="users" element={<Users/>}/>
            <Route path="event-List" element={<EventList/>}/>
            <Route path="speaker-list" element={<SpeakerList/>}/>
            <Route path="venue-List" element={<VenueList/>}/>
            <Route path="add-event" element={<AddEvent/>}/>
            <Route path="add-venue" element={<AddVenue/>}/>
            <Route path="add-speaker" element={<AddSpeaker/>}/>
            <Route path="bookings" element={<BookingList/>}/>
          
            

            </Route>
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}