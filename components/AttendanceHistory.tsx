
import React from 'react';
import { AttendanceRecord } from '../types';
import { FileSpreadsheet, Printer, Search, User, Calendar, Tag } from './Icons';
import * as XLSX from 'xlsx';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records }) => {
  const exportToExcel = () => {
    if (records.length === 0) return;

    // Map records to a flat structure for Excel
    const dataToExport = records.map(r => ({
      'Date': new Date(r.timestamp).toLocaleDateString(),
      'Time': new Date(r.timestamp).toLocaleTimeString(),
      'Student Name': r.name,
      'Student ID': r.userId,
      'Course/Department': r.department || 'Not Assigned',
      'Attendance Status': r.status,
      'Confidence Score (%)': r.confidence
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 12 }, // Date
      { wch: 12 }, // Time
      { wch: 25 }, // Name
      { wch: 15 }, // ID
      { wch: 25 }, // Department
      { wch: 15 }, // Status
      { wch: 20 }, // Confidence
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    // Generate filename with current date
    const fileName = `KereO_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Trigger download
    XLSX.writeFile(workbook, fileName);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div>
          <h2 className="text-2xl font-black flex items-center space-x-3 text-zinc-100">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <span className="tracking-tight">Attendance Records</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Detailed log of all recognized students and their entry status.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={printReport}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-3 rounded-xl transition-all border border-zinc-700 font-bold text-sm active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportToExcel}
            disabled={records.length === 0}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all font-black text-sm active:scale-95 shadow-lg ${
              records.length === 0 
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed grayscale' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Print-only Header (Hidden on screen) */}
      <div className="hidden print:block mb-8 text-black">
        <h1 className="text-3xl font-black mb-2">KereO Attendance System Report</h1>
        <p className="text-sm font-bold opacity-70">Generated on: {new Date().toLocaleString()}</p>
        <div className="mt-4 p-4 border rounded-xl bg-gray-50 flex justify-between">
           <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Total Records</p>
              <p className="text-xl font-black">{records.length}</p>
           </div>
           <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">System Status</p>
              <p className="text-xl font-black text-green-600">Verified</p>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase font-black tracking-[0.15em]">
            <tr>
              <th className="px-8 py-5">Student Identity</th>
              <th className="px-8 py-5">Timestamp</th>
              <th className="px-8 py-5">Course / Program</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Match AI</th>
              <th className="px-8 py-5 no-print">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-zinc-700 italic font-medium">
                  <div className="flex flex-col items-center opacity-30">
                    <Calendar className="w-12 h-12 mb-4" />
                    <p>No activity records available for this period.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shadow-sm group-hover:border-blue-500/30 transition-colors">
                        <User className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100 leading-tight tracking-tight">{record.name}</div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{record.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-zinc-400 text-xs font-medium">
                    <div className="flex flex-col">
                      <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                      <span className="text-[10px] opacity-50 mt-1 font-mono">{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs font-bold text-zinc-400">{record.department || 'Information Technology'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col space-y-1">
                      <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            record.confidence > 90 ? 'bg-emerald-500' : record.confidence > 80 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${record.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-zinc-600">{record.confidence}% Score</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 no-print">
                     {record.snapshotBase64 && (
                        <div className="relative group/snap">
                          <img 
                              src={record.snapshotBase64} 
                              alt="Verification Snapshot" 
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shadow-md group-hover/snap:scale-150 transition-all z-10 hover:z-50"
                          />
                          <div className="absolute inset-0 bg-blue-500/10 rounded-xl opacity-0 group-hover/snap:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                     )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
