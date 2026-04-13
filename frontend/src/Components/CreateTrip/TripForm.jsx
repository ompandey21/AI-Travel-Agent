import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";




const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
  "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
  "Chandigarh", "Solapur", "Hubballi", "Bareilly", "Mysore", "Moradabad", "Gurgaon",
  "Noida", "Thiruvananthapuram", "Kochi", "Udaipur", "Shimla", "Manali", "Dharamshala",
  "Mussoorie", "Nainital", "Dehradun", "Haridwar", "Rishikesh", "Mathura", "Vrindavan",
  "Pushkar", "Ajmer", "Mount Abu", "Jaisalmer", "Bikaner", "Alwar", "Puri",
  "Bhubaneswar", "Cuttack", "Rourkela", "Tirupati", "Vellore", "Salem", "Trichy",
  "Pondicherry", "Ooty", "Kodaikanal", "Munnar", "Kozhikode", "Thrissur", "Mangalore",
  "Hubli", "Belgaum", "Kolhapur", "Satara", "Mahabaleshwar", "Lonavala", "Shirdi",
  "Nashik", "Aurangabad", "Ellora", "Ajanta", "Hampi", "Goa", "Panaji", "Margao",
  "Port Blair", "Shillong", "Gangtok", "Darjeeling", "Siliguri", "Imphal", "Aizawl"
];

