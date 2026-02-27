import { useNavigate } from "react-router-dom";

export default function Navbar(){
    const navigate = useNavigate();

    return(
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>
                            InterNation
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => navigate('/auth')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}