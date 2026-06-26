'use client';

import { useState, useEffect } from 'react';
import { Plus, UserMinus, Envelope, Phone, X, Check } from '@phosphor-icons/react';

interface TeamTabProps {
  customer: any;
}

interface Supervisor {
  id: string;
  name: string;
  phone: string;
  assignedSheds: string[];
  isActive: boolean;
  createdAt: string;
  submissionHistory?: {
    date: string;
    completed: boolean;
  }[];
}

export function TeamTab({ customer }: TeamTabProps) {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: customer?.name || 'Primary User',
      email: customer?.email || 'user@example.com',
      role: 'owner',
      status: 'active',
      joinedAt: new Date().toISOString(),
    },
  ]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showSupervisorForm, setShowSupervisorForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [supervisorPhone, setSupervisorPhone] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [assignedSheds, setAssignedSheds] = useState<string[]>([]);
  const [availableSheds, setAvailableSheds] = useState<string[]>(['Shed 1', 'Shed 2', 'Shed 3', 'Shed 4']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch supervisors on mount
  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/api/supervisors');
      if (response.ok) {
        const data = await response.json();
        setSupervisors(data.supervisors || []);
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleInvite = async () => {
    try {
      await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      setShowInvite(false);
      setInviteEmail('');
      setMessage({ type: 'success', text: 'Team member invited successfully' });
    } catch (error) {
      console.error('Error inviting team member:', error);
      setMessage({ type: 'error', text: 'Failed to invite team member' });
    }
  };

  const handleCreateSupervisor = async () => {
    if (!supervisorPhone || !supervisorName || assignedSheds.length === 0) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: supervisorPhone,
          name: supervisorName,
          assignedSheds,
        }),
      });

      if (response.ok) {
        setShowSupervisorForm(false);
        setSupervisorPhone('');
        setSupervisorName('');
        setAssignedSheds([]);
        setMessage({ type: 'success', text: 'Supervisor created successfully. OTP sent to phone.' });
        fetchSupervisors();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to create supervisor' });
      }
    } catch (error) {
      console.error('Error creating supervisor:', error);
      setMessage({ type: 'error', text: 'Failed to create supervisor' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSupervisor = async (supervisorId: string) => {
    try {
      await fetch(`/api/supervisors/${supervisorId}`, { method: 'DELETE' });
      setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
      setMessage({ type: 'success', text: 'Supervisor removed successfully' });
    } catch (error) {
      console.error('Error removing supervisor:', error);
      setMessage({ type: 'error', text: 'Failed to remove supervisor' });
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const toggleShedAssignment = (shed: string) => {
    setAssignedSheds(prev =>
      prev.includes(shed) ? prev.filter(s => s !== shed) : [...prev, shed]
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-brandGreen100 text-brandGreen700">
            Owner
          </span>
        );
      case 'supervisor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
            Supervisor
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            Admin
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Member
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            {role}
          </span>
        );
    }
  };

  const renderSubmissionHeatmap = (supervisor: Supervisor) => {
    const days = [];
    const today = new Date();
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    return (
      <div className="flex gap-1 mt-2">
        {days.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          const submission = supervisor.submissionHistory?.find(h => h.date === dateStr);
          const isCompleted = submission?.completed;
          const isToday = idx === 29;
          
          return (
            <div
              key={dateStr}
              className={`w-3 h-3 rounded-sm ${
                isCompleted
                  ? 'bg-green-500'
                  : isToday
                  ? 'bg-neutral-200'
                  : 'bg-red-200'
              }`}
              title={`${dateStr}: ${isCompleted ? 'Completed' : 'Missing'}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div
          className={`rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Team Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Team management is available for S2+ plans. You currently have {teamMembers.length} team member(s) and {supervisors.length} supervisor(s).
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowSupervisorForm(!showSupervisorForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
        >
          <Phone size={16} />
          Add Supervisor
        </button>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors"
        >
          <Plus size={16} />
          Invite Team Member
        </button>
      </div>

      {/* Supervisor Creation Form */}
      {showSupervisorForm && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold text-neutral-900">Add Supervisor</h4>
            <button
              onClick={() => setShowSupervisorForm(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Supervisor Name *
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="Enter supervisor name"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Assigned Sheds *
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSheds.map((shed) => (
                  <button
                    key={shed}
                    onClick={() => toggleShedAssignment(shed)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      assignedSheds.includes(shed)
                        ? 'bg-brandGreen700 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {assignedSheds.includes(shed) && <Check size={16} />}
                    {shed}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreateSupervisor}
                disabled={loading || !supervisorPhone || !supervisorName || assignedSheds.length === 0}
                className="flex-1 px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Supervisor & Send OTP'}
              </button>
              <button
                onClick={() => setShowSupervisorForm(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h4 className="text-base font-semibold text-neutral-900 mb-4">Invite Team Member</h4>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            />
            <button
              onClick={handleInvite}
              disabled={!inviteEmail}
              className="px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Invite
            </button>
          </div>
        </div>
      )}

      {/* Supervisors Section */}
      {supervisors.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100">
            <h4 className="text-sm font-semibold text-neutral-900">Supervisors</h4>
          </div>
          <div className="divide-y divide-neutral-100">
            {supervisors.map((supervisor) => (
              <div key={supervisor.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-bold">
                      {supervisor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">{supervisor.name}</span>
                        {getRoleBadge('supervisor')}
                      </div>
                      <p className="text-sm text-neutral-600">{supervisor.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {supervisor.assignedSheds.map((shed) => (
                          <span
                            key={shed}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700"
                          >
                            {shed}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSupervisor(supervisor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
                
                {/* Submission History Heatmap */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-2">Last 30 days submission history</p>
                  {renderSubmissionHeatmap(supervisor)}
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-green-500" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-red-200" />
                      <span>Missing</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50">
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brandGreen700 flex items-center justify-center text-white text-xs font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{member.email}</td>
                <td className="px-6 py-4 text-center">{getRoleBadge(member.role)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {new Date(member.joinedAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 text-right">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
