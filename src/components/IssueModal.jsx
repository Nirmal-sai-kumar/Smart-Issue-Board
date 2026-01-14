import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function IssueModal({ onClose, existingIssues }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignee, setAssignee] = useState('');
    const [loading, setLoading] = useState(false);

    const checkSimilarity = (newTitle) => {
        const similar = existingIssues.some(issue =>
            issue.title.toLowerCase().includes(newTitle.toLowerCase())
        );
        if (similar && newTitle.length > 5) {
            alert('Note: A similar issue already exists!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'issues'), {
                title,
                description,
                priority,
                status: 'Open',
                assignee,
                createdBy: auth.currentUser.email,
                createdAt: serverTimestamp(),
            });
            onClose();
        } catch (err) {
            alert('Error creating issue: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Issue</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                checkSimilarity(e.target.value);
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Priority</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Assign To (Email)</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            placeholder="developer@example.com"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {loading ? 'Creating...' : 'Create Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
