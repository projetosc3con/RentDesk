import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RECORD_TYPE_SEQUENCE = ['Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída'];

const RECORD_TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  'Entrada':        { color: 'text-emerald-400', bg: 'bg-emerald-500',   icon: 'login' },
  'Saída Almoço':   { color: 'text-amber-400',   bg: 'bg-amber-500',    icon: 'restaurant' },
  'Retorno Almoço': { color: 'text-blue-400',    bg: 'bg-blue-500',     icon: 'keyboard_return' },
  'Saída':          { color: 'text-red-400',      bg: 'bg-red-500',      icon: 'logout' },
};

function padTwo(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(date: Date) {
  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}:${padTwo(date.getSeconds())}`;
}

function formatDatePtBr(date: Date) {
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${weekdays[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

const ClockIn: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [time, setTime] = useState(new Date());
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [nextType, setNextType] = useState<string | null>('Entrada');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [successType, setSuccessType] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('Obtendo localização...');
  const [error, setError] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation('Localização indisponível');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          setLocation(city && state ? `${city}, ${state}` : 'Local identificado');
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      },
      () => setLocation('Localização indisponível')
    );
  }, []);

  const fetchTodayRecords = useCallback(async () => {
    try {
      const res = await api.get('/hr/clock-in/today');
      setTodayRecords(res.data.records || []);
      setNextType(res.data.nextType);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodayRecords(); }, [fetchTodayRecords]);

  const handleMark = async () => {
    if (!nextType || marking) return;
    setMarking(true);
    setError(null);
    try {
      const res = await api.post('/hr/clock-in');
      setSuccessType(res.data.record.record_type);
      await fetchTodayRecords();
      setTimeout(() => setSuccessType(null), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erro ao registrar ponto.');
    } finally {
      setMarking(false);
    }
  };

  const meta = nextType ? RECORD_TYPE_META[nextType] : null;
  const allDone = !nextType;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Voltar
        </button>
        <div className="text-right">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {profile?.full_name || 'Colaborador'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-[5.5rem] sm:text-[7rem] md:text-[9rem] font-black text-white leading-none tracking-tight tabular-nums select-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatTime(time)}
          </p>
          <p className="text-slate-400 text-base sm:text-lg font-medium mt-2">
            {formatDatePtBr(time)}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>{location}</span>
          </div>
        </motion.div>

        {/* Status / Button */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-20 h-20 rounded-full bg-slate-800 animate-pulse" />
          ) : successType ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
              </div>
              <p className="text-emerald-400 font-bold text-lg">{successType} registrada!</p>
            </motion.div>
          ) : allDone ? (
            <motion.div key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-slate-500">done_all</span>
              </div>
              <p className="text-slate-400 font-bold text-lg">Todos os registros do dia concluídos</p>
              <p className="text-slate-600 text-sm">Bom trabalho!</p>
            </motion.div>
          ) : (
            <motion.div key="mark"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}
              <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
                Próximo registro:
              </p>
              <p className={`text-2xl font-black ${meta?.color}`}>{nextType}</p>
              <button
                onClick={handleMark}
                disabled={marking}
                className={`relative mt-2 w-44 h-44 rounded-full ${meta?.bg} flex items-center justify-center shadow-2xl
                  transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-60
                  ${marking ? 'animate-pulse' : ''}
                `}
                style={{ boxShadow: `0 0 60px ${meta?.bg === 'bg-emerald-500' ? 'rgba(16,185,129,0.3)' : meta?.bg === 'bg-amber-500' ? 'rgba(245,158,11,0.3)' : meta?.bg === 'bg-blue-500' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}` }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="material-symbols-outlined text-5xl text-white">{marking ? 'hourglass_empty' : 'fingerprint'}</span>
                  <span className="text-white font-black text-2xl uppercase tracking-widest">{marking ? '...' : 'Marcar'}</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's timeline */}
        {!loading && todayRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mt-2"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Registros de hoje</p>
            <div className="flex items-center justify-center gap-0">
              {RECORD_TYPE_SEQUENCE.map((type, idx) => {
                const done = todayRecords.find(r => r.record_type === type);
                const m = RECORD_TYPE_META[type];
                return (
                  <React.Fragment key={type}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        done
                          ? `${m.bg} border-transparent`
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        <span className={`material-symbols-outlined text-sm ${done ? 'text-white' : 'text-slate-600'}`}>
                          {m.icon}
                        </span>
                      </div>
                      <p className={`text-[9px] font-bold ${done ? m.color : 'text-slate-600'} text-center`} style={{ width: 52 }}>
                        {done
                          ? new Date(done.recorded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </p>
                    </div>
                    {idx < RECORD_TYPE_SEQUENCE.length - 1 && (
                      <div className={`h-0.5 w-6 mb-5 transition-all ${
                        done && todayRecords.find(r => r.record_type === RECORD_TYPE_SEQUENCE[idx + 1])
                          ? 'bg-slate-500' : 'bg-slate-800'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClockIn;
