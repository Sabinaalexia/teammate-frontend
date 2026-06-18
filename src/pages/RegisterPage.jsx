import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import logo from '../assets/logo.png';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Validare parolă ──
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSymbol: /[^A-Za-z0-9]/.test(formData.password),
  };
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = formData.password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordValid) {
      setError('Parola nu respectă cerințele de securitate.');
      return;
    }
    if (!passwordsMatch) {
      setError('Parolele nu coincid.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/register', formData);
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name
      }));
      setSuccess(`Bun venit în echipă, ${response.data.name}! Contul tău a fost creat cu succes.`);
      setFormData({ email: '', username: '', password: '', name: '' });
      setConfirmPassword('');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Înregistrarea a eșuat. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const RuleItem = ({ ok, text }) => (
    <div className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {ok
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
      </svg>
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full">

        {/* LOGO + TITLU */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="TeamMate Logo" className="h-24 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#8B1538] mb-2">Fă primul pas către succes!</h1>
          <p className="text-gray-600">Creează-ți cont și gestionează proiectele cu echipa ta!</p>
        </div>

        {/* MESAJE */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* FORMULAR */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nume</label>
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
            <label className="block text-gray-700 font-medium mb-2">Email</label>
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
            <label className="block text-gray-700 font-medium mb-2">Username</label>
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
            <label className="block text-gray-700 font-medium mb-2">Parolă</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#8B1538] rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition duration-200"
            />
            {/* Cerințe parolă */}
            {formData.password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1 p-2 bg-gray-50 rounded-lg">
                <RuleItem ok={passwordRules.minLength} text="Minim 8 caractere" />
                <RuleItem ok={passwordRules.hasUpper} text="Literă mare (A-Z)" />
                <RuleItem ok={passwordRules.hasNumber} text="Cifră (0-9)" />
                <RuleItem ok={passwordRules.hasSymbol} text="Simbol (!@#...)" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirmă parola</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent transition duration-200 ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-green-500 focus:ring-green-400'
                    : 'border-red-400 focus:ring-red-300'
                  : 'border-[#8B1538] focus:ring-[#8B1538]'
              }`}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">Parolele nu coincid.</p>
            )}
            {confirmPassword.length > 0 && passwordsMatch && (
              <p className="text-xs text-green-600 mt-1">✓ Parolele coincid.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch}
            className="w-full bg-[#6B0F2E] hover:bg-[#8B1538] text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Se creează contul...' : 'Creează-ți Cont!'}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600">
            Ai deja un cont TeamMate?{' '}
            <Link to="/login" className="text-[#8B1538] hover:text-[#6B0F2E] font-semibold transition duration-200">
              Autentifică-te aici!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;