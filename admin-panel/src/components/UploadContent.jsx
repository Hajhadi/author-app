import React, { useState } from 'react';
import axios from 'axios';

const UploadContent = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('Book');
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('contentType', contentType);
    formData.append('price', price);

    try {
      const res = await axios.post('http://localhost:3000/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`${res.data.data.title} uploaded successfully!`);
      setFile(null);
      setTitle('');
      setDescription('');
      setPrice(0);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload New Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">File</label>
          <input type="file" onChange={handleFileChange} className="mt-1 block w-full" required />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Book">Book</option>
          <option value="Video">Video</option>
        </select>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default UploadContent;
