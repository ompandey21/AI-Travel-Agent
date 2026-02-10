import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    return (
        <>
            <div>
                Welcome to InterNation
            </div>
            <button onClick={() => navigate('/auth')}>
                Get Started
            </button>

        </>
    )
}

export default Home;
