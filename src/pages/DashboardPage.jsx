import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import logo from '../assets/logo.png';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showInvitationsDropdown, setShowInvitationsDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [archiveSuccessModal, setArchiveSuccessModal] = useState('');

  const notificationsRef = useRef(null);
  const invitationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        fetchProjects();
        fetchPendingInvitations();
        fetchNotifications();
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target))
        setShowNotificationsDropdown(false);
      if (invitationsRef.current && !invitationsRef.current.contains(event.target))
        setShowInvitationsDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchProjects();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const response = await axios.get('/invitations/pending');
      setPendingInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications/unread');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`/notifications/${notifId}/read`);
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notifId);
        if (updated.length === 0) setShowNotificationsDropdown(false);
        return updated;
      });
    } catch (e) { console.error(e); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications([]);
      setShowNotificationsDropdown(false);
    } catch (e) { console.error(e); }
  };

  const handleConfirmSprint = async (notif) => {
    try {
      const phasesRes = await axios.get(`/projects/${notif.projectId}/phases`);
      const phases = phasesRes.data;
      const activePhase = phases.find(p => !p.confirmedByScrum);
      if (activePhase) {
        await axios.post(`/phases/${activePhase.id}/confirm`);
      }
      await handleMarkAsRead(notif.id);
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const handleArchive = async (e, project) => {
    e.stopPropagation();
    try {
      await axios.put(`/projects/${project.id}/archive`);
      setArchiveSuccessModal(`Proiectul "${project.name}" a fost arhivat.`);
      fetchProjects();
    } catch (err) {
      setErrorModal(err.response?.data?.error || 'Eroare la arhivare.');
    }
  };

  const handleUnarchive = async (e, project) => {
    e.stopPropagation();
    try {
      await axios.put(`/projects/${project.id}/unarchive`);
      fetchProjects();
    } catch (err) {
      setErrorModal(err.response?.data?.error || 'Eroare la dezarhivare.');
    }
  };

  const getNotifIcon = (type) => {
    const icons = {
      TASK_ASSIGNED: (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      ),
      SPRINT_DONE_SCRUM: (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      SPRINT_DONE_MEMBER: (
        <div className="w-8 h-8 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      ),
      TASK_MODIFIED: (
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      ),
      SPRINT_CONFIRMED: (
        <div className="w-8 h-8 rounded-full bg-[#8B1538] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      ),
      SPRINT_DEADLINE: (
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    };
    return icons[type] || (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const zilePanaLaDeadline = (deadlineString) => {
    if (!deadlineString) return null;
    const azi = new Date(); azi.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineString); deadline.setHours(0, 0, 0, 0);
    return Math.round((deadline - azi) / (1000 * 60 * 60 * 24));
  };

  const getZileLabel = (zile) => {
    if (zile === null) return null;
    if (zile < 0) return { text: `Expirat acum ${Math.abs(zile)} zile`, color: 'text-red-500' };
    // ── MODIFICAT: "Se termină azi!" în loc de "Deadline azi!" ──
    if (zile === 0) return { text: 'Se termină azi!', color: 'text-red-500 font-bold' };
    if (zile <= 7) return { text: `${zile} ${zile === 1 ? 'zi rămasă' : 'zile rămase'}`, color: 'text-orange-500 font-semibold' };
    if (zile <= 30) return { text: `${zile} zile rămase`, color: 'text-yellow-600' };
    return { text: `${zile} zile rămase`, color: 'text-green-600' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Activ';
      case 'COMPLETED': return 'Finalizat';
      case 'ARCHIVED': return 'Arhivat';
      case 'NOT_STARTED': return 'Neînceput';
      default: return status;
    }
  };

  // ── MODIFICAT: din "ALL" excludem ARCHIVED — apar doar la filtrul "Arhivate" ──
  const filteredProjects = projects.filter((p) =>
    filterStatus === 'ALL' ? p.status !== 'ARCHIVED' : p.status === filterStatus
  );

  const getFilterLabel = (count) => {
    const s = count === 1;
    switch (filterStatus) {
      case 'ACTIVE': return s ? 'activ' : 'active';
      case 'COMPLETED': return s ? 'finalizat' : 'finalizate';
      case 'ARCHIVED': return s ? 'arhivat' : 'arhivate';
      case 'NOT_STARTED': return s ? 'neînceput' : 'neîncepute';
      default: return 'în total';
    }
  };

  const handleAcceptInvitation = async (id) => {
    try {
      await axios.post(`/invitations/${id}/accept`);
      const res = await axios.get('/invitations/pending');
      setPendingInvitations(res.data);
      if (res.data.length === 0) setShowInvitationsDropdown(false);
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const handleRejectInvitation = async (id) => {
    try {
      await axios.post(`/invitations/${id}/reject`);
      const res = await axios.get('/invitations/pending');
      setPendingInvitations(res.data);
      if (res.data.length === 0) setShowInvitationsDropdown(false);
    } catch (e) { console.error(e); }
  };

  const handleEditProject = (project) => {
    const currentUserId = JSON.parse(sessionStorage.getItem('user'))?.id;
    if (project.creatorId !== currentUserId) {
      setErrorModal(`Doar ${project.creatorName} poate modifica acest proiect.`);
      return;
    }
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = async (projectId) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/projects/${projectId}`);
      setDeleteConfirm(null);
      fetchProjects();
    } catch (err) {
      setErrorModal(err.response?.data?.error || 'Eroare la ștergerea proiectului.');
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getMembriLipsesc = (project) => {
    if (!project.members) return null;
    const total = project.members.length;
    const acceptati = project.members.filter(m => !m.includes('|PENDING')).length;
    const lipsesc = total - acceptati;
    if (lipsesc <= 0) return null;
    return lipsesc === 1 ? 'Un membru mai trebuie să accepte invitația' : `${lipsesc} membri mai trebuie să accepte invitația`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#4A0E2A]">
      {/* NAV */}
      <nav className="bg-[#FFF8F0] shadow-lg border-b-2 border-[#E8C5D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logo} alt="TeamMate" className="h-10 w-auto" />
              <span className="ml-3 text-xl font-bold text-[#8B1538]">TeamMate</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* Clopoțel */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => { setShowNotificationsDropdown(!showNotificationsDropdown); setShowInvitationsDropdown(false); }}
                  className="relative p-2 rounded-full hover:bg-[#F5E6E8] transition">
                  <svg className="w-6 h-6 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>
                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-[#E8C5D0] z-50 max-h-[500px] overflow-y-auto">
                    <div className="p-4 border-b border-[#E8C5D0] flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-[#8B1538]">Notificări</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {notifications.length === 0 ? 'Nu ai notificări noi' : `${notifications.length} necitite`}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs text-[#8B1538] hover:underline font-medium">
                          Marchează toate ca citite
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-400">Nicio notificare nouă</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-[#FFF8F0] transition">
                            <div className="flex items-start gap-3">
                              {notif.type === 'SPRINT_CONFIRMED' && notif.message.includes('finalizat')
                                ? (
                                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15c-3.314 0-6-2.686-6-6V4h12v5c0 3.314-2.686 6-6 6zm0 0v4m-3 1h6M6 4H4a2 2 0 00-2 2v1c0 2.21 1.343 4 3 4m11-7h2a2 2 0 012 2v1c0 2.21-1.343 4-3 4" />
                                    </svg>
                                  </div>
                                )
                                : getNotifIcon(notif.type)
                              }
                              <div className="flex-1">
                                <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: notif.message.replace(/(".*?")/g, '<strong>$1</strong>') }} />
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {notif.type === 'SPRINT_DONE_SCRUM' && (
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => { handleConfirmSprint(notif); }}
                                      className="flex-1 bg-green-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-green-700 transition">
                                      Confirmă
                                    </button>
                                    <button onClick={async () => { await handleMarkAsRead(notif.id); setShowNotificationsDropdown(false); setTimeout(() => navigate(`/projects/${notif.projectId}`), 500); }}
                                      className="flex-1 border-2 border-[#8B1538] text-[#8B1538] text-xs font-bold py-1.5 rounded-lg hover:bg-[#FFF8F0] transition">
                                      Modifică
                                    </button>
                                  </div>
                                )}
                                {notif.type === 'TASK_MODIFIED' && (
                                  <button onClick={() => { handleMarkAsRead(notif.id); navigate(`/projects/${notif.projectId}`); setShowNotificationsDropdown(false); }}
                                    className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold py-1.5 rounded-lg transition">
                                    Intră să vezi modificarea
                                  </button>
                                )}
                                {notif.type === 'TASK_ASSIGNED' && (
                                  <button onClick={() => { handleMarkAsRead(notif.id); navigate(`/projects/${notif.projectId}`); setShowNotificationsDropdown(false); }}
                                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded-lg transition">
                                    Vezi task-ul
                                  </button>
                                )}
                                {notif.type === 'SPRINT_DEADLINE' && (
                                  <button onClick={() => { handleMarkAsRead(notif.id); navigate(`/projects/${notif.projectId}`); setShowNotificationsDropdown(false); }}
                                    className="mt-2 w-full bg-[#8B1538] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#6B0F2E] transition">
                                    Vezi taskurile
                                  </button>
                                )}
                                {notif.type === 'SPRINT_DONE_MEMBER' ? (
                                  <button onClick={() => { handleMarkAsRead(notif.id); navigate(`/projects/${notif.projectId}`); setShowNotificationsDropdown(false); }}
                                    className="mt-2 w-full bg-[#8B1538] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#6B0F2E] transition">
                                    Deschide următorul sprint
                                  </button>
                                ) : notif.type === 'SPRINT_CONFIRMED' && !notif.message.includes('finalizat') ? (
                                  <button onClick={async () => { await handleMarkAsRead(notif.id); setShowNotificationsDropdown(false); setTimeout(() => navigate(`/projects/${notif.projectId}`), 500); }}
                                    className="mt-2 w-full bg-[#8B1538] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#6B0F2E] transition">
                                    Deschide următorul sprint
                                  </button>
                                ) : notif.type === 'SPRINT_CONFIRMED' && notif.message.includes('finalizat') ? (
                                  <button onClick={() => { handleMarkAsRead(notif.id); navigate(`/projects/${notif.projectId}?tab=raport`); setShowNotificationsDropdown(false); }}
                                    className="mt-2 w-full bg-[#8B1538] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#6B0F2E] transition">
                                    Vezi raportul final al proiectului
                                  </button>
                                ) : !['SPRINT_DONE_SCRUM', 'TASK_MODIFIED', 'TASK_ASSIGNED'].includes(notif.type) && (
                                  <button onClick={() => handleMarkAsRead(notif.id)} className="mt-1 text-xs text-gray-400 hover:text-gray-600 transition">
                                    Marchează ca citit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Plic */}
              <div className="relative" ref={invitationsRef}>
                <button
                  onClick={() => { setShowInvitationsDropdown(!showInvitationsDropdown); setShowNotificationsDropdown(false); }}
                  className="relative p-2 rounded-full hover:bg-[#F5E6E8] transition">
                  <svg className="w-6 h-6 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {pendingInvitations.length > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>
                {showInvitationsDropdown && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-[#E8C5D0] z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b-2 border-[#E8C5D0]">
                      <h3 className="font-bold text-[#8B1538]">Invitații primite</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {pendingInvitations.length === 0 ? 'Nu ai invitații noi' : `${pendingInvitations.length} ${pendingInvitations.length === 1 ? 'invitație nouă' : 'invitații noi'}`}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {pendingInvitations.map((inv) => (
                        <div key={inv.id} className="p-4 hover:bg-[#FFF8F0] transition">
                          <div className="flex items-start space-x-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{inv.invitedByName}</p>
                              <p className="text-xs text-gray-600 mb-3">
                                te-a invitat în proiectul <span className="font-semibold text-[#8B1538]">{inv.projectName}</span>
                              </p>
                              <div className="flex space-x-2">
                                <button onClick={() => handleAcceptInvitation(inv.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition">
                                  Acceptă
                                </button>
                                <button onClick={() => handleRejectInvitation(inv.id)}
                                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition">
                                  Respinge
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l-2 border-[#E8C5D0]">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1538] to-[#6B0F2E] flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button onClick={handleLogout}
  className="text-[#8B1538] hover:text-[#6B0F2E] p-2 rounded-lg hover:bg-[#F5E6E8] transition">
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
</button>

            </div>
          </div>
        </div>
      </nav>

      {/* CONȚINUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#8B1538] mb-1">Bine ai venit, {user.name}!</h1>
              <p className="text-gray-500 text-sm">Gestionează proiectele tale academice</p>
            </div>
            <Link to="/projects/new"
              className="bg-[#6B0F2E] hover:bg-[#8B1538] text-white font-bold py-3 px-6 rounded-lg transition shadow-lg hover:shadow-xl">
              + Proiect nou
            </Link>
          </div>
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-[#8B1538]">Proiectele Mele</h2>
              <div className="relative inline-flex items-center">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-3 pr-9 py-1.5 text-sm border border-[#8B1538] rounded-lg bg-white text-[#8B1538] font-medium cursor-pointer hover:bg-[#FFF8F0] transition focus:outline-none focus:ring-2 focus:ring-[#6B0F2E]">
                  <option value="ALL">Toate</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Finalizate</option>
                  <option value="ARCHIVED">Arhivate</option>
                  <option value="NOT_STARTED">Neîncepute</option>
                </select>
                <svg className="w-4 h-4 text-[#8B1538] absolute right-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'proiect' : 'proiecte'} {getFilterLabel(filteredProjects.length)}
            </p>

            {loading ? (
              <div className="text-center py-12"><p className="text-gray-500">Se încarcă proiectele...</p></div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                {projects.length === 0 ? (
                  <>
                    <p className="text-gray-600 mb-2">Nu ai niciun proiect creat încă.</p>
                    <p className="text-gray-500 mb-6 text-sm">Începe prin a crea primul tău proiect academic!</p>
                    <Link to="/projects/new" className="inline-block bg-[#6B0F2E] hover:bg-[#8B1538] text-white font-bold py-3 px-6 rounded-lg transition">
                      Creează primul proiect
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-600">Nu ai proiecte {getFilterLabel(2)}.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const zile = zilePanaLaDeadline(project.deadline);
                  const zileLabel = getZileLabel(zile);
                  const membriLipsesc = getMembriLipsesc(project);
                  const isOwner = project.creatorId === user.id;

                  return (
                    <div key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="bg-[#FFF8F0] border-2 border-[#E8C5D0] rounded-xl p-5 hover:border-[#8B1538] hover:shadow-xl transition duration-200 flex flex-col gap-3 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{project.name}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>

                          {/* Icon arhivare doar pe cardul COMPLETED */}
                          {project.status === 'COMPLETED' && (
                            <button
                              onClick={(e) => handleArchive(e, project)}
                              title="Arhivează proiect"
                              className="p-1.5 rounded-lg transition text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </button>
                          )}
                          {/* Icon dezarhivare doar pe cardul ARCHIVED */}
                          {isOwner && project.status === 'ARCHIVED' && (
                            <button
                              onClick={(e) => handleUnarchive(e, project)}
                              title="Dezarhivează proiect"
                              className="p-1.5 rounded-lg transition text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                              </svg>
                            </button>
                          )}

                          <button onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                            title={isOwner ? 'Editează proiect' : `Doar ${project.creatorName} poate modifica`}
                            className={`p-1.5 rounded-lg transition ${isOwner ? 'text-gray-400 hover:text-[#8B1538] hover:bg-[#F5E6E8]' : 'text-gray-300 cursor-not-allowed'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); if (!isOwner) { setErrorModal(`Doar ${project.creatorName} poate șterge acest proiect.`); return; } setDeleteConfirm(project); }}
                            className={`p-1.5 rounded-lg transition ${isOwner ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>
                      )}

                      <div className="border-t border-[#E8C5D0] pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-[#8B1538] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Deadline:</span>
                            <span>{formatDate(project.deadline)}</span>
                          </div>
                          {project.status === 'NOT_STARTED' && project.startDate ? (
                            <span className="text-xs text-gray-500 font-medium">Start: {formatDate(project.startDate)}</span>
                          ) : (
                            zileLabel && <span className={`text-xs ${zileLabel.color}`}>{zileLabel.text}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-[#8B1538] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Creat:</span>
                          <span>{formatDate(project.createdAt)}</span>
                          <span className="mx-1 text-gray-300">|</span>
                          <span className="font-medium">Autor:</span>
                          <span className="text-[#8B1538] font-medium">{project.creatorName}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-sm font-medium text-gray-600">
                            Membri echipei {project.members?.length > 0 && `(${project.members.length})`}:
                          </span>
                          {project.members && project.members.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.members.map((memberRaw, index) => {
                                const parts = memberRaw.split('|');
                                const nume = parts[0];
                                const status = parts[1] || 'ACCEPTED';
                                const isAccepted = status === 'ACCEPTED';
                                return (
                                  <span key={index}
                                    title={isAccepted ? 'Utilizatorul face parte din proiect' : 'Utilizatorul nu a acceptat încă invitația'}
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-default ${isAccepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {nume}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic mt-1">Niciun membru încă</p>
                          )}
                          {membriLipsesc && <p className="text-xs text-orange-500 font-medium mt-1.5">{membriLipsesc}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMARE ȘTERGERE */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ștergi proiectul?</h3>
            <p className="text-sm text-gray-600 mb-1">Ești sigură că vrei să ștergi <strong className="text-[#8B1538]">{deleteConfirm.name}</strong>?</p>
            <p className="text-xs text-gray-400 mb-6">Această acțiune este ireversibilă.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium">Anulează</button>
              <button onClick={() => handleDeleteProject(deleteConfirm.id)} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-bold disabled:opacity-50">
                {deleteLoading ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EROARE PERMISIUNI */}
      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">{errorModal}</p>
            </div>
            <button onClick={() => setErrorModal('')}
              className="w-full py-2.5 bg-[#8B1538] text-white rounded-lg hover:bg-[#6B0F2E] transition text-sm font-bold">
              Am înțeles
            </button>
          </div>
        </div>
      )}

      {/* MODAL ARHIVARE SUCCESS */}
      {archiveSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-4">{archiveSuccessModal}</p>
            <button onClick={() => setArchiveSuccessModal('')}
              className="w-full py-2.5 bg-[#8B1538] text-white rounded-lg hover:bg-[#6B0F2E] transition text-sm font-bold">
              Am înțeles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;