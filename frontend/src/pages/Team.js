import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Team.css';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'Member',
    password: ''
  });

  const [isAdmin] = useState(true);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/team`);
      const data = await response.json();
      
      const sorted = data.sort((a, b) => {
        if (a.role === 'Admin') return -1;
        if (b.role === 'Admin') return 1;
        return 0;
      });
      
      setTeamMembers(sorted);
      setLoading(false);
    } catch (error) {
      console.error('Error loading team members:', error);
      const sampleData = [
        {
          _id: '1',
          fullName: 'Harsha',
          phone: '+1 (555) 100-2000',
          email: 'harsha@hubly.com',
          role: 'Admin'
        },
        {
          _id: '2',
          fullName: 'Bharath',
          phone: '+1 (555) 200-3002',
          email: 'bharath@hubly.com',
          role: 'Member'
        },
        {
          _id: '3',
          fullName: 'Tharun',
          phone: '+1 (555) 300-4003',
          email: 'tharun@hubly.com',
          role: 'Member'
        },
        {
          _id: '4',
          fullName: 'Smitha',
          phone: '+1 (555) 400-5004',
          email: 'smitha@hubly.com',
          role: 'Member'
        },
        {
          _id: '5',
          fullName: 'Prathiba',
          phone: '+1 (555) 500-6005',
          email: 'prathiba@hubly.com',
          role: 'Member'
        }
      ];
      setTeamMembers(sampleData);
      setLoading(false);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    const admin = teamMembers.filter(m => m.role === 'Admin');
    const members = teamMembers.filter(m => m.role !== 'Admin');
    
    const sortedMembers = [...members].sort((a, b) => {
      if (newOrder === 'asc') {
        return a.fullName.localeCompare(b.fullName);
      } else {
        return b.fullName.localeCompare(a.fullName);
      }
    });
    
    setTeamMembers([...admin, ...sortedMembers]);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const memberData = {
        fullName: formData.fullName,
        phone: formData.phone || 'N/A',
        email: formData.email,
        role: formData.role,
        password: formData.email
      };

      const response = await fetch(`${BACKEND_URL}/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      
      if (response.ok) {
        alert('Team member added successfully!');
        setShowAddModal(false);
        setFormData({ fullName: '', phone: '', email: '', role: 'Member', password: '' });
        loadTeamMembers();
      } else {
        const error = await response.json();
        alert(error.error || 'Error adding team member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      const newMember = {
        _id: Date.now().toString(),
        fullName: formData.fullName,
        phone: formData.phone || 'N/A',
        email: formData.email,
        role: formData.role
      };
      setTeamMembers([...teamMembers, newMember]);
      setShowAddModal(false);
      setFormData({ fullName: '', phone: '', email: '', role: 'Member', password: '' });
      alert('Team member added successfully!');
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/team/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Team member updated successfully!');
        setShowEditModal(false);
        setCurrentUser(null);
        setFormData({ fullName: '', phone: '', email: '', role: 'Member', password: '' });
        loadTeamMembers();
      } else {
        const error = await response.json();
        alert(error.error || 'Error updating team member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      const updated = teamMembers.map(member => 
        member._id === currentUser._id 
          ? { ...member, ...formData }
          : member
      );
      setTeamMembers(updated);
      setShowEditModal(false);
      setCurrentUser(null);
      setFormData({ fullName: '', phone: '', email: '', role: 'Member', password: '' });
      alert('Team member updated successfully!');
    }
  };

  const handleDeleteMember = async (memberId, isAdminRole) => {
    if (isAdminRole) {
      alert('Cannot delete admin!');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/team/${memberId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Team member deleted successfully!');
          loadTeamMembers();
        } else {
          const error = await response.json();
          alert(error.error || 'Error deleting team member');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        setTeamMembers(teamMembers.filter(m => m._id !== memberId));
        alert('Team member deleted successfully!');
      }
    }
  };

  const openEditModal = (member) => {
    if (member.role === 'Admin') {
      alert('Cannot edit admin!');
      return;
    }
    setCurrentUser(member);
    setFormData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email,
      role: member.role,
      password: ''
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="team-page">
        <Sidebar />
        <div className="team-content">
          <h1>Team</h1>
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      <Sidebar />
      
      <div className="team-content">
        <div className="team-header">
          <h1>Team</h1>
        </div>

        <div className="team-table-container">
          <table className="team-table">
            <thead>
              <tr>
                <th className="sortable" onClick={handleSort}>
                  Full Name {sortOrder === 'asc' ? '↑' : '↓'}
                </th>
                <th>Phone</th>
                <th>Email</th>
                <th>role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No team members found
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span>{member.fullName}</span>
                      </div>
                    </td>
                    <td>{member.phone}</td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>
                      {member.role !== 'Admin' && isAdmin && (
                        <div className="action-icons">
                          <button 
                            className="icon-btn"
                            onClick={() => openEditModal(member)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="icon-btn"
                            onClick={() => handleDeleteMember(member._id, member.role === 'Admin')}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="add-member-btn-container">
            <button 
              className="add-member-btn"
              onClick={() => setShowAddModal(true)}
            >
              ⊕ Add Team members
            </button>
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
              <h2>Add Team members</h2>
              <p className="modal-description">
                Talk with colleagues in a group chat. Messages in this group are only visible to it's participants. 
                New teammates may only be invited by the administrators.
              </p>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label>User name</label>
                  <input
                    type="text"
                    placeholder="User name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email ID</label>
                  <input
                    type="email"
                    placeholder="Email ID"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div className="modal-actions-new">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Team Member</h2>
              <form onSubmit={handleEditMember}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Update Member</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;