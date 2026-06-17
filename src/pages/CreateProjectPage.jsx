import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';



// ─── ICONIȚE SVG ─────────────────────────────────────────────────────────────
const Icons = {
  Brainstorming: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Documentare: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Analiza: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Design: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  BazaDate: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  Cod: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Testare: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Documentatie: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Prezentare: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  Custom: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg
      className={`w-5 h-5 cursor-pointer transition-colors ${filled ? 'text-[#8B1538]' : 'text-gray-300'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

const ETAPE_PRESTABILITE = [
  { id: 'brainstorming', nume: 'Brainstorming & Idei', Icon: Icons.Brainstorming },
  { id: 'documentare', nume: 'Documentare & Căutare surse', Icon: Icons.Documentare },
  { id: 'analiza', nume: 'Analiză cerințe & Planiificare', Icon: Icons.Analiza },
  { id: 'design', nume: 'Design & Prototipuri', Icon: Icons.Design },
  { id: 'bazadate', nume: 'Bază de date (Design schemă)', Icon: Icons.BazaDate },
  { id: 'cod', nume: 'Implementare Cod', Icon: Icons.Cod },
  { id: 'testare', nume: 'Testare & Debugging', Icon: Icons.Testare },
  { id: 'documentatie', nume: 'Documentație finală', Icon: Icons.Documentatie },
  { id: 'prezentare', nume: 'Pregătire prezentare', Icon: Icons.Prezentare },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Icons.Star filled={star <= (hovered || value)} />
        </span>
      ))}
    </div>
  );
}

// ─── AUTOCOMPLETE MEMBRI ──────────────────────────────────────────────────────
function MemberAutocomplete({ numarMembri, membersToInvite, setMembersToInvite, labelOverride, infoOverride }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const numarInt = parseInt(numarMembri) || 0;
  const membriNecesari = numarInt > 1 ? numarInt - 1 : 0;
  const membriAdaugati = membersToInvite.length;
  const eroareMembri =
    membriAdaugati < membriNecesari
      ? `Trebuie să adaugi ${membriNecesari - membriAdaugati} ${membriNecesari - membriAdaugati === 1 ? 'membru' : 'membri'} în plus.`
      : membriAdaugati > membriNecesari
      ? `Ai adăugat prea mulți membri. Scoate ${membriAdaugati - membriNecesari}.`
      : null;

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoadingSearch(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/auth/search-users?q=${encodeURIComponent(val.trim())}`);
        const filtered = res.data.filter(
          (u) => !membersToInvite.some((m) => m.username === u.username)
        );
        setSuggestions(filtered);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
  };

  const handleSelect = (user) => {
    setMembersToInvite((prev) => [...prev, user]);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleRemove = (username) => {
    setMembersToInvite((prev) => prev.filter((m) => m.username !== username));
  };

  if (numarInt === 1) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {labelOverride || 'Membri echipă'} <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-400 mb-2">
        {infoOverride || `Tu ești inclus automat. Mai adaugă ${membriNecesari} ${membriNecesari === 1 ? 'coleg' : 'colegi'}.`}
      </p>
      <div className="relative" ref={wrapperRef}>
        <div className="flex items-center border-2 border-[#8B1538] rounded-lg px-3 py-2.5 gap-2 bg-white focus-within:ring-2 focus-within:ring-[#6B0F2E]">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Caută după username sau nume..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {loadingSearch && (
            <svg className="w-4 h-4 animate-spin text-[#8B1538] flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
        </div>
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#E8C5D0] rounded-lg shadow-xl overflow-hidden">
            {suggestions.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#FFF8F0] transition text-left border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && !loadingSearch && suggestions.length === 0 && query.trim().length >= 2 && (
          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#E8C5D0] rounded-lg shadow-xl px-3 py-3">
            <p className="text-sm text-gray-400 text-center">Niciun utilizator găsit</p>
          </div>
        )}
      </div>
      {eroareMembri && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2">
          <p className="text-xs text-red-600 font-medium">{eroareMembri}</p>
        </div>
      )}
      {membersToInvite.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {membersToInvite.map((m) => (
            <div
              key={m.username}
              className="flex items-center gap-1.5 bg-[#E8C5D0] text-[#8B1538] px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <div className="w-5 h-5 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {(m.name || m.username).charAt(0).toUpperCase()}
              </div>
              <span>{m.name || m.username}</span>
              <button
                type="button"
                onClick={() => handleRemove(m.username)}
                className="hover:text-red-600 transition ml-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MODAL TAXĂ 10+ ──────────────────────────────────────────────────────────
function ModalTaxa({ onClose, onConfirm }) {
  const [numarStudenti, setNumarStudenti] = useState('');
  const nr = parseInt(numarStudenti) || 0;
  const taxa = nr > 10 ? (nr - 10) * 5 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Echipă extinsă</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Primii <strong>10 membri</strong> sunt gratuiți. Fiecare student în plus costă <strong>5€/student</strong>.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Câți membri are echipa în total?
        </label>
        <input
          type="number"
          min="11"
          value={numarStudenti}
          onChange={(e) => setNumarStudenti(e.target.value)}
          className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm"
          placeholder="ex: 12"
        />
        {nr > 10 && (
          <div className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg p-3 mb-4 space-y-1">
            <p className="text-sm text-gray-700">Membri suplimentari: <strong>{nr - 10}</strong></p>
            <p className="text-lg font-bold text-[#8B1538]">Total de plată: {taxa}€</p>
          </div>
        )}
        {nr > 10 && (
          <>
            <button
              onClick={() => onConfirm(`${nr}`)}
              className="w-full bg-[#8B1538] text-white font-bold py-2.5 rounded-lg hover:bg-[#6B0F2E] transition text-sm"
            >
              Continuă spre plată
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Integrare Stripe — în curând</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MODAL ETAPĂ CUSTOM ──────────────────────────────────────────────────────
function ModalEtapaCustom({ onClose, onSave }) {
  const [data, setData] = useState({ nume: '', dificultate: 0 });

  const handleSave = () => {
    if (!data.nume.trim() || data.dificultate === 0) return;
    onSave({ ...data, id: `custom_${Date.now()}`, custom: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Etapă personalizată</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nume etapă <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nume}
              onChange={(e) => setData({ ...data, nume: e.target.value })}
              className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm"
              placeholder="ex: Cercetare piață"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificultate <span className="text-red-500">*</span>
            </label>
            <StarRating value={data.dificultate} onChange={(v) => setData({ ...data, dificultate: v })} />
            {data.dificultate === 0 && (
              <p className="text-xs text-gray-400 mt-1">Selectează cel puțin o stea</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm">
            Anulează
          </button>
          <button
            onClick={handleSave}
            disabled={!data.nume.trim() || data.dificultate === 0}
            className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg hover:bg-[#6B0F2E] transition text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Adaugă
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTA PRINCIPALĂ ────────────────────────────────────────────────────
function CreateProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  const [showModalTaxa, setShowModalTaxa] = useState(false);
  const [showModalCustom, setShowModalCustom] = useState(false);

  const [step1, setStep1] = useState({ name: '', description: '', numarMembri: '' });
  const [membersToInvite, setMembersToInvite] = useState([]);
  const [existingMembers, setExistingMembers] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const [step2, setStep2] = useState({ dataStart: today, deadline: '', bufferDays: 1 });

  const [etapeSelectate, setEtapeSelectate] = useState(
    ETAPE_PRESTABILITE.reduce((acc, e) => ({ ...acc, [e.id]: { selectat: false, dificultate: 0 } }), {})
  );
  const [etapeCustom, setEtapeCustom] = useState([]);

  // ── NOU: state pentru Step 5 ──
  const [createdProject, setCreatedProject] = useState(null);
  const [createdPhases, setCreatedPhases] = useState([]);
  // ─────────────────────────────

  useEffect(() => {
    setStep2(prev => ({ ...prev, bufferDays: 1 }));
  }, [step2.deadline, step2.dataStart]);

  // ─── Încarcă datele existente în mod editare ──────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/projects/${id}`);
        const p = res.data;
        setStep1({
          name: p.name || '',
          description: p.description || '',
          numarMembri: 'edit',
        });
        setStep2({
          dataStart: today,
          deadline: p.deadline || '',
          bufferDays: 1,
        });
        if (p.members && p.members.length > 0) {
          setExistingMembers(p.members.map((raw) => {
            const parts = raw.split('|');
            return { name: parts[0], status: parts[1] || 'ACCEPTED' };
          }));
        }
      } catch {
        setError('Nu s-au putut încărca datele proiectului.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchProject();
  }, [id, isEditMode]);

  const calcDurata = () => {
    if (!step2.dataStart || !step2.deadline) return null;
    const zile = Math.round((new Date(step2.deadline) - new Date(step2.dataStart)) / (1000 * 60 * 60 * 24));
    if (zile <= 0) return null;
    return { zile, sapt: Math.round(zile / 7) };
  };

  const numarInt = parseInt(step1.numarMembri) || 0;
  const membriNecesari = numarInt > 1 ? numarInt - 1 : 0;
  const membriOk = isEditMode || numarInt === 1 || membersToInvite.length === membriNecesari;

  const step1Valid = step1.name.trim().length >= 3 && (isEditMode || (step1.numarMembri !== '' && membriOk));
  const step2Valid = !!step2.deadline && !!calcDurata();

  const handleSubmit = async () => {
  setError('');
  setLoading(true);
  try {
    if (isEditMode) {
      await axios.put(`/projects/${id}`, {
        name: step1.name,
        description: step1.description,
        deadline: step2.deadline,
      });
      await Promise.all(
        membersToInvite.map((m) =>
          axios.post(`/projects/${id}/invite`, { emailOrUsername: m.username }).catch(() => {})
        )
      );
      navigate('/dashboard');
    } else {
      // ── Dacă proiectul e deja creat, doar reîncarcă fazele ──
      if (createdProject) {
        const phasesRes = await axios.get(`/projects/${createdProject.id}/phases`);
        setCreatedPhases(phasesRes.data);
        setStep(5);
        setLoading(false);
        return;
      }
      // ────────────────────────────────────────────────────────

      const etapeDeTrimis = [
        ...ETAPE_PRESTABILITE
          .filter((e) => etapeSelectate[e.id].selectat)
          .map((e, idx) => ({
            name: e.nume,
            difficulty: etapeSelectate[e.id].dificultate || 1,
            orderIndex: idx + 1,
          })),
        ...etapeCustom.map((e, idx) => ({
          name: e.nume,
          difficulty: e.dificultate || 1,
          orderIndex: ETAPE_PRESTABILITE.filter(ep => etapeSelectate[ep.id].selectat).length + idx + 1,
        })),
      ];

      const response = await axios.post('/projects', {
        name: step1.name,
        description: step1.description,
        startDate: step2.dataStart,
        deadline: step2.deadline,
        bufferDays: step2.bufferDays,
        phases: etapeDeTrimis,
      });

      const newProject = response.data;

      await Promise.all(
        membersToInvite.map((m) =>
          axios.post(`/projects/${newProject.id}/invite`, { emailOrUsername: m.username }).catch(() => {})
        )
      );

      const phasesRes = await axios.get(`/projects/${newProject.id}/phases`);
      setCreatedProject(newProject);
      setCreatedPhases(phasesRes.data);
      setStep(5);
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Eroare la salvarea proiectului.');
  } finally {
    setLoading(false);
  }
};

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center">
        <p className="text-white text-lg">Se încarcă proiectul...</p>
      </div>
    );
  }

  const toggleEtapa = (id) => {
  setEtapeSelectate((prev) => {
    const eraSelectat = prev[id].selectat;
    return {
      ...prev,
      [id]: {
        selectat: !eraSelectat,
        dificultate: eraSelectat ? 0 : prev[id].dificultate,
      },
    };
  });
};

  const setDificultate = (id, val) => {
    setEtapeSelectate((prev) => ({
      ...prev,
      [id]: { ...prev[id], dificultate: val, selectat: true },
    }));
  };

  // ─── STEP 1 ──────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-4 overflow-y-auto flex-1 pr-1">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nume proiect <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={step1.name}
          onChange={(e) => setStep1({ ...step1, name: e.target.value })}
          minLength={3}
          maxLength={100}
          className="w-full px-4 py-2.5 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm"
          placeholder="ex: Library Management System"
        />
        {step1.name.length > 0 && step1.name.trim().length < 3 ? (
          <p className="text-xs text-red-500 mt-1 font-medium">Numele trebuie să aibă cel puțin 3 caractere.</p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Între 3 și 100 de caractere</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
        <textarea
          value={step1.description}
          onChange={(e) => setStep1({ ...step1, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm resize-none"
          placeholder="Descrie pe scurt obiectivul proiectului..."
        />
      </div>
      {!isEditMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Număr membri echipă <span className="text-red-500">*</span>
          </label>
          <select
            value={step1.numarMembri}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '10+') {
                setShowModalTaxa(true);
              } else {
                setStep1({ ...step1, numarMembri: val });
                setMembersToInvite([]);
              }
            }}
            className="w-full px-4 py-2.5 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B1538'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px',
              appearance: 'none',
            }}
          >
            <option value="">Selectează...</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n === 1 ? '1' : n}</option>
            ))}
            <option value="10+">10+ (echipă extinsă)</option>
          </select>
        </div>
      )}
      {isEditMode && existingMembers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membri actuali ({existingMembers.length}):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {existingMembers.map((m, i) => {
              const isAccepted = m.status === 'ACCEPTED';
              return (
                <span key={i}
                  title={isAccepted ? 'Face parte din proiect' : 'Nu a acceptat încă invitația'}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-default
                    ${isAccepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {m.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <MemberAutocomplete
        numarMembri={isEditMode ? '2' : step1.numarMembri}
        membersToInvite={membersToInvite}
        setMembersToInvite={setMembersToInvite}
        labelOverride={isEditMode ? 'Adaugă membri noi' : undefined}
        infoOverride={isEditMode ? 'Caută și adaugă colegi suplimentari în echipă' : undefined}
      />
    </div>
  );

  // ─── STEP 2 ──────────────────────────────────────────────────────────────
  const renderStep2 = () => {
    const durata = calcDurata();
    const zileEfective = durata ? Math.max(0, durata.zile - step2.bufferDays) : null;

    return (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de start</label>
          <input
            type="date"
            value={step2.dataStart}
            onChange={(e) => setStep2({ ...step2, dataStart: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline final <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={step2.deadline}
            min={step2.dataStart || today}
            onChange={(e) => setStep2({ ...step2, deadline: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-[#8B1538] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B0F2E] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cu câte zile înainte vrei să fie gata proiectul?
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Ultimul sprint se va termina cu <strong>{step2.bufferDays} {step2.bufferDays === 1 ? 'zi' : 'zile'}</strong> înainte de deadline.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep2(prev => ({ ...prev, bufferDays: Math.max(1, prev.bufferDays - 1) }))}
              disabled={step2.bufferDays <= 1}
              className="w-9 h-9 rounded-full border-2 border-[#8B1538] text-[#8B1538] font-bold text-lg flex items-center justify-center hover:bg-[#FFF8F0] transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >−</button>
            <div className="flex-1 relative h-10 overflow-hidden">
              <div className="flex flex-col items-center" style={{
                transform: `translateY(calc(${-(step2.bufferDays)} * 2.5rem + 0rem))`,
                transition: 'transform 0.15s ease'
              }}>
                {Array.from({ length: (calcDurata()?.zile ?? 30) }, (_, i) => (
                  <div key={i}
                    className={`h-10 flex items-center justify-center w-full text-center font-bold text-lg transition-all ${
                      step2.bufferDays === i ? 'text-[#8B1538] scale-110' : 'text-gray-300 scale-90'
                    }`}>
                    {`${i} ${i === 1 ? 'zi' : 'zile'}`}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep2(prev => ({ ...prev, bufferDays: Math.min((calcDurata()?.zile ?? 1) - 1, prev.bufferDays + 1) }))}
              disabled={step2.bufferDays >= (calcDurata()?.zile ?? 1) - 1}
              className="w-9 h-9 rounded-full border-2 border-[#8B1538] text-[#8B1538] font-bold text-lg flex items-center justify-center hover:bg-[#FFF8F0] transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>
        {durata && (
          <div className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Zile rămase până la predare:</span>
              <strong className="text-[#8B1538]">{durata.zile} zile</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Durată de realizare efectivă:</span>
              <strong className="text-[#8B1538]">{zileEfective} zile</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Proiectul va fi gata pe:</span>
              <strong className="text-[#8B1538]">
                {new Date(new Date(step2.deadline).getTime() - step2.bufferDays * 86400000)
                  .toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </strong>
            </div>
          </div>
        )}
        {step2.deadline && !durata && (
          <p className="text-xs text-red-500">Deadline-ul trebuie să fie după data de start.</p>
        )}
      </div>
    );
  };

  // ─── STEP 3 ──────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
      {ETAPE_PRESTABILITE.map(({ id, nume, Icon }) => {
        const sel = etapeSelectate[id];
        return (
          <div
            key={id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition cursor-pointer ${
              sel.selectat ? 'border-[#8B1538] bg-[#FFF8F0]' : 'border-gray-200 hover:border-[#E8C5D0]'
            }`}
            onClick={() => toggleEtapa(id)}
          >
            <div className={`flex-shrink-0 ${sel.selectat ? 'text-[#8B1538]' : 'text-gray-400'}`}>
              <Icon />
            </div>
            <span className={`text-sm flex-1 ${sel.selectat ? 'font-medium text-[#8B1538]' : 'text-gray-600'}`}>
              {nume}
            </span>
            <div onClick={(e) => e.stopPropagation()}>
              <StarRating value={sel.dificultate} onChange={(v) => setDificultate(id, v)} />
            </div>
          </div>
        );
      })}
      {etapeCustom.map((e) => (
        <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-[#8B1538] bg-[#FFF8F0]">
          <div className="flex-shrink-0 text-[#8B1538]"><Icons.Custom /></div>
          <span className="text-sm flex-1 font-medium text-[#8B1538]">{e.nume}</span>
          <div className="flex items-center gap-2">
            <StarRating value={e.dificultate} onChange={() => {}} />
            <button
              onClick={() => setEtapeCustom((prev) => prev.filter((x) => x.id !== e.id))}
              className="text-gray-400 hover:text-red-500 transition ml-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => setShowModalCustom(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-[#E8C5D0] text-[#8B1538] hover:border-[#8B1538] hover:bg-[#FFF8F0] transition text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Adaugă etapă personalizată
      </button>
    </div>
  );

  // ─── STEP 4 ──────────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const etapeAlese = ETAPE_PRESTABILITE.filter((e) => etapeSelectate[e.id].selectat);
    const durata = calcDurata();
    return (
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        <div className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg p-4 space-y-2">
          <p className="text-sm"><span className="text-gray-500">Proiect: </span><strong className="text-[#8B1538]">{step1.name}</strong></p>
          {step1.description && <p className="text-xs text-gray-500">{step1.description}</p>}
          <p className="text-sm"><span className="text-gray-500">Echipă: </span><strong>{step1.numarMembri} {step1.numarMembri === '1' ? 'membru' : 'membri'}</strong></p>
          <p className="text-sm"><span className="text-gray-500">Start: </span><strong>{step2.dataStart}</strong></p>
          <p className="text-sm"><span className="text-gray-500">Deadline: </span><strong>{step2.deadline}</strong></p>
          {durata && <p className="text-sm"><span className="text-gray-500">Durată: </span><strong>{durata.zile} zile ({durata.sapt} săptămâni)</strong></p>}
        </div>
        {membersToInvite.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Membri echipă ({membersToInvite.length + 1} total, inclusiv tu):</p>
            <div className="flex flex-wrap gap-1.5">
              {membersToInvite.map((m) => (
                <div key={m.username} className="flex items-center gap-1.5 bg-[#E8C5D0] text-[#8B1538] px-3 py-1.5 rounded-full text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center">
                    {(m.name || m.username).charAt(0).toUpperCase()}
                  </div>
                  <span>{m.name || m.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(etapeAlese.length > 0 || etapeCustom.length > 0) && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Etape ({etapeAlese.length + etapeCustom.length}):</p>
            <div className="flex flex-wrap gap-1.5">
              {etapeAlese.map((e) => (
                <span key={e.id} className="bg-[#E8C5D0] text-[#8B1538] text-xs px-2.5 py-1 rounded-full font-medium">{e.nume}</span>
              ))}
              {etapeCustom.map((e) => (
                <span key={e.id} className="bg-[#E8C5D0] text-[#8B1538] text-xs px-2.5 py-1 rounded-full font-medium">{e.nume}</span>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
        )}
      </div>
    );
  };

  // ─── STEP 5 — Plan sprinturi ──────────────────────────────────────────────
  const renderStep5 = () => {
    const parseDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
  return new Date(d);
};
const fmt = (d) => {
  const date = parseDate(d);
  if (!date) return '-';
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const zileDintre = (s, e) => {
  const start = parseDate(s);
  const end = parseDate(e);
  if (!start || !end) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-[#8B1538]">{createdProject?.name}</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {createdPhases.map((phase, idx) => (
            <div key={phase.id} className="border-2 border-[#E8C5D0] bg-[#FFF8F0] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="font-bold text-sm text-[#8B1538]">{phase.name}</p>
                </div>
                <span className="text-xs text-gray-500 font-medium bg-white border border-[#E8C5D0] px-2.5 py-1 rounded-full">
                  {zileDintre(phase.startDate, phase.endDate)} zile
                </span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <svg className="w-3.5 h-3.5 text-[#8B1538] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-600">
                  {fmt(phase.startDate)} → {fmt(phase.endDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // ─────────────────────────────────────────────────────────────────────────

  const STEPS_CONFIG = [
    { label: 'Detalii', render: renderStep1, valid: step1Valid },
    { label: 'Timeline', render: renderStep2, valid: step2Valid },
    { label: 'Etape', render: renderStep3, valid: true },
    { label: 'Confirmare', render: renderStep4, valid: true },
    { label: 'Plan', render: renderStep5, valid: true },
  ];

  const currentConfig = STEPS_CONFIG[step - 1];

  return (
    <>
      {showModalTaxa && (
        <ModalTaxa
          onClose={() => setShowModalTaxa(false)}
          onConfirm={(nr) => { setStep1({ ...step1, numarMembri: nr }); setShowModalTaxa(false); }}
        />
      )}
      {showModalCustom && (
        <ModalEtapaCustom
          onClose={() => setShowModalCustom(false)}
          onSave={(e) => setEtapeCustom((prev) => [...prev, e])}
        />
      )}

      <div className="fixed inset-0 bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
          style={{ maxWidth: '560px', height: '88vh', maxHeight: '700px' }}
        >
          {/* Header */}
<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
  <div className="flex items-center gap-3">
    {step === 5 && (
      <button
        onClick={() => setStep(4)}
        className="text-gray-400 hover:text-[#8B1538] transition p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    )}
    <div>
      <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mb-0.5">
  {`Pas ${step} din 5 — ${currentConfig.label}`}
</p>
      <h2 className="text-xl font-bold text-[#8B1538]">
        {step === 5 ? 'Planificarea proiectului' : isEditMode ? 'Editează Proiect' : 'Proiect Nou'}
      </h2>
    </div>
  </div>
  {step !== 5 && (
    <button
      onClick={() => navigate('/dashboard')}
      className="text-gray-400 hover:text-[#8B1538] transition p-1.5 rounded-full hover:bg-gray-100"
      title="Ieși fără salvare"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}
</div>

          {/* Progress — ascuns pe step 5 */}
         <div className="px-6 pt-3 pb-2 flex-shrink-0">
  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-[#8B1538] rounded-full transition-all duration-500"
      style={{ width: `${(step / 5) * 100}%` }}
    />
  </div>
  <div className="flex justify-between mt-1.5">
    {STEPS_CONFIG.map((s, i) => (
      <span key={i} className={`text-xs transition ${i + 1 <= step ? 'text-[#8B1538] font-medium' : 'text-gray-300'}`}>
        {s.label}
      </span>
    ))}
  </div>
</div>

          {/* Content */}
          <div className="px-6 py-4 flex-1 overflow-hidden flex flex-col">
            {currentConfig.render()}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3 flex-shrink-0">
            {step === 5 ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-2.5 border-2 border-[#8B1538] text-[#8B1538] font-bold rounded-lg hover:bg-[#FFF8F0] transition text-sm"
                >
                  Începe mai târziu
                </button>
                <button
                  onClick={() => navigate(`/projects/${createdProject?.id}`)}
                  className="flex-1 py-2.5 bg-[#8B1538] text-white font-bold rounded-lg hover:bg-[#6B0F2E] transition text-sm"
                >
                  Începe acum →
                </button>
              </>
            ) : step > 1 ? (
              <>
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-2.5 border-2 border-[#8B1538] text-[#8B1538] font-bold rounded-lg hover:bg-[#FFF8F0] transition text-sm"
                >
                  ← Înapoi
                </button>
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!currentConfig.valid}
                    className="flex-1 py-2.5 bg-[#8B1538] text-white font-bold rounded-lg hover:bg-[#6B0F2E] transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Următorul →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-[#6B0F2E] text-white font-bold rounded-lg hover:bg-[#8B1538] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Se salvează...' : isEditMode ? 'Salvează modificările' : 'Creează Proiect'}
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="flex-1" />
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!currentConfig.valid}
                  className="flex-1 py-2.5 bg-[#8B1538] text-white font-bold rounded-lg hover:bg-[#6B0F2E] transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Următorul →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateProjectPage;