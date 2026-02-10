import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User, UserRole } from '../contexts/AuthContext';

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  password: string;
}

export const UserManagementPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Hardcoded users (in production, fetch from API)
  const [users, setUsers] = useState<User[]>([
    {
      id: 'usr-001',
      username: 'admin',
      email: 'admin@iotsoc.local',
      fullName: 'System Administrator',
      role: 'super_admin',
      department: 'IT Security',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2025-02-07T14:23:45Z',
    },
    {
      id: 'usr-002',
      username: 'secadmin',
      email: 'security@iotsoc.local',
      fullName: 'Security Administrator',
      role: 'security_admin',
      department: 'Security Operations',
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2025-02-06T09:15:22Z',
    },
    {
      id: 'usr-003',
      username: 'operator',
      email: 'netops@iotsoc.local',
      fullName: 'Network Operator',
      role: 'network_operator',
      department: 'Network Operations',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2025-02-07T08:30:11Z',
    },
    {
      id: 'usr-004',
      username: 'analyst',
      email: 'analyst@iotsoc.local',
      fullName: 'Security Analyst',
      role: 'security_analyst',
      department: 'Security Analysis',
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2025-02-05T16:45:33Z',
    },
  ]);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    role: 'security_analyst',
    department: '',
    password: '',
  });

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-500',
      security_admin: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500',
      network_operator: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-500',
      security_analyst: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500',
    };
    return colors[role];
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      super_admin: 'Super Admin',
      security_admin: 'Security Admin',
      network_operator: 'Network Operator',
      security_analyst: 'Security Analyst',
    };
    return labels[role];
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      department: formData.department,
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              email: formData.email,
              fullName: formData.fullName,
              role: formData.role,
              department: formData.department,
            }
          : u
      )
    );

    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== userId));
      setSelectedUser(null);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department || '',
      password: '',
    });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'security_analyst',
      department: '',
      password: '',
    });
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'super_admin' || u.role === 'security_admin').length,
    operators: users.filter((u) => u.role === 'network_operator').length,
    analysts: users.filter((u) => u.role === 'security_analyst').length,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">User Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and access permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add User</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Administrators</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Operators</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.operators}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Analysts</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.analysts}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded border text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="security_admin">Security Admin</option>
                  <option value="network_operator">Network Operator</option>
                  <option value="security_analyst">Security Analyst</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Security Operations"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleEditUser : handleAddUser}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">@{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <span className={`inline-block px-3 py-1 rounded border text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
