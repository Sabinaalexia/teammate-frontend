import { useState } from 'react';
iimport axios from '../axiosConfig';
import logo from '../assets/logo.png';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', formData);
      
      // Salvează token-ul în localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name
      }));
      
      setSuccess(`Bun venit în echipă, ${response.data.name}! `);
      setFormData({ email: '', username: '', password: '', name: '' });
      
      // Redirect către dashboard după 2 secunde
      setTimeout(() => {
        console.log('Token salvat:', response.data.token);
        // TODO: Redirect către dashboard
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Înregistrarea a eșuat. Te rugăm să încerci din nou.');
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
            Fă primul pas către succes! 
          </h1>
          <p className="text-gray-600">
            Creează-ți cont și gestionează proiectele cu echipa ta!
          </p>
        </div>

        {/* MESAJE EROARE/SUCCES */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium"> {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-medium"> {success}</p>
          </div>
        )}

        {/* FORMULAR */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nume 
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition duration-200"
              
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email 
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition duration-200"
              
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition duration-200"
              
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Parola
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition duration-200"
              
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B0F2E] hover:bg-[#8B1538] text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Se creează contul... ' : 'Creează-ți Cont ! '}
          </button>
        </form>

        {/* LINK CĂTRE LOGIN */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600">
            Ai deja un cont TeamMate?{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.navigateTo('login'); }}
              className="text-[#8B1538] hover:text-[#6B0F2E] font-semibold transition duration-200"
            >
              Autentifică-te aici ! →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;