import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import IssueModal from './IssueModal';

export default function Dashboard() {
    const [issues, setIssues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    useEffect(() => {
        const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (issue, newStatus) => {
        if (issue.status === 'Open' && newStatus === 'Done') {
            alert('Start the issue first! Move to "In Progress" before "Done".');
            return;
        }
        try {
            await updateDoc(doc(db, 'issues', issue.id), { status: newStatus });
        } catch (err) {
            console.error(err);
        }
    };

    const filteredIssues = issues.filter(issue => {
        if (filterStatus !== 'All' && issue.status !== filterStatus) return false;
        if (filterPriority !== 'All' && issue.priority !== filterPriority) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Issue Tracker</h1>
                        <p className="text-gray-600">Logged in as: {auth.currentUser?.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => auth.signOut()} className="text-gray-600 hover:text-black">
                            Sign Out
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                        >
                            + New Issue
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-center">
                    <span className="font-medium text-gray-700">Filter by:</span>
                    <select
                        className="border p-2 rounded"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                    <select
                        className="border p-2 rounded"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="All">All Priorities</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>

                {/* Issue List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredIssues.map((issue) => (
                        <div key={issue.id} className="bg-white p-5 rounded shadow hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{issue.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {issue.priority}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{issue.description}</p>

                            <div className="border-t pt-3 mt-auto">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-500">Status:</span>
                                    <select
                                        className="border rounded p-1 text-sm bg-gray-50"
                                        value={issue.status}
                                        onChange={(e) => handleStatusChange(issue, e.target.value)}
                                    >
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Assignee: {issue.assignee || 'Unassigned'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredIssues.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No issues found.
                        </div>
                    )}
                </div>

                {showModal && (
                    <IssueModal
                        onClose={() => setShowModal(false)}
                        existingIssues={issues}
                    />
                )}
            </div>
        </div>
    );
}