export default function TripCreationPage() {
  const [form, setForm] = useState({
    name: "", startLocation: "", destination: "", startDate: "", endDate: "", budget: 3000, cover: null,
  });
  const [startLocationInput, setStartLocationInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredStartCities = startLocationInput.trim().length > 0
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(startLocationInput.toLowerCase())).slice(0, 8)
    : [];

  const filteredCities = destinationInput.trim().length > 0
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(destinationInput.toLowerCase())).slice(0, 8)
    : [];
  const navigate = useNavigate();

  const update = key => val => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const errs = {};
    const today = new Date().toISOString().split("T")[0];
    if (!form.name.trim()) errs.name = "Trip name is required.";
    if (!form.startLocation.trim()) errs.startLocation = "Start location is required.";
    if (!form.destination.trim()) errs.destination = "Destination is required.";
    if (
      form.startLocation.trim() &&
      form.destination.trim() &&
      form.startLocation.trim().toLowerCase() === form.destination.trim().toLowerCase()
    ) errs.destination = "Destination must be different from start location.";
    if (!form.startDate) errs.startDate = "Start date is required.";
    else if (form.startDate < today) errs.startDate = "Start date can't be in the past.";
    if (!form.endDate) errs.endDate = "End date is required.";
    else if (form.endDate < today) errs.endDate = "End date can't be in the past.";
    else if (form.startDate && form.endDate <= form.startDate) errs.endDate = "End date must be after start date.";
    if (form.cover && !form.cover.type.startsWith("image/")) errs.cover = "Only image files are allowed.";
    return errs;
  };


  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("startLocation", form.startLocation);
      formData.append("destination", form.destination);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("budget", form.budget);
      if (form.cover) formData.append("cover_img", form.cover);

      const res = await axios.post(`${API_BASE}/api/trips/create-trip`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201) navigate('/profile');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">


      {/* MAIN CONTAINER */}
      <div className="w-[95%] max-w-6xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2 bg-white">

        {/* LEFT VIDEO */}
        <div className="hidden md:block relative">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          >
            <source src={import.meta.env.VITE_TRIP_VIDEO} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Plan your dream trip
            </h2>
            <p className="text-sm opacity-80">
              Let AI handle the chaos ✨
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="flex items-center justify-center p-6 md:p-10 overflow-y-auto">

          <div className="w-full max-w-md space-y-6">

            {/* TITLE */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Create Trip
              </h1>
              <p className="text-sm text-gray-500">
                Start planning in seconds
              </p>
            </div>

            {/* INPUTS */}

            <input
              placeholder="Trip Name"
              value={form.name}
              onChange={e => { update("name")(e.target.value); setErrors(er => ({ ...er, name: undefined })); }}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#3D9A9B] ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            <div className="relative">
              <input
                placeholder="Starting location"
                value={form.startLocation ? form.startLocation : startLocationInput}
                onChange={e => {
                  if (form.startLocation) {
                    update("startLocation")("");
                  }
                  setStartLocationInput(e.target.value);
                  setShowStartSuggestions(true);
                  setErrors(er => ({ ...er, startLocation: undefined }));
                }}
                onBlur={() => setTimeout(() => {
                  setShowStartSuggestions(false);
                  if (!form.startLocation) setStartLocationInput("");
                }, 150)}
                onFocus={() => setShowStartSuggestions(true)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#3D9A9B] focus:outline-none ${errors.startLocation ? "border-red-400" : "border-gray-200"}`}
                autoComplete="off"
              />
              {showStartSuggestions && filteredStartCities.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredStartCities.map(city => (
                    <li
                      key={city}
                      onMouseDown={() => {
                        update("startLocation")(city);
                        setStartLocationInput("");
                        setShowStartSuggestions(false);
                        setErrors(er => ({ ...er, startLocation: undefined }));
                      }}
                      className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#3D9A9B]/10 hover:text-[#3D9A9B] cursor-pointer transition-colors"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.startLocation && <p className="text-xs text-red-500 mt-1">{errors.startLocation}</p>}
            <div className="relative">
              <input
                placeholder="Search destination"
                value={form.destination ? form.destination : destinationInput}
                onChange={e => {
                  if (form.destination) {
                    update("destination")("");
                  }
                  setDestinationInput(e.target.value);
                  setShowSuggestions(true);
                  setErrors(er => ({ ...er, destination: undefined }));
                }}
                onBlur={() => setTimeout(() => {
                  setShowSuggestions(false);
                  // If nothing was confirmed from the list, clear the typed text
                  if (!form.destination) setDestinationInput("");
                }, 150)}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#3D9A9B] focus:outline-none ${errors.destination ? "border-red-400" : "border-gray-200"}`}
                autoComplete="off"
              />
              {showSuggestions && filteredCities.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredCities.map(city => (
                    <li
                      key={city}
                      onMouseDown={() => {
                        update("destination")(city);
                        setDestinationInput("");
                        setShowSuggestions(false);
                        setErrors(er => ({ ...er, destination: undefined }));
                      }}
                      className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#3D9A9B]/10 hover:text-[#3D9A9B] cursor-pointer transition-colors"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}

            {/* DATES */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => { update("startDate")(e.target.value); setErrors(er => ({ ...er, startDate: undefined })); }}
                  className={`w-full px-3 py-3 rounded-xl border ${errors.startDate ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                  onChange={e => { update("endDate")(e.target.value); setErrors(er => ({ ...er, endDate: undefined })); }}
                  className={`w-full px-3 py-3 rounded-xl border ${errors.endDate ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            
            {(() => {
              const LEVELS = [1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000];
              const idx = LEVELS.indexOf(form.budget) === -1 ? 0 : LEVELS.indexOf(form.budget);
              return (
                <div>
                  <p className="text-sm mb-2 text-gray-600">
                    Budget <span className="text-gray-400 font-normal">(per member)</span>: <span className="font-semibold text-[#3D9A9B]">₹{form.budget.toLocaleString("en-IN")}</span>
                  </p>
                  <input
                    type="range"
                    min="0"
                    max={LEVELS.length - 1}
                    step="1"
                    value={LEVELS.indexOf(form.budget) === -1 ? 0 : LEVELS.indexOf(form.budget)}
                    onChange={e => update("budget")(LEVELS[Number(e.target.value)])}
                    className="w-full accent-[#3D9A9B]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>₹1,000</span><span>₹20,000</span>
                  </div>
                </div>
              );
            })()}
            <label
              htmlFor="cover-upload"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#3D9A9B] hover:bg-gray-50 transition-all"
            >
              <ImageIcon size={18} className="text-[#3D9A9B] flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {form.cover ? form.cover.name : "Upload cover photo"}
              </span>
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file && !file.type.startsWith("image/")) {
                  setErrors(er => ({ ...er, cover: "Only image files are allowed." }));
                  e.target.value = "";
                } else {
                  setErrors(er => ({ ...er, cover: undefined }));
                  update("cover")(file);
                }
              }}
              className="hidden"
            />
            {errors.cover && <p className="text-xs text-red-500 mt-1">{errors.cover}</p>}

            {/* BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{
                background: "#3D9A9B"
              }}
            >
              {submitting ? "Creating..." : "Create Trip →"}
            </motion.button>

          </div>
        </div>
      </div>
    </div>
  );
}