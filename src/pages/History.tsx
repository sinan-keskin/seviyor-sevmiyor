import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

import { ref, onValue, off } from 'firebase/database';
import { db } from '../lib/firebase';
export interface HistoryRecord {
  date: string;
  result: 'SEVIYOR' | 'SEVMIYOR';
}

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const historyRef = ref(db, 'history');
    
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // data is an object of { key: record } from Firebase
        const dataArray: HistoryRecord[] = Object.values(data);
        // Sort newest first
        setRecords(dataArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        setRecords([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Failed to fetch history', err);
      setLoading(false);
    });

    return () => {
      off(historyRef);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-[#1a0b2e] font-sans flex flex-col items-center text-slate-100 p-4 sm:p-6 md:p-8">
      {/* Background Ambient Lights */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-glow-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-glow-2" />
      </div>

      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col py-6 sm:py-8">
        
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-pink-300 hover:text-pink-100 transition-colors bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <ArrowLeft size={20} />
            <span className="font-medium tracking-wide">Geri Dön</span>
          </Link>
          <div className="flex items-center gap-2 text-pink-100/60 font-serif italic text-lg bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <Clock size={20} className="text-pink-400" />
            <span>Küresel Geçmiş</span>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-6 sm:p-8 flex flex-col min-h-[400px] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
          
          <h1 className="text-white text-2xl font-light tracking-widest uppercase mb-6 text-center">
            Kaderin Çiçekleri
          </h1>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50">
              <span className="text-4xl mb-4">🥀</span>
              <p>Henüz kimse papatya koparmadı...</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="p-4 text-pink-300 font-semibold text-sm tracking-wider w-16 text-center">No</th>
                    <th className="p-4 text-pink-300 font-semibold text-sm tracking-wider">Tarih & Saat</th>
                    <th className="p-4 text-pink-300 font-semibold text-sm tracking-wider">Sonuç</th>
                    <th className="p-4 text-pink-300 font-semibold text-sm tracking-wider">Testi Yapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((record, idx) => {
                    const recordNo = records.length - idx;
                    const dateObj = new Date(record.date);
                    const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4 text-white/60 text-center font-mono text-sm">{recordNo}</td>
                        <td className="p-4 text-white/80 tracking-wide">{formattedDate}</td>
                        <td className="p-4 font-serif italic font-bold">
                          <span className={`px-3 py-1 rounded-full text-sm ${record.result === 'SEVIYOR' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                            {record.result === 'SEVIYOR' ? 'Seviyor ❤️' : 'Sevmiyor 💔'}
                          </span>
                        </td>
                        <td className="p-4 text-pink-100/90 font-medium tracking-wide">
                          Hilal <span className="inline-block animate-pulse text-yellow-300">✨</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
