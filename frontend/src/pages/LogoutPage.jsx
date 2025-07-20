import {useHistory} from "react-router-dom";

const LogoutPage = () => {
    const history = useHistory();
    localStorage.clear();
    history.push('/');
    return null;
}

export default LogoutPage