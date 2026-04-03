import { useParams } from "react-router-dom";

const MyTrip = () => {
    const params = useParams();

    
    return(
        <>
            My Trip Page for id : {params.id}!!
           
        </>
    )
}

export default MyTrip;