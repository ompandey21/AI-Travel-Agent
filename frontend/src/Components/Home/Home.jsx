import FAQ from "./FAQ";
import Features from "./Features"
import Footer from "./Footer";
import HeroSection from "./HeroSection"
import Navbar from "../Navbar/Navbar";

const Home = () => {
    return(
        <>
            <Navbar/>
            <HeroSection/>
            <Features/>
            <FAQ/>
            <Footer/>
        </>
    )
}

export default Home;