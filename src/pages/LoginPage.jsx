import { useState } from 'react';
import axios from '../axiosConfig';
import logo from '../assets/logo.png';

function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', formData);
      
      // Salvează token-ul în localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name
      }));
      
      console.log('Login reușit! Token salvat:', response.data.token);
      alert(`Bine ai revenit, ${response.data.name}! `);
      
      // TODO: Redirect către dashboard
      
    } catch (err) {
      setError(err.response?.data?.error || 'Autentificare eșuată. Verifică datele introduse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        
        {/* LOGO + TITLU */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="TeamMate Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#8B1538] mb-2">
            Bine ai revenit! 
          </h1>
          <p className="text-gray-600">
            Continuă munca în echipă la proiectele tale!
          </p>
        </div>

        {/* MESAJ EROARE */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium"> {error}</p>
          </div>
        )}

        {/* FORMULAR */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email sau Username
            </label>
            <input
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#6B0F2E] focus:border-transparent transition duration-200"
              
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Parolă
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#6B0F2E] focus:border-transparent transition duration-200"
              
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B0F2E] hover:bg-[#8B1538] text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Se autentifică... ' : 'Intră în Cont '}
          </button>
        </form>

        {/* LINK CĂTRE REGISTER */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600">
            Nou pe TeamMate?{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.navigateTo('register'); }}
              className="text-[#8B1538] hover:text-[#6B0F2E] font-semibold transition duration-200"
            >
              Creează-ți cont ! →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;