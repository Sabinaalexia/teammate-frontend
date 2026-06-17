import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

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

function ModalAddTask({ phaseId, members, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [search, setSearch] = useState('');
  const [assignMode, setAssignMode] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );
  const handleSave = async () => {
    if (!title.trim()) { setError('Titlul este obligatoriu.'); return; }
    if (assignMode === 'manual' && assignedTo.length === 0) { setError('Trebuie sa atribui task-ul unui membru.'); return; }
    const finalAssignedTo = assignMode === 'random'
      ? [members[Math.floor(Math.random() * members.length)]?.id]
      : assignedTo;
    setLoading(true);
    try {
      const res = await axios.post(`/phases/${phaseId}/tasks`, {
        title, description, assignedTo: finalAssignedTo
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la adaugarea task-ului.');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Task nou</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titlu <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none"
              placeholder="ex: Cautare pe Google Scholar" />
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
              {assignedTo.length > 0 && <span className="ml-2 text-xs text-[#8B1538] font-normal">({assignedTo.length} selectati)</span>}
            </label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => { setAssignMode('manual'); setAssignedTo([]); setSearch(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition ${assignMode === 'manual' ? 'bg-[#8B1538] text-white border-[#8B1538]' : 'border-gray-200 text-gray-500'}`}>
                Atribuie manual
              </button>
              <button type="button" onClick={() => { setAssignMode('random'); setAssignedTo([]); }}
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
              <div className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-3 py-2.5 text-sm text-[#8B1538] font-medium">
                Task-ul va fi atribuit aleatoriu unui membru la salvare.
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
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );
  const handleSave = async () => {
    if (!title.trim()) { setError('Titlul este obligatoriu.'); return; }
    setLoading(true);
    try {
      const res = await axios.put(`/tasks/${task.id}`, {
        title, description,
        assignedTo: assignedTo.length > 0 ? assignedTo : null,
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la editarea task-ului.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#8B1538]">Editeaza task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titlu <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="w-full px-3 py-2 border-2 border-[#8B1538] rounded-lg text-sm focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atribuit la
              {assignedTo.length > 0 && <span className="ml-2 text-xs text-[#8B1538] font-normal">({assignedTo.length} selectati)</span>}
            </label>
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
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Anuleaza</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg text-sm font-bold hover:bg-[#6B0F2E] transition disabled:opacity-50">
            {loading ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, taskNumber, isOwn, isOwner, members, onRefresh, onTaskUpdated }) {
  const [showStatus, setShowStatus] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    if (expanded) {
      axios.get(`/tasks/${task.id}/comments`)
        .then(res => setComments(res.data))
        .catch(() => {});
      axios.get(`/tasks/${task.id}/attachments`)
        .then(res => setAttachments(res.data))
        .catch(() => {});
    }
  }, [expanded, task.id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/tasks/${task.id}`, { status: newStatus });
      setShowStatus(false);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setLoadingComment(true);
    try {
      const res = await axios.post(`/tasks/${task.id}/comments`, { message: comment });
      setComments(prev => [...prev, res.data]);
      setComment('');
    } catch (e) { console.error(e); }
    finally { setLoadingComment(false); }
  };

  const handleUploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/tasks/${task.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await axios.get(`/tasks/${task.id}/attachments`);
      setAttachments(res.data);
    } catch (err) { console.error(err); }
    e.target.value = '';
  };

  const assignedNames = task.assignedToNames?.length > 0 ? task.assignedToNames.join(', ') : 'Neatribuit';

  return (
    <>
      {showEdit && isOwner && (
        <ModalEditTask task={task} members={members}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => { onTaskUpdated(task.id, updated); setShowEdit(false); onRefresh(); }} />
      )}
      <div className={`flex gap-3 relative ${task.status === 'DONE' ? 'opacity-50' : ''}`}>
        <div className="flex flex-col items-center flex-shrink-0" style={{ marginLeft: '-20px' }}>
          <div className={`w-2.5 h-2.5 rounded-full border-2 mt-3 flex-shrink-0 z-10 ${
            task.status === 'DONE' ? 'bg-green-500 border-green-500' :
            task.status === 'IN_PROGRESS' ? 'bg-blue-500 border-blue-500' :
            'bg-white border-gray-400'
          }`} />
        </div>
        <div className={`flex-1 rounded-xl border-2 mb-2 transition-all ${isOwn ? 'border-[#8B1538] bg-white shadow-sm' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-start justify-between p-3">
            <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
              <p className={`text-sm font-semibold ${task.status === 'DONE' ? 'text-gray-400' : isOwn ? 'text-gray-900' : 'text-gray-500'}`}>
                Task {taskNumber}: {task.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Atribuit: <span className={isOwn ? 'text-[#8B1538] font-medium' : 'text-gray-500'}>
                  {assignedNames}{isOwn && ' (tu)'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {isOwner && (
                <button onClick={() => setShowEdit(true)} className="text-gray-400 hover:text-[#8B1538] transition p-1 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); if (isOwn) setShowStatus(!showStatus); }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[task.status] || STATUS_STYLE.TODO} ${isOwn ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                  {STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Neinceput'}
                </button>
                {showStatus && isOwn && (
                  <div className="absolute right-0 bottom-8 bg-white border-2 border-[#E8C5D0] rounded-xl shadow-xl z-20 overflow-hidden w-36">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s.value}
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(s.value); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#FFF8F0] transition ${task.status === s.value ? 'font-bold text-[#8B1538]' : 'text-gray-700'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
                <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          {expanded && (
            <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">
              {task.description && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium">Descriere:</span> {task.description}
                </p>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Comentarii:</p>
                {comments.length > 0 ? (
                  <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-2.5 py-1.5">
                        <p className="text-xs font-medium text-[#8B1538]">{c.userName}</p>
                        <p className="text-xs text-gray-700">{c.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(c.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-2">Nicio observatie adaugata.</p>
                )}
                {isOwn && (
                  <div className="flex gap-2">
                    <input type="text" value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                      placeholder="Adauga observatii, linkuri, materiale PDF..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#8B1538]" />
                    <button type="button" onClick={handleAddComment} disabled={loadingComment}
                      className="px-2.5 py-1.5 bg-[#8B1538] text-white rounded-lg text-xs hover:bg-[#6B0F2E] transition flex-shrink-0 disabled:opacity-50">
                      Trimite
                    </button>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-500">Fișiere PDF:</p>
                  {isOwn && (
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-[#8B1538] hover:underline">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
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
                          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-700 truncate">{att.fileName}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">· {att.uploadedByName}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <button
                            onClick={async () => {
                              try {
                                const token = sessionStorage.getItem('token');
                                const response = await fetch(`http://localhost:8080/api/attachments/${att.id}/download`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                              } catch (e) { console.error(e); }
                            }}
                            className="text-xs text-[#8B1538] hover:underline">
                            Deschide
                          </button>
                          {isOwn && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.delete(`/attachments/${att.id}`);
                                  setAttachments(prev => prev.filter(item => item.id !== att.id));
                                } catch (err) { console.error(err); }
                              }}
                              className="text-gray-400 hover:text-red-600 font-bold text-xs px-1">
                              ✕
                            </button>
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

function SprintCard({ phase, sprintIndex, isActive, isCompleted, isFuture, currentUser, isOwner, members, onRefresh, onTaskUpdated }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const tasks = phase.tasks || [];
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? Math.round(doneTasks * 100 / tasks.length) : 0;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${
          isCompleted ? 'bg-gray-400 border-gray-400' :
          isActive ? 'bg-[#8B1538] border-[#8B1538]' :
          'bg-gray-200 border-gray-300'
        }`} />
        <div className={`w-0.5 flex-1 min-h-8 ${isCompleted ? 'bg-gray-300' : isActive ? 'bg-[#8B1538]' : 'bg-gray-200'}`} />
      </div>
      <div className={`flex-1 mb-6 rounded-2xl border-2 ${
        isCompleted ? 'border-gray-200 bg-gray-50' :
        isActive ? 'border-[#8B1538] bg-white shadow-md' :
        'border-gray-200 bg-gray-100 opacity-60'
      }`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {isActive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                {isCompleted && <span className="w-2 h-2 rounded-full bg-gray-400" />}
                {isFuture && <span className="w-2 h-2 rounded-full bg-gray-300" />}
                <h3 className={`font-bold text-base ${isCompleted ? 'text-gray-400' : isActive ? 'text-[#8B1538]' : 'text-gray-400'}`}>
                  Sprint {sprintIndex}: {phase.name}
                </h3>
              </div>
              {!isFuture && (
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  {phase.startDate && phase.endDate && (
                    <span className="text-gray-900 font-medium">
                      {formatDate(phase.startDate)} → {formatDate(phase.endDate)}
                    </span>
                  )}
                  {isActive && phase.endDate && (() => {
                    const zile = zilePanaLa(phase.endDate);
                    const color = zile === null ? '' : zile < 0 ? 'text-red-500 font-semibold' : zile <= 3 ? 'text-red-500 font-semibold' : zile <= 7 ? 'text-orange-500 font-semibold' : zile <= 14 ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold';
                    const label = zile === null ? '' : zile < 0 ? `Expirat acum ${Math.abs(zile)} zile` : zile === 0 ? 'Scade azi!' : `${zile} zile ramase`;
                    return <span className={color}>{label}</span>;
                  })()}
                </div>
              )}
            </div>
            {isActive && isOwner && (
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 bg-[#8B1538] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#6B0F2E] transition flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adauga Task
              </button>
            )}
          </div>
          {!isFuture && tasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progres</span>
                <span className={`text-xs font-bold ${getProgressTextColor(progress)}`}>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {isFuture && <p className="text-xs text-gray-400 italic mt-1">Taskurile vor fi adaugate cand ajungem la acest sprint.</p>}
        </div>
        {!isFuture && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 pl-8">
            {tasks.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                {isOwner && isActive ? 'Niciun task adaugat. Apasa "Adauga Task".' : 'Niciun task in acest sprint.'}
              </p>
            ) : (
              <div className="relative">
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isCompleted ? 'bg-gray-200' : 'bg-[#E8C5D0]'}`} style={{ marginLeft: '-12px' }} />
                {tasks.map((task, idx) => (
                  <TaskCard key={task.id} task={task} taskNumber={idx + 1}
                    isOwn={task.assignedTo?.includes(currentUser?.id)}
                    isOwner={isOwner} members={members}
                    onRefresh={onRefresh}
                    onTaskUpdated={onTaskUpdated} />
                ))}
                {isActive && isOwner && progress === 100 && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={async () => {
                        try {
                          await axios.post(`/phases/${phase.id}/confirm`);
                          onRefresh();
                        } catch (e) { console.error(e); }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition">
                      Confirmă și treci la următorul sprint →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {showAddTask && (
        <ModalAddTask phaseId={phase.id} members={members}
          onClose={() => setShowAddTask(false)}
          onSave={() => { setShowAddTask(false); onRefresh(); }} />
      )}
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
        <button onClick={onClose} className="w-full py-3 bg-[#8B1538] text-white rounded-xl font-bold hover:bg-[#6B0F2E] transition">
          Multumesc!
        </button>
      </div>
    </div>
  );
}

function RaportTaskRow({ task, taskNumber }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (expanded) {
      axios.get(`/tasks/${task.id}/comments`)
        .then(res => setComments(res.data))
        .catch(() => {});
    }
  }, [expanded, task.id]);

  return (
    <div className="border border-gray-100 rounded-lg mb-1">
      <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          task.status === 'DONE' ? 'bg-green-500' :
          task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
        }`} />
        <p className={`text-xs flex-1 ${task.status === 'DONE' ? 'text-gray-400' : 'text-gray-600'}`}>
          Task {taskNumber}: {task.title}
          {task.assignedToNames?.length > 0 && (
            <span className="text-gray-400 ml-1">· {task.assignedToNames.join(', ')}</span>
          )}
        </p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLE[task.status] || STATUS_STYLE.TODO}`}>
          {STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Neinceput'}
        </span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">
          {task.description ? (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium">Descriere:</span> {task.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Fara descriere.</p>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Comentarii:</p>
            {comments.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[#FFF8F0] border border-[#E8C5D0] rounded-lg px-2.5 py-1.5">
                    <p className="text-xs font-medium text-[#8B1538]">{c.userName}</p>
                    <p className="text-xs text-gray-700">{c.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(c.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Niciun comentariu.</p>
            )}
          </div>
        </div>
      )}
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
      const membersList = membersRes.data
        .filter(m => m.status === 'ACCEPTED')
        .map(m => ({ id: m.userId, name: m.userName, username: m.userUsername }));
      const creatorAlreadyIn = membersList.some(m => m.id === projRes.data.creatorId);
      if (!creatorAlreadyIn) {
        membersList.unshift({
          id: projRes.data.creatorId,
          name: projRes.data.creatorName,
          username: projRes.data.creatorUsername,
        });
      }
      setMembers(membersList);
      setPhases(phasesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = (taskId, updatedTask) => {
    setPhases(prev => prev.map(p => ({
      ...p,
      tasks: (p.tasks || []).map(t => t.id === taskId ? updatedTask : t)
    })));
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
  const generalProgress = totalPhases > 0
    ? Math.round(phases.reduce((acc, phase) => {
        const phaseTasks = phase.tasks || [];
        const phaseDone = phaseTasks.filter(t => t.status === 'DONE').length;
        const phaseContrib = phaseTasks.length > 0
          ? (phaseDone / phaseTasks.length) * (100 / totalPhases)
          : 0;
        return acc + phaseContrib;
      }, 0))
    : 0;

  // Proiect neînceput = startDate în viitor
  const projectNotStarted = project && project.startDate && zilePanaLa(project.startDate) > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center">
        <p className="text-white text-lg">Se incarca proiectul...</p>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A] flex items-center justify-center">
        <p className="text-white">Proiectul nu a fost gasit.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A]">
      {showFelicitari && <ModalFelicitari onClose={() => setShowFelicitari(false)} />}
      <nav className="bg-[#FFF8F0] shadow-lg border-b-2 border-[#E8C5D0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-[#F5E6E8] text-[#8B1538] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-[#8B1538]">{project.name}</h1>
                <p className="text-xs text-gray-400">{project.creatorName} · Deadline: {formatDate(project.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {zileDeadline !== null && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  zileDeadline < 0 ? 'bg-red-100 text-red-600' :
                  zileDeadline <= 7 ? 'bg-orange-100 text-orange-600' :
                  zileDeadline <= 30 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {zileDeadline < 0 ? 'Expirat' : zileDeadline === 0 ? 'Azi!' : `${zileDeadline} zile`}
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                project.status === 'NOT_STARTED' ? 'bg-gray-100 text-gray-600' :
                allConfirmed || project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                project.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' :
                'bg-green-100 text-green-700'
              }`}>
                {project.status === 'NOT_STARTED' ? 'Neînceput' :
                 allConfirmed || project.status === 'COMPLETED' ? 'Finalizat' :
                 project.status === 'ARCHIVED' ? 'Arhivat' : 'Activ'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-[#FFF8F0] border-b-2 border-[#E8C5D0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
          <button onClick={() => setActiveTab('sprint')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'sprint' ? 'border-[#8B1538] text-[#8B1538]' : 'border-transparent text-gray-500 hover:text-[#8B1538]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sprintul curent
          </button>
          <button onClick={() => setActiveTab('raport')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'raport' ? 'border-[#8B1538] text-[#8B1538]' : 'border-transparent text-gray-500 hover:text-[#8B1538]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Raport Proiect
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sprint' && (
          <div>
            {projectNotStarted ? (
              /* ── Proiect neînceput ── */
              <div className="bg-white rounded-2xl border-2 border-[#E8C5D0] p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-[#8B1538] mb-2">Proiectul nu a început încă</h2>
                <p className="text-gray-500 text-sm mb-1">
                  Data de start: <strong>{formatDate(project.startDate)}</strong>
                </p>
                <p className={`text-2xl font-bold mt-4 ${
                  zilePanaLa(project.startDate) <= 3 ? 'text-red-500' :
                  zilePanaLa(project.startDate) <= 7 ? 'text-orange-500' :
                  'text-[#8B1538]'
                }`}>
                  Mai {zilePanaLa(project.startDate) === 1 ? 'este' : 'sunt'} {zilePanaLa(project.startDate)} {zilePanaLa(project.startDate) === 1 ? 'zi' : 'zile'}
                </p>
                <p className="text-gray-400 text-xs mt-2">Sprinturile se vor activa automat la data de start.</p>
              </div>
            ) : (
              /* ── Proiect activ/finalizat ── */
              <>
                {phases.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <p className="text-gray-500">Nicio etapa selectata la crearea proiectului.</p>
                  </div>
                ) : allConfirmed ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-green-200">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
</div>
                    <p className="text-xl font-bold text-green-700 mb-2">Proiect finalizat!</p>
                    <p className="text-gray-500">Toate sprint-urile au fost completate cu succes.</p>
                  </div>
                ) : !activePhase ? (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <p className="text-gray-500">Se incarca sprint-ul activ...</p>
                  </div>
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
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'raport' && (
          <div className="space-y-5">
            {/* Progres general */}
            <div className={`bg-white rounded-2xl border-2 border-[#E8C5D0] p-5 ${projectNotStarted ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-[#8B1538] mb-3">Progres general proiect</h3>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{confirmedPhases} din {totalPhases} sprinturi finalizate</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{doneTasks} din {totalTasks} taskuri finalizate</span>
                <span className={`text-sm font-bold ${getProgressTextColor(generalProgress)}`}>{generalProgress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(generalProgress)}`}
                  style={{ width: `${generalProgress}%` }} />
              </div>
            </div>

            {/* Timeline sprint-uri */}
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
                      <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full border-2 z-10 ${
                        projectNotStarted ? 'bg-white border-gray-300' :
                        isConf || isAct ? 'bg-[#8B1538] border-[#8B1538]' : 'bg-white border-gray-300'
                      }`} />
                      <div className={`ml-2 rounded-xl border-2 p-3 ${
                        projectNotStarted ? 'border-gray-200 bg-gray-50 opacity-60' :
                        isConf || isAct ? 'border-[#8B1538] bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className={`font-bold text-sm ${
                              projectNotStarted ? 'text-gray-400' :
                              isConf || isAct ? 'text-[#8B1538]' : 'text-gray-400'
                            }`}>
                              Sprint {idx + 1}: {phase.name}
                              {isConf && <span className="ml-2 text-xs font-normal text-green-600">✓ Finalizat</span>}
                            </p>
                            {phase.startDate && phase.endDate && (
                              <p className="text-xs mt-0.5 text-gray-900 font-medium">
                                {formatDate(phase.startDate)} → {formatDate(phase.endDate)}
                              </p>
                            )}
                          </div>
                          {!isFut && !projectNotStarted && tasks.length > 0 && (
                            <span className={`text-xs font-bold ${getProgressTextColor(prog)}`}>{prog}%</span>
                          )}
                        </div>
                        {!isFut && !projectNotStarted && tasks.length > 0 && (
                          <div className="pl-3 border-l-2 border-[#E8C5D0] space-y-1 mt-2">
                            {tasks.map((t, tidx) => (
                              <RaportTaskRow key={t.id} task={t} taskNumber={tidx + 1} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalii proiect */}
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
                      {members.map((m, i) => (
                        <span key={i} className="text-xs bg-[#FFF8F0] border border-[#E8C5D0] text-[#8B1538] px-2 py-0.5 rounded-full">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Sprint-uri:</span><span className="font-medium">{phases.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Taskuri totale:</span><span className="font-medium">{totalTasks}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailPage;