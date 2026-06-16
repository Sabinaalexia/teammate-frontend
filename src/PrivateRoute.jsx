import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('token');
  
  // Dacă nu există token → redirectează la login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Dacă există token → afișează pagina
  return children;
}

export default PrivateRoute;