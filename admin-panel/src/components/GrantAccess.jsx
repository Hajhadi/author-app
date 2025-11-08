import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GrantAccess = () => {
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedContent, setSelectedContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('http://localhost:3000/api/admin/users');
        // These endpoints are assumed to exist; handle failures gracefully
        const booksRes = await axios.get('http://localhost:3000/api/admin/content?type=book');
        const videosRes = await axios.get('http://localhost:3000/api/admin/content?type=video');

        setUsers(usersRes.data.data);
        setContent([
          ...(booksRes.data.data || []),
          ...(videosRes.data.data || []),
        ]);
      } catch (err) {
        setMessage('Failed to load users or content.');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const contentItem = content.find((c) => c._id === selectedContent);
      if (!contentItem) {
        setMessage('Select content before granting access.');
        return;
      }

      const res = await axios.post('http://localhost:3000/api/admin/grant-access', {
        userId: selectedUser,
        contentId: selectedContent,
        contentType: contentItem.contentType,
      });
      setMessage(res.data.message || 'Access granted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to grant access.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Grant User Access</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700">
            Select User
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Select Content
          </label>
          <select
            id="content"
            value={selectedContent}
            onChange={(e) => setSelectedContent(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose content...</option>
            {content.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title} ({item.contentType})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!selectedUser || !selectedContent}
        >
          Grant Access
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default GrantAccess;
