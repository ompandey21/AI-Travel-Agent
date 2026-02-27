import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
                    Welcome to InterNation
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Your AI-powered travel companion for unforgettable journeys
                </p>
                <button 
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
                >
                    Get Started
                </button>
            </div>
        </div>
    )
}

export default Home;
