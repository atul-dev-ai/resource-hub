"use client";

import { useState } from "react";
import { Eye, Trash2, Filter } from "lucide-react";

// Mock Data
const mockUploads = [
  { id: 1, title: "Discrete Math Midterm 2023", type: "Question Bank", course: "Discrete Math", status: "Approved", date: "2024-03-15" },
  { id: 2, title: "Data Structures Complete Notes", type: "Notes", course: "Data Structures", status: "Pending", date: "2024-03-20" },
  { id: 3, title: "Structured Programming Lab 4", type: "Assignment", course: "Structured Programming", status: "Rejected", date: "2024-03-22", reason: "File is illegible/blurry." },
  { id: 4, title: "Algorithms Final 2022", type: "Question Bank", course: "Algorithms", status: "Approved", date: "2024-03-25" },
];

export default function MyUploadsPage() {
  const [filter, setFilter] = useState("All");

  const filteredUploads = mockUploads.filter((item) => 
    filter === "All" ? true : item.status === filter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Uploads</h1>
        
        {/* Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Uploads</option>
            <option value="Approved">Approved 🟢</option>
            <option value="Pending">Pending 🟡</option>
            <option value="Rejected">Rejected 🔴</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Course</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUploads.length > 0 ? (
                filteredUploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 line-clamp-1">{upload.title}</p>
                      {upload.status === "Rejected" && (
                        <p className="text-xs text-red-500 mt-1 font-medium bg-red-50 inline-block px-2 py-0.5 rounded">Reason: {upload.reason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded mb-1">{upload.type}</span>
                      <p className="text-sm text-gray-500">{upload.course}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        upload.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        upload.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          upload.status === 'Approved' ? 'bg-green-500' :
                          upload.status === 'Pending' ? 'bg-yellow-500 animate-pulse' :
                          'bg-red-500'
                        }`}></span>
                        {upload.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {upload.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No uploads found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
