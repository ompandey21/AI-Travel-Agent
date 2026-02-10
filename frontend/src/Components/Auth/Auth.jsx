import { useState } from "react"
import SignUp from "./SignUp";

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    return(
        <>
         {
            isSignUp && <Login/>
         }
         {
            !isSignUp && <SignUp/>
         }
         <button>
            {isSignUp ? "Register" : "Login"}
         </button> 
         <div className="cursor-pointer" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already a member?" : "Create new account"}
         </div> 
        </>
    )
}

export default Auth;