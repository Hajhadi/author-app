import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Viewer from '../components/Viewer';

const Library = () => {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerState, setViewerState] = useState({ isOpen: false, contentType: null, contentId: null });

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/user/my-library');
        setLibrary(res.data.data);
      } catch (err) {
        setError('Failed to fetch library.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const openViewer = (contentType, contentId) => {
    setViewerState({ isOpen: true, contentType, contentId });
  };

  const closeViewer = () => {
    setViewerState({ isOpen: false, contentType: null, contentId: null });
  };

  if (loading) return <p>Loading your library...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {library.map((item) => (
          <div key={item._id} className="border rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold">{item.content.title}</h2>
            <p className="text-gray-600">{item.content.description}</p>
            <p className="text-sm text-gray-500 mt-2">Type: {item.contentType}</p>
            <button
              onClick={() => openViewer(item.contentType, item.content._id)}
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Read / Watch
            </button>
          </div>
        ))}
      </div>

      <Viewer
        isOpen={viewerState.isOpen}
        closeModal={closeViewer}
        contentType={viewerState.contentType}
        contentId={viewerState.contentId}
      />
    </div>
  );
};

export default Library;
