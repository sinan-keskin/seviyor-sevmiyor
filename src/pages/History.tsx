import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export const JSON_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019e9ec6-5fe1-7105-b1be-95ad6db3676f';

export interface HistoryRecord {
  date: string;
  result: 'SEVIYOR' | 'SEVMIYOR';
}

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(JSON_BLOB_URL, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort newest first
          setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch history', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-[#1a0b2e] font-sans flex flex-col items-center text-slate-100 p-4 sm:p-6 md:p-8">
      {/* Background Ambient Lights */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-glow-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-glow-2" />
      </div>

      <main className="relative z-10 w-full max-w-md mx-auto flex flex-col py-6 sm:py-8">
        
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
            <div className="flex flex-col gap-3">
              {records.map((record, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
                >
                  <div className="flex flex-col">
                    <span className={`text-lg font-serif italic font-bold tracking-wide ${record.result === 'SEVIYOR' ? 'text-pink-300' : 'text-purple-400'}`}>
                      {record.result === 'SEVIYOR' ? 'Seviyor ❤️' : 'Sevmiyor 💔'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 opacity-70">
                      {new Date(record.date).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
