import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const renderTextWithLinks = (text) => {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium inline-flex items-center gap-0.5">
          {part}<span className="text-[10px] no-underline">↗</span>
        </a>
      );
    }
    return part;
  });
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const zilePanaLa = (dateStr) => {
  if (!dateStr) return null;
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const end = new Date(dateStr); end.setHours(0, 0, 0, 0);
  return Math.round((end - azi) / (1000 * 60 * 60 * 24));
};
const getProgressColor = (percent) => {
  if (percent <= 30) return 'bg-red-500';
  if (percent <= 70) return 'bg-yellow-400';
  return 'bg-green-500';
};
const getProgressTextColor = (percent) => {
  if (percent <= 30) return 'text-red-500';
  if (percent <= 70) return 'text-yellow-500';
  return 'text-green-500';
};
const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Neînceput' },
  { value: 'IN_PROGRESS', label: 'În lucru' },
  { value: 'DONE', label: 'Terminat' },
];
const STATUS_STYLE = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

const AuditCustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/85 backdrop-blur-sm px-3 py-2 rounded-xl text-white shadow-xl border border-gray-700 z-50">
        <p className="text-xs font-bold">{data.username}</p>
        <p className="text-xs text-gray-300">Progres: {data.procentPerformanta}%</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Dată nivel: {data.dataFinalizare}</p>
      </div>
    );
  }
  return null;
};

function DashboardAuditMembri({ phases, activePhaseId }) {
  const [selectedSprint, setSelectedSprint] = useState(activePhaseId ? activePhaseId.toString() : 'total');
  const calculateStats = () => {
    const statsMap = {};
    const targetPhases = selectedSprint === 'total' ? phases : phases.filter(p => p.id.toString() === selectedSprint);
    targetPhases.forEach(phase => {
      (phase.tasks || []).forEach(task => {
        const names = task.assignedToNames && task.assignedToNames.length > 0 ? task.assignedToNames : ['Neatribuit'];
        names.forEach(name => {
          if (!statsMap[name]) statsMap[name] = { username: name, allocatedTasks: 0, doneTasks: 0, history: [] };
          statsMap[name].allocatedTasks += 1;
          if (task.status === 'DONE') {
            statsMap[name].doneTasks += 1;
            statsMap[name].history.push(task.createdAt ? new Date(task.createdAt) : new Date());
          }
        });
      });
    });
    return Object.values(statsMap).map(u => {
      const percentage = u.allocatedTasks > 0 ? Math.round((u.doneTasks / u.allocatedTasks) * 100) : 0;
      const sortedHistory = u.history.sort((a, b) => a - b);
      return {
        username: u.username, allocatedTasks: u.allocatedTasks, doneTasks: u.doneTasks,
        procentPerformanta: percentage, historyDates: sortedHistory,
        dataFinalizare: sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].toLocaleDateString('ro-RO') : 'Niciun task finalizat'
      };
    });
  };
  const stats = calculateStats();
  const COLORS = ['#8B1538', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const allocatedData = stats.map(u => ({ name: u.username, value: u.allocatedTasks }));
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    if (percent === 0) return null;
    return <text x={x} y={cy + radius * Math.sin(-midAngle * RADIAN)} fill="#374151" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">{`${(percent * 100).toFixed(0)}%`}</text>;
  };
  return (
    <div className="w-full bg-white rounded-3xl border-2 border-[#E8C5D0] p-8 space-y-8 shadow-sm mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-4 gap-3">
        <h3 className="font-bold text-lg text-[#8B1538] uppercase tracking-wider">SISTEM DE EVALUARE COMPARATIVĂ</h3>
        <select value={selectedSprint} onChange={(e) => setSelectedSprint(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 bg-[#FFF8F0] border-2 border-[#E8C5D0] text-[#8B1538] rounded-xl focus:outline-none focus:border-[#8B1538] cursor-pointer">
          <option value="total">Per total proiect</option>
          {phases.map((phase, idx) => <option key={phase.id} value={phase.id}>Sprint {idx + 1}: {phase.name}</option>)}
        </select>
      </div>
      {stats.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-400 italic text-sm">Nu există task-uri înregistrate.</p></div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start w-full">
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-4">
                <h4 className="font-bold text-sm text-gray-800 uppercase">Gestiunea resurselor umane</h4>
                <p className="text-xs text-gray-500 font-medium">Volumul de sarcini alocate per membru</p>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={allocatedData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
                      {allocatedData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0];
                        return <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: '12px', padding: '8px 12px' }}>
                          <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>{entry.name}</p>
                          <p style={{ color: '#fff', fontSize: '12px', margin: '2px 0 0 0' }}>Alocat: {entry.value} task-uri</p>
                        </div>;
                      }
                      return null;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-4">
                <h4 className="font-bold text-sm text-gray-800 uppercase">Rata de livrare realizată</h4>
                <p className="text-xs text-gray-500 font-medium">Progresul real de performanță per membru</p>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={stats} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <YAxis dataKey="username" type="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#374151' }} width={70} />
                    <Tooltip content={<AuditCustomBarTooltip />} />
                    <Bar dataKey="procentPerformanta" radius={[0, 6, 6, 0]} barSize={24} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                      {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-gray-100 w-full">
            {stats.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs font-bold text-gray-700">{s.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModalAddTask({ phaseId, members, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [search, setSearch] = useState('');
  const [assignMode, setAssignMode] = useState('manual');
  const [randomPickedList, setRandomPickedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleRandomToggleClick = () => {
    if (assignMode !== 'random') {
      setAssignMode('random');
      setAssignedTo([]);
      pickOneRandom([]);
    } else {
      pickOneRandom(randomPickedList);
    }
  };

  const pickOneRandom = (alreadyPicked) => {
    const alreadyIds = alreadyPicked.map(m => m.id);
    const available = members.filter(m => !alreadyIds.includes(m.id));
    if (available.length === 0) return;
    const picked = available[Math.floor(Math.random() * available.length)];
    setRandomPickedList(prev => [...prev, picked]);
  };

  const removeFromRandom = (id) => {
    setRandomPickedList(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Titlul este obligatoriu.'); return; }
    if (assignMode === 'manual' && assignedTo.length === 0) {
      setError('Trebuie sa atribui task-ul unui membru.'); return;
    }
    if (assignMode === 'random' && randomPickedList.length === 0) {
      setError('Apasă "Aleatoriu" pentru a alege cel puțin un membru.'); return;
    }
    const finalAssignedTo = assignMode === 'random' ? randomPickedList.map(m => m.id) : assignedTo;
    setLoading(true);
    try {
      const res = await axios.post(`/phases/${phaseId}/tasks`, { title, description, assignedTo: finalAssignedTo });
      onSave(res.data); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la adaugarea task-ului.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Task nou</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titlu <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none"
              placeholder="ex: Cercetare bibliografică" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none resize-none"
              placeholder="Descrie ce trebuie facut..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atribuie membri <span className="text-red-500">*</span>
              {assignMode === 'manual' && assignedTo.length > 0 &&
                <span className="ml-2 text-xs text-[#8B1538] font-normal">({assignedTo.length} selectati)</span>}
              {assignMode === 'random' && randomPickedList.length > 0 &&
                <span className="ml-2 text-xs text-[#8B1538] font-normal">({randomPickedList.length} aleși)</span>}
            </label>
            <div className="flex gap-2 mb-3">
              <button type="button"
                onClick={() => { setAssignMode('manual'); setRandomPickedList([]); setSearch(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition ${assignMode === 'manual' ? 'bg-[#8B1538] text-white border-[#8B1538]' : 'border-gray-200 text-gray-500'}`}>
                Manual
              </button>
              <button type="button"
                onClick={handleRandomToggleClick}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition ${assignMode === 'random' ? 'bg-[#8B1538] text-white border-[#8B1538]' : 'border-gray-200 text-gray-500'}`}>
                Aleatoriu
              </button>
            </div>
            {assignMode === 'manual' && (
              <>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-[#8B1538]"
                  placeholder="Cauta dupa nume..." />
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredMembers.map((m) => (
                    <button key={m.id} type="button"
                      onClick={() => setAssignedTo(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#FFF8F0] transition text-sm ${assignedTo.includes(m.id) ? 'bg-[#FFF8F0] font-medium text-[#8B1538]' : 'text-gray-700'}`}>
                      <div className="w-6 h-6 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      {m.name} <span className="text-gray-400 text-xs">@{m.username}</span>
                      {assignedTo.includes(m.id) && <span className="ml-auto text-[#8B1538] text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
            {assignMode === 'random' && (
              <div className="space-y-1.5">
                {randomPickedList.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#8B1538]">{m.name}</p>
                      <p className="text-xs text-gray-400">@{m.username}</p>
                    </div>
                    <button type="button" onClick={() => removeFromRandom(m.id)}
                      className="text-gray-400 hover:text-red-500 transition text-xs font-bold px-1">✕</button>
                  </div>
                ))}
                {randomPickedList.length < members.length && (
                  <p className="text-xs text-gray-400 text-center italic pt-1">
                    Apasă din nou pentru a mai adăuga un membru
                  </p>
                )}
                {randomPickedList.length === members.length && (
                  <p className="text-xs text-green-600 text-center italic pt-1">Toți membrii au fost adăugați.</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Anuleaza</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg text-sm font-bold hover:bg-[#6B0F2E] transition disabled:opacity-50">
            {loading ? 'Se adauga...' : 'Adauga task'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditTask({ task, members, onClose, onSave }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.username.toLowerCase().includes(search.toLowerCase()));
  const handleSave = async () => {
    if (!title.trim()) { setError('Titlul este obligatoriu.'); return; }
    setLoading(true);
    try {
      const res = await axios.put(`/tasks/${task.id}`, { title, description, assignedTo: assignedTo.length > 0 ? assignedTo : null });
      onSave(res.data); onClose();
    } catch (err) { setError(err.response?.data?.error || 'Eroare la editarea task-ului.'); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Editeaza task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titlu <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atribuit la{assignedTo.length > 0 && <span className="ml-2 text-xs text-[#8B1538] font-normal">({assignedTo.length} selectati)</span>}</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-[#8B1538]" placeholder="Cauta dupa nume..." />
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredMembers.map((m) => (
                <button key={m.id} type="button" onClick={() => setAssignedTo(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#FFF8F0] transition text-sm ${assignedTo.includes(m.id) ? 'bg-[#FFF8F0] font-medium text-[#8B1538]' : 'text-gray-700'}`}>
                  <div className="w-6 h-6 rounded-full bg-[#8B1538] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{m.name.charAt(0).toUpperCase()}</div>
                  {m.name} <span className="text-gray-400 text-xs">@{m.username}</span>
                  {assignedTo.includes(m.id) && <span className="ml-auto text-[#8B1538] text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Anuleaza</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg text-sm font-bold hover:bg-[#6B0F2E] transition disabled:opacity-50">{loading ? 'Se salveaza...' : 'Salveaza'}</button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, taskNumber, isOwn, isOwner, members, onRefresh, onTaskUpdated, currentUser }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const isDone = task.status === 'DONE';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isTodo = task.status === 'TODO';

  useEffect(() => {
    if (!expanded) return;
    // Încarcă imediat
    axios.get(`/tasks/${task.id}/comments`).then(res => setComments(res.data)).catch(() => {});
    axios.get(`/tasks/${task.id}/attachments`).then(res => setAttachments(res.data)).catch(() => {});
    // Polling la 5s cât timp e expandat
    const interval = setInterval(() => {
      axios.get(`/tasks/${task.id}/comments`).then(res => setComments(res.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [expanded, task.id]);

  const handleStatusChange = async (newStatus) => {
    try { await axios.put(`/tasks/${task.id}`, { status: newStatus }); onRefresh(); } catch (e) { console.error(e); }
  };

  // Adaugă comentariu — dacă e TODO, setează automat IN_PROGRESS
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setLoadingComment(true);
    try {
      if (isTodo) await axios.put(`/tasks/${task.id}`, { status: 'IN_PROGRESS' });
      const res = await axios.post(`/tasks/${task.id}/comments`, { message: comment });
      setComments(prev => [...prev, res.data]);
      setComment('');
      if (isTodo) onRefresh();
    } catch (e) { console.error(e); } finally { setLoadingComment(false); }
  };

  // Upload PDF — dacă e TODO, setează automat IN_PROGRESS
  const handleUploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      if (isTodo) await axios.put(`/tasks/${task.id}`, { status: 'IN_PROGRESS' });
      await axios.post(`/tasks/${task.id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await axios.get(`/tasks/${task.id}/attachments`);
      setAttachments(res.data);
      if (isTodo) onRefresh();
    } catch (err) { console.error(err); }
    e.target.value = '';
  };

  return (
    <>
      {showEdit && isOwner && (
        <ModalEditTask task={task} members={members} onClose={() => setShowEdit(false)}
          onSave={(updated) => { onTaskUpdated(task.id, updated); setShowEdit(false); onRefresh(); }} />
      )}
      <div className={`flex gap-3 relative ${isDone && !expanded ? 'opacity-50' : ''}`}>
        <div className="flex flex-col items-center flex-shrink-0" style={{ marginLeft: '-20px' }}>
          <div className={`w-2.5 h-2.5 rounded-full border-2 mt-3 flex-shrink-0 z-10 ${isDone ? 'bg-green-500 border-green-500' : isInProgress ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'}`} />
        </div>
        <div className={`flex-1 rounded-xl border-2 mb-2 transition-all ${expanded ? 'border-[#8B1538] bg-white shadow-md ring-2 ring-[#8B1538] ring-opacity-20' : isOwn ? 'border-[#8B1538] bg-white shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-[#8B1538] hover:bg-white hover:shadow-sm'}`}>
          <div className="flex items-start justify-between p-3">
            <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
              <p className={`text-sm font-semibold ${isDone ? 'text-gray-400' : isOwn ? 'text-gray-900' : 'text-gray-500'}`}>Task {taskNumber}: {task.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">Atribuit: <span className={isOwn ? 'text-[#8B1538] font-medium' : 'text-gray-500'}>
                {task.assignedToNames?.length > 0
                  ? task.assignedToNames.map((name, i) => (
                      <span key={i}>{i > 0 && ', '}{name}{name === currentUser?.name ? ' (tu)' : ''}</span>
                    ))
                  : 'Neatribuit'}
              </span></p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">



              {/* ── Buton edit (owner) — dacă DONE, schimbă automat în IN_PROGRESS ── */}
              {isOwner && (
                <button onClick={async (e) => { e.stopPropagation(); if (isDone) { await handleStatusChange('IN_PROGRESS'); } setShowEdit(true); }} className="text-gray-400 hover:text-[#8B1538] transition p-1 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              )}

              {/* ── Status + buton acțiune contextual (doar pentru userul propriu) ── */}
              {isOwn ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[task.status] || STATUS_STYLE.TODO}`}>
                    {STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Neînceput'}
                  </span>
                  {isTodo && (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange('IN_PROGRESS'); }}
                      className="text-xs text-blue-600 hover:text-blue-800 transition font-medium leading-tight whitespace-nowrap">
                      Începe task-ul
                    </button>
                  )}
                  {isInProgress && (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange('DONE'); }}
                      className="text-xs text-green-600 hover:text-green-800 transition font-medium leading-tight whitespace-nowrap">
                      Marchează terminat
                    </button>
                  )}
                  {isDone && (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange('IN_PROGRESS'); }}
                      className="text-xs text-gray-400 hover:text-blue-600 transition leading-tight whitespace-nowrap">
                      Schimbă în lucru
                    </button>
                  )}
                </div>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[task.status] || STATUS_STYLE.TODO}`}>
                  {STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Neînceput'}
                </span>
              )}

              {/* Chevron expand */}
              <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="text-gray-400">
                <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          {expanded && (
            <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">


              {task.description && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"><span className="font-medium">Descriere:</span> {renderTextWithLinks(task.description)}</p>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Comentarii:</p>
                {comments.length > 0 ? (
                  <div className="space-y-1 mb-2">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-2.5 py-1.5">
                        <p className="text-xs font-medium text-[#8B1538]">{c.userName}</p>
                        <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">{renderTextWithLinks(c.message)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-2">Nicio observație adăugată.</p>
                )}
                {/* Input comentariu — blocat dacă DONE */}
                {isOwn && !isDone && (
                  <div className="flex gap-2">
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                      placeholder="Adaugă observații, linkuri, materiale PDF..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#8B1538]" />
                    <button type="button" onClick={handleAddComment} disabled={loadingComment}
                      className="px-2.5 py-1.5 bg-[#8B1538] text-white rounded-lg text-xs hover:bg-[#6B0F2E] transition flex-shrink-0 disabled:opacity-50">Trimite</button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-500">Fișiere PDF:</p>
                  {isOwn && !isDone && (
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-[#8B1538] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      Atașează PDF
                      <input type="file" accept=".pdf" className="hidden" onChange={handleUploadPdf} />
                    </label>
                  )}
                </div>
                {attachments.length > 0 ? (
                  <div className="space-y-1">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span className="text-xs text-gray-700 truncate">{att.fileName}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">· {att.uploadedByName}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <button onClick={async () => { try { const token = sessionStorage.getItem('token'); const response = await fetch(`https://teammate-backend-production.up.railway.app/api/attachments/${att.id}/download`, { headers: { 'Authorization': `Bearer ${token}` } }); const blob = await response.blob(); const url = URL.createObjectURL(blob); window.open(url, '_blank'); } catch (e) { console.error(e); } }} className="text-xs text-[#8B1538] hover:underline">Deschide</button>
                          {isOwn && !isDone && (
                            <button onClick={async (e) => { e.stopPropagation(); try { await axios.delete(`/attachments/${att.id}`); setAttachments(prev => prev.filter(item => item.id !== att.id)); } catch (err) { console.error(err); } }} className="text-gray-400 hover:text-red-600 font-bold text-xs px-1">✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Niciun fișier atașat.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SprintCard({ phase, sprintIndex, isActive, isCompleted, isFuture, currentUser, isOwner, members, onRefresh, onTaskUpdated, onGoToFeedback }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const tasks = phase.tasks || [];
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? Math.round(doneTasks * 100 / tasks.length) : 0;

  const userTasks = tasks.filter(t => t.assignedToNames && t.assignedToNames.includes(currentUser?.name));
  const myTasksAllDone = userTasks.length > 0 && userTasks.every(t => t.status === 'DONE');

  return (
    <div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${isCompleted ? 'bg-gray-400 border-gray-400' : isActive ? 'bg-[#8B1538] border-[#8B1538]' : 'bg-gray-200 border-gray-300'}`} />
          <div className={`w-0.5 flex-1 min-h-8 ${isCompleted ? 'bg-gray-300' : isActive ? 'bg-[#8B1538]' : 'bg-gray-200'}`} />
        </div>
        <div className={`flex-1 mb-6 rounded-2xl border-2 ${isCompleted ? 'border-gray-200 bg-gray-50' : isActive ? 'border-[#8B1538] bg-white shadow-md' : 'border-gray-200 bg-gray-100 opacity-60'}`}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {isActive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                  {isCompleted && <span className="w-2 h-2 rounded-full bg-gray-400" />}
                  {isFuture && <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  <h3 className={`font-bold text-base ${isCompleted ? 'text-gray-400' : isActive ? 'text-[#8B1538]' : 'text-gray-400'}`}>Sprint {sprintIndex}: {phase.name}</h3>
                </div>
                {!isFuture && (
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    {phase.startDate && phase.endDate && <span className="text-gray-900 font-medium">{formatDate(phase.startDate)} → {formatDate(phase.endDate)}</span>}
                    {isActive && phase.endDate && (() => {
                      const zile = zilePanaLa(phase.endDate);
                      const color = zile === null ? '' : zile < 0 ? 'text-red-500 font-semibold' : zile <= 3 ? 'text-red-500 font-semibold' : zile <= 7 ? 'text-orange-500 font-semibold' : zile <= 14 ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold';
                      const label = zile === null ? '' : zile < 0 ? `Expirat acum ${Math.abs(zile)} zile` : zile === 0 ? 'Se termină azi!' : `${zile} zile rămase`;
                      return <span className={color}>{label}</span>;
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* ── Buton info (i) — colț dreapta sus al cardului sprint ── */}
                {isActive && (
                  <div className="relative">
                    <button
                      onClick={() => setShowInfo(prev => !prev)}
                      className="w-7 h-7 rounded-full bg-gray-800 text-white hover:bg-[#8B1538] transition flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm"
                      title="Cum funcționează task-urile?">
                      i
                    </button>
                    {showInfo && (
                      <div className="absolute right-0 top-9 z-30 w-72 bg-white border-2 border-[#E8C5D0] rounded-xl shadow-xl p-4 space-y-3"
                        onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-bold text-[#8B1538]">Cum funcționează statusul task-urilor?</p>
                        <div className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-gray-600">După ce ți-ai terminat task-ul, apasă <strong className="text-green-600">Marchează terminat</strong>.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <p className="text-xs text-gray-600">Dacă vrei să modifici un task terminat, apasă <strong className="text-blue-600">Schimbă în lucru</strong> mai întâi.</p>
                        </div>
                        <button onClick={() => setShowInfo(false)} className="text-xs text-gray-400 hover:text-gray-600 transition w-full text-right">Închide ✕</button>
                      </div>
                    )}
                  </div>
                )}
                {isActive && isOwner && (
                  <button onClick={() => setShowAddTask(true)} className="flex items-center gap-1.5 bg-[#8B1538] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#6B0F2E] transition flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Adauga Task
                  </button>
                )}
              </div>
            </div>
            {!isFuture && tasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progres</span><span className={`text-xs font-bold ${getProgressTextColor(progress)}`}>{progress}%</span></div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} /></div>
              </div>
            )}
            {isFuture && <p className="text-xs text-gray-400 italic mt-1">Taskurile vor fi adaugate cand ajungem la acest sprint.</p>}
          </div>
          {!isFuture && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 pl-8">
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{isOwner && isActive ? 'Niciun task adaugat. Apasa "Adauga Task".' : 'Niciun task in acest sprint.'}</p>
              ) : (
                <div className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isCompleted ? 'bg-gray-200' : 'bg-[#E8C5D0]'}`} style={{ marginLeft: '-12px' }} />
                  {tasks.map((task, idx) => (
                    <TaskCard key={task.id} task={task} taskNumber={idx + 1} isOwn={task.assignedTo?.includes(currentUser?.id)} isOwner={isOwner} members={members} onRefresh={onRefresh} onTaskUpdated={onTaskUpdated} currentUser={currentUser} />
                  ))}


                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ── Banner felicitări + buton confirmare — în afara cardului, sub el ── */}
      {isActive && myTasksAllDone && (
        <div className="flex flex-col gap-2 mb-6 -mt-3 ml-8">
          <div className="flex items-center justify-between gap-3 bg-[#FFF8F0] border border-[#E8C5D0] rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-[#8B1538]">
              Felicitări! Ți-ai terminat toate task-urile.
            </p>
            <button onClick={onGoToFeedback}
              className="text-xs font-bold text-white bg-[#8B1538] hover:bg-[#6A102A] px-3 py-1.5 rounded-lg transition whitespace-nowrap">
              Lasă un feedback
            </button>
          </div>
          {isOwner && progress === 100 && (
            <div className="flex justify-end">
              <button onClick={async () => { try { await axios.post(`/phases/${phase.id}/confirm`); onRefresh(); } catch (e) { console.error(e); } }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition">
                Confirmă și treci la următorul sprint →
              </button>
            </div>
          )}
        </div>
      )}
      {showAddTask && <ModalAddTask phaseId={phase.id} members={members} onClose={() => setShowAddTask(false)} onSave={() => { setShowAddTask(false); onRefresh(); }} />}
    </div>
  );
}

function ModalFelicitari({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#8B1538] mb-3">Felicitari!</h2>
        <p className="text-gray-600 mb-6">Ati finalizat cu succes toate sprint-urile proiectului. Succes mai departe!</p>
        <button onClick={onClose} className="w-full py-3 bg-[#8B1538] text-white rounded-xl font-bold hover:bg-[#6B0F2E] transition">Multumesc!</button>
      </div>
    </div>
  );
}

function RaportTaskRow({ task, taskNumber }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (!expanded) return;
    // Încarcă imediat
    axios.get(`/tasks/${task.id}/comments`).then(res => setComments(res.data)).catch(() => {});
    axios.get(`/tasks/${task.id}/attachments`).then(res => setAttachments(res.data)).catch(() => {});
    // Polling la 5s cât timp e expandat
    const interval = setInterval(() => {
      axios.get(`/tasks/${task.id}/comments`).then(res => setComments(res.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [expanded, task.id]);

  return (
    <div className="border border-gray-100 rounded-lg mb-1">
      <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'DONE' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'}`} />
        <p className="text-xs flex-1 text-gray-900 font-bold">
          Task {taskNumber}: {task.title}
          {task.assignedToNames?.length > 0 && <span className="text-gray-500 font-normal ml-1">· {task.assignedToNames.join(', ')}</span>}
        </p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLE[task.status] || STATUS_STYLE.TODO}`}>{STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Neinceput'}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">
          {task.description && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-2"><span className="font-medium">Descriere:</span> {renderTextWithLinks(task.description)}</p>}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Comentarii:</p>
            {comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-2.5 py-1.5">
                    <p className="text-xs font-medium text-[#8B1538]">{c.userName}</p>
                    <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">{renderTextWithLinks(c.message)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400 italic">Niciun comentariu.</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Fișiere PDF:</p>
            {attachments.length > 0 ? (
              <div className="space-y-1">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      <span className="text-xs text-gray-700 truncate">{att.fileName}</span>
                    </div>
                    <button onClick={async () => { try { const token = sessionStorage.getItem('token'); const response = await fetch(`http://localhost:8080/api/attachments/${att.id}/download`, { headers: { 'Authorization': `Bearer ${token}` } }); const blob = await response.blob(); const url = URL.createObjectURL(blob); window.open(url, '_blank'); } catch (e) { console.error(e); } }} className="text-xs text-[#8B1538] hover:underline font-semibold ml-2">Deschide</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400 italic">Niciun fișier atașat.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function TabFeedback({ phases, currentPhaseId, currentUser, projectNotStarted, activePhaseAllDone }) {
  const [feedbacksByPhase, setFeedbacksByPhase] = useState({});
  const [buneText, setBuneText] = useState('');
  const [improText, setImproText] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingPhaseId, setEditingPhaseId] = useState(null);

  useEffect(() => {
    phases.forEach(phase => {
      axios.get(`/phases/${phase.id}/feedbacks`)
        .then(res => setFeedbacksByPhase(prev => ({ ...prev, [phase.id]: res.data })))
        .catch(() => {});
    });
  }, [phases]);

  const activePhaseIndex = phases.findIndex(p => p.id === currentPhaseId);

  const handleSubmit = async (phaseId) => {
    if (!buneText.trim() || !improText.trim()) return;
    setLoadingSubmit(true);
    try {
      if (editingFeedbackId) {
        await axios.put(`/feedbacks/${editingFeedbackId}`, { ceAMersBine: buneText, deImbunatatit: improText });
      } else {
        await axios.post(`/phases/${phaseId}/feedbacks`, { ceAMersBine: buneText, deImbunatatit: improText });
      }
      const res = await axios.get(`/phases/${phaseId}/feedbacks`);
      setFeedbacksByPhase(prev => ({ ...prev, [phaseId]: res.data }));
      setBuneText(''); setImproText('');
      setEditingFeedbackId(null);
      setEditingPhaseId(null);
    } catch (e) { console.error(e); } finally { setLoadingSubmit(false); }
  };

  const handleStartEdit = (phaseId, myFeedback) => {
    setBuneText(myFeedback.ceAMersBine || '');
    setImproText(myFeedback.deImbunatatit || '');
    setEditingFeedbackId(myFeedback.id);
    setEditingPhaseId(phaseId);
  };

  return (
    <div className="w-full space-y-6">
      {phases.map((phase, idx) => {
        const isCurrent = phase.id === currentPhaseId;
        const isPast = idx < activePhaseIndex;
        const isFuture = idx > activePhaseIndex;
        const feedbacks = feedbacksByPhase[phase.id] || [];

        const badgeLabel = isCurrent ? 'Sprint Actual' : isPast ? 'Finalizat' : 'Urmeaza';
        const badgeColor = isCurrent ? 'bg-[#8B1538] text-white' : isPast ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';

        const isLocked = projectNotStarted || isFuture;
        const canWriteFeedback = isCurrent && !isLocked && activePhaseAllDone;

        const myFeedback = feedbacks.find(f => f.userName === currentUser?.name);
        const alreadySubmitted = !!myFeedback;
        const isEditing = editingPhaseId === phase.id;

        return (
          <div key={phase.id} className={`w-full bg-white rounded-2xl border-2 p-5 transition-all shadow-sm ${isCurrent ? 'border-[#8B1538]' : 'border-gray-200'} ${isLocked || isPast ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold text-base ${isCurrent ? 'text-[#8B1538]' : 'text-gray-400'}`}>
                Sprint {idx + 1}: {phase.name}
              </h4>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badgeLabel}</span>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-xs text-gray-400 italic mb-4">Nu s-a lasat nicicun feedback pentru acest sprint pana acum.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {feedbacks.map((f, fIdx) => {
                  const isMyFeedback = f.userName === currentUser?.name;
                  return (
                    <div key={fIdx} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#8B1538] rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">{(f.userName || 'M')[0]}</div>
                        <span className="text-xs font-bold text-gray-800">{f.userName}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {f.createdAt && new Date(f.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {canWriteFeedback && isMyFeedback && !isEditing && (
                          <button onClick={() => handleStartEdit(phase.id, f)}
                            title="Modifica feedback-ul meu"
                            className="text-gray-400 hover:text-[#8B1538] transition p-0.5 ml-1 flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="bg-green-50 p-2.5 rounded-lg border border-green-100">
                          <span className="font-bold text-green-700 block mb-1">Ce a mers bine</span>
                          <p className="text-gray-700">{f.ceAMersBine}</p>
                        </div>
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                          <span className="font-bold text-amber-700 block mb-1">Ce trebuie imbunatatit</span>
                          <p className="text-gray-700">{f.deImbunatatit}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {canWriteFeedback && (!alreadySubmitted || isEditing) && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {isEditing ? 'Modifica retrospectiva ta' : 'Adauga retrospectiva sprintului curent'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">1. Ce a mers bine in acest sprint?</label>
                    <textarea value={buneText} onChange={(e) => setBuneText(e.target.value)} placeholder="Scrie punctele tari..."
                      className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#8B1538] resize-none h-20" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">2. Ce trebuie imbunatatit?</label>
                    <textarea value={improText} onChange={(e) => setImproText(e.target.value)} placeholder="Scrie punctele slabe..."
                      className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#8B1538] resize-none h-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {isEditing && (
                    <button onClick={() => { setEditingPhaseId(null); setEditingFeedbackId(null); setBuneText(''); setImproText(''); }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition">
                      Anuleaza
                    </button>
                  )}
                  <button onClick={() => handleSubmit(phase.id)} disabled={!buneText.trim() || !improText.trim() || loadingSubmit}
                    className="ml-auto px-4 py-2 bg-[#8B1538] text-white text-xs font-bold rounded-xl hover:bg-[#6A102A] disabled:opacity-40 transition-all shadow-sm">
                    {loadingSubmit ? 'Se trimite...' : isEditing ? 'Salveaza modificarea' : 'Trimite feedback'}
                  </button>
                </div>
              </div>
            )}

            {isCurrent && !isLocked && !activePhaseAllDone && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-500">Feedback-ul se deblocheaza dupa ce iti finalizezi toate taskurile din acest sprint.</p>
              </div>
            )}
            {isFuture && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-400">Acest sprint nu a inceput inca.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('sprint');
  const [showFelicitari, setShowFelicitari] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState('');

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
    fetchAll();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'raport') setActiveTab('raport');
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [projRes, phasesRes, membersRes] = await Promise.all([
        axios.get(`/projects/${id}`),
        axios.get(`/projects/${id}/phases`).catch(() => ({ data: [] })),
        axios.get(`/projects/${id}/members`).catch(() => ({ data: [] })),
      ]);
      setProject(projRes.data);
      const membersList = membersRes.data.filter(m => m.status === 'ACCEPTED').map(m => ({ id: m.userId, name: m.userName, username: m.userUsername }));
      const creatorAlreadyIn = membersList.some(m => m.id === projRes.data.creatorId);
      if (!creatorAlreadyIn) membersList.unshift({ id: projRes.data.creatorId, name: projRes.data.creatorName, username: projRes.data.creatorUsername });
      setMembers(membersList);
      setPhases(phasesRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleTaskUpdated = (taskId, updatedTask) => {
    setPhases(prev => prev.map(p => ({ ...p, tasks: (p.tasks || []).map(t => t.id === taskId ? updatedTask : t) })));
  };

  const handleArchive = async () => {
    try {
      await axios.put(`/projects/${id}/archive`);
      await fetchAll();
      setArchiveSuccess(`Proiectul a fost arhivat.`);
      setTimeout(() => setArchiveSuccess(''), 3000);
    } catch (e) { console.error(e); }
  };

  const handleUnarchive = async () => {
    try {
      await axios.put(`/projects/${id}/unarchive`);
      await fetchAll();
      setArchiveSuccess(`Proiectul a fost dezarhivat.`);
      setTimeout(() => setArchiveSuccess(''), 3000);
    } catch (e) { console.error(e); }
  };

  const isOwner = project && currentUser && project.creatorId === currentUser.id;
  const zileDeadline = project ? zilePanaLa(project.deadline) : null;
  const activePhaseIndex = phases.findIndex(p => !p.confirmedByScrum);
  const activePhase = activePhaseIndex >= 0 ? phases[activePhaseIndex] : null;
  const allConfirmed = phases.length > 0 && phases.every(p => p.confirmedByScrum);
  const totalTasks = phases.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const doneTasks = phases.reduce((acc, p) => acc + (p.tasks?.filter(t => t.status === 'DONE').length || 0), 0);
  const totalPhases = phases.length;
  const confirmedPhases = phases.filter(p => p.confirmedByScrum).length;
  const generalProgress = totalPhases > 0 ? Math.round(phases.reduce((acc, phase) => {
    const phaseTasks = phase.tasks || [];
    const phaseDone = phaseTasks.filter(t => t.status === 'DONE').length;
    return acc + (phaseTasks.length > 0 ? (phaseDone / phaseTasks.length) * (100 / totalPhases) : 0);
  }, 0)) : 0;
  const projectNotStarted = project && project.startDate && zilePanaLa(project.startDate) > 0;

  const activePhaseAllDone = (() => {
    if (!activePhase) return false;
    const tasks = activePhase.tasks || [];
    if (tasks.length === 0) return false;
    const userTasks = tasks.filter(t => t.assignedToNames && t.assignedToNames.includes(currentUser?.name));
    if (userTasks.length > 0) return userTasks.every(t => t.status === 'DONE');
    return tasks.every(t => t.status === 'DONE');
  })();

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center"><p className="text-white text-lg">Se incarca proiectul...</p></div>;
  if (!project) return <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center"><p className="text-white">Proiectul nu a fost gasit.</p></div>;

  const TABS = [
    { key: 'sprint', label: 'Sprintul curent', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { key: 'raport', label: 'Raport Proiect', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { key: 'audit', label: 'Monitorizare', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { key: 'feedback', label: 'Feedback', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A]">
      {showFelicitari && <ModalFelicitari onClose={() => setShowFelicitari(false)} />}

      {archiveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-white border-2 border-[#E8C5D0] rounded-xl px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-[#8B1538]">{archiveSuccess}</p>
        </div>
      )}

      <nav className="bg-[#FFF8F0] shadow-lg border-b-2 border-[#E8C5D0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-[#F5E6E8] text-[#8B1538] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-[#8B1538]">{project.name}</h1>
                <p className="text-xs text-gray-400">{project.creatorName} · Deadline: {formatDate(project.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {zileDeadline !== null && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${zileDeadline < 0 ? 'bg-red-100 text-red-600' : zileDeadline <= 7 ? 'bg-orange-100 text-orange-600' : zileDeadline <= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {zileDeadline < 0 ? 'Expirat' : zileDeadline === 0 ? 'Azi!' : `${zileDeadline} zile`}
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'NOT_STARTED' ? 'bg-gray-100 text-gray-600' : allConfirmed || project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : project.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                {project.status === 'NOT_STARTED' ? 'Neînceput' : allConfirmed || project.status === 'COMPLETED' ? 'Finalizat' : project.status === 'ARCHIVED' ? 'Arhivat' : 'Activ'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-[#FFF8F0] border-b-2 border-[#E8C5D0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key ? 'border-[#8B1538] text-[#8B1538]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {activeTab === 'sprint' && (
          <div>
            {projectNotStarted ? (
              <div className="bg-white rounded-2xl border-2 border-[#E8C5D0] p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="text-2xl font-bold text-[#8B1538] mb-2">Proiectul nu a început încă</h2>
                <p className="text-gray-500 text-sm mb-1">Data de start: <strong>{formatDate(project.startDate)}</strong></p>
                <p className={`text-2xl font-bold mt-4 ${zilePanaLa(project.startDate) <= 3 ? 'text-red-500' : zilePanaLa(project.startDate) <= 7 ? 'text-orange-500' : 'text-[#8B1538]'}`}>
                  Mai {zilePanaLa(project.startDate) === 1 ? 'este' : 'sunt'} {zilePanaLa(project.startDate)} {zilePanaLa(project.startDate) === 1 ? 'zi' : 'zile'}
                </p>
                <p className="text-gray-400 text-xs mt-2">Sprinturile se vor activa automat la data de start.</p>
              </div>
            ) : (
              <>
                {phases.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl"><p className="text-gray-500">Nicio etapa selectata la crearea proiectului.</p></div>
                ) : allConfirmed ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-green-200">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    </div>
                    <p className="text-xl font-bold text-green-700 mb-2">Proiect finalizat!</p>
                    <p className="text-gray-500">Toate sprint-urile au fost completate cu succes.</p>
                  </div>
                ) : !activePhase ? (
                  <div className="text-center py-16 bg-white rounded-2xl"><p className="text-gray-500">Se incarca sprint-ul activ...</p></div>
                ) : (
                  <SprintCard
                    phase={activePhase}
                    sprintIndex={activePhaseIndex + 1}
                    isActive={true}
                    isCompleted={false}
                    isFuture={false}
                    currentUser={currentUser}
                    isOwner={isOwner}
                    members={members}
                    onRefresh={fetchAll}
                    onTaskUpdated={handleTaskUpdated}
                    onGoToFeedback={() => setActiveTab('feedback')}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'raport' && (
          <div className="space-y-5">
            <div className={`bg-white rounded-2xl border-2 border-[#E8C5D0] p-5 ${projectNotStarted ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-[#8B1538] mb-3">Progres general proiect</h3>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#8B1538] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="text-xs text-gray-500">{confirmedPhases} din {totalPhases} sprinturi finalizate</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8B1538] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  <span className="text-xs text-gray-500">{doneTasks} din {totalTasks} taskuri finalizate</span>
                </div>
                <span className={`text-sm font-bold ${getProgressTextColor(generalProgress)}`}>{generalProgress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(generalProgress)}`} style={{ width: `${generalProgress}%` }} /></div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#E8C5D0] p-5">
              <h3 className="font-bold text-[#8B1538] mb-4">Timeline sprint-uri</h3>
              {projectNotStarted && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-center">
                  <p className="text-xs text-gray-500">Planificarea proiectului — sprinturile devin active pe <strong>{formatDate(project.startDate)}</strong></p>
                </div>
              )}
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#E8C5D0]" />
                {phases.map((phase, idx) => {
                  const tasks = phase.tasks || [];
                  const done = tasks.filter(t => t.status === 'DONE').length;
                  const prog = tasks.length > 0 ? Math.round(done * 100 / tasks.length) : 0;
                  const isConf = phase.confirmedByScrum;
                  const isAct = !projectNotStarted && idx === activePhaseIndex;
                  const isFut = !isConf && !isAct;
                  return (
                    <div key={phase.id} className="relative mb-5 last:mb-0">
                      <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full border-2 z-10 ${projectNotStarted ? 'bg-white border-gray-300' : isConf || isAct ? 'bg-[#8B1538] border-[#8B1538]' : 'bg-white border-gray-300'}`} />
                      <div className={`ml-2 rounded-xl border-2 p-3 ${projectNotStarted ? 'border-gray-200 bg-gray-50 opacity-60' : isConf || isAct ? 'border-[#8B1538] bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className={`font-bold text-sm ${projectNotStarted ? 'text-gray-400' : isConf || isAct ? 'text-[#8B1538]' : 'text-gray-400'}`}>
                              Sprint {idx + 1}: {phase.name}
                              {isConf && <span className="ml-2 text-xs font-normal text-green-600">✓ Finalizat</span>}
                            </p>
                            {phase.startDate && phase.endDate && <p className="text-xs mt-0.5 text-gray-900 font-medium">{formatDate(phase.startDate)} → {formatDate(phase.endDate)}</p>}
                          </div>
                          {!isFut && !projectNotStarted && tasks.length > 0 && <span className={`text-xs font-bold ${getProgressTextColor(prog)}`}>{prog}%</span>}
                        </div>
                        {!isFut && !projectNotStarted && tasks.length > 0 && (
                          <div className="pl-3 border-l-2 border-[#E8C5D0] space-y-1 mt-2">
                            {tasks.map((t, tidx) => <RaportTaskRow key={t.id} task={t} taskNumber={tidx + 1} />)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#E8C5D0] p-5">
              <h3 className="font-bold text-[#8B1538] mb-3">Detalii proiect</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Deadline:</span><span className="font-medium">{formatDate(project.deadline)}</span></div>
                {project.startDate && <div className="flex justify-between"><span className="text-gray-500">Data start:</span><span className="font-medium">{formatDate(project.startDate)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Scrum Master:</span><span className="font-medium text-[#8B1538]">{project.creatorName}</span></div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Membri echipa:</span>
                  <div className="text-right">
                    <span className="font-medium">{members.length} persoane</span>
                    <div className="flex flex-wrap gap-1 justify-end mt-1">
                      {members.map((m, i) => <span key={i} className="text-xs bg-[#FFF8F0] border border-[#E8C5D0] text-[#8B1538] px-2 py-0.5 rounded-full">{m.name}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Sprint-uri:</span><span className="font-medium">{phases.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Taskuri totale:</span><span className="font-medium">{totalTasks}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && <DashboardAuditMembri phases={phases} activePhaseId={activePhase?.id} />}

        {activeTab === 'feedback' && (
          <TabFeedback
            phases={phases}
            currentPhaseId={activePhase?.id}
            currentUser={currentUser}
            projectNotStarted={projectNotStarted}
            activePhaseAllDone={activePhaseAllDone}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectDetailPage;