"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '../../../context/UserContext';
import {
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills || []
  });

  const [skillInput, setSkillInput] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(profileData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullName}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-emerald-600" />
              )}
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Change Avatar
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Skills (for artisans/businesses) */}
          {(user?.role === 'artisan' || user?.role === 'business_owner') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills / Services
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-emerald-700 hover:text-emerald-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Enable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Email notifications for new messages', enabled: true },
              { label: 'Push notifications for job applications', enabled: true },
              { label: 'Email updates about your services', enabled: false },
              { label: 'Marketing emails', enabled: false }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}