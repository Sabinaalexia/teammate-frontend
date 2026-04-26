import { useState } from 'react';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [currentPage, setCurrentPage] = useState('register');

  // Simulare navigare simplă (temporar, până instalăm React Router)
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Actualizăm link-urile din pagini să folosească funcția noastră
  window.navigateTo = handleNavigation;

  if (currentPage === 'login') {
    return <LoginPage />;
  }

  return <RegisterPage />;
}

export default App;