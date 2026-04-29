import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EMPLOYEES = [
  { id: '1', name: 'João Silva', currentPosition: 'Técnico de Campo I', department: 'Operações', salary: 'R$ 3.500,00' },
  { id: '2', name: 'Maria Santos', currentPosition: 'Assistente Administrativo', department: 'Financeiro', salary: 'R$ 2.800,00' },
];

const MOCK_POSITIONS = [
  { id: '101', name: 'Técnico de Campo II', level: 'Pleno' },
  { id: '102', name: 'Supervisor de Operações', level: 'Sênior' },
  { id: '103', name: 'Analista de Processos', level: 'Pleno' },
];

const ChangePositionModal: React.FC<ChangePositionModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof MOCK_EMPLOYEES[0] | null>(null);
  const [newPositionId, setNewPositionId] = useState('');
  const [step, setStep] = useState(1); // 1: Search, 2: Change

  const handleSelectEmployee = (emp: typeof MOCK_EMPLOYEES[0]) => {
    setSelectedEmployee(emp);
    setStep(2);
  };

  const reset = () => {
    setSearchTerm('');
    setSelectedEmployee(null);
    setNewPositionId('');
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={reset}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <span className="material-symbols-outlined">person_edit</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Alterar Cargo</h2>
                <p className="text-sm text-slate-500">Movimentação de colaborador e atualização salarial.</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 min-h-[400px]">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    type="text"
                    placeholder="Pesquisar colaborador por nome ou CPF..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resultados da Pesquisa</p>
                  {MOCK_EMPLOYEES.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                    <div 
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="p-5 bg-white border border-slate-100 rounded-[24px] flex items-center justify-between group hover:border-emerald-900 hover:shadow-lg hover:shadow-emerald-900/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{emp.name}</h4>
                          <p className="text-xs text-slate-500">{emp.currentPosition} • {emp.department}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-900 transition-colors">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Visual Transition UX */}
                <div className="flex items-center justify-center gap-6 relative">
                  {/* Current Card */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 p-6 bg-slate-50 border border-slate-200 rounded-[32px] relative"
                  >
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-full">Cargo Atual</span>
                    <h4 className="text-lg font-black text-slate-900 mt-2">{selectedEmployee?.currentPosition}</h4>
                    <p className="text-sm text-slate-500">{selectedEmployee?.department}</p>
                    <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-tighter">Remuneração</p>
                    <p className="text-sm font-black text-slate-700">{selectedEmployee?.salary}</p>
                  </motion.div>

                  {/* Transition Arrow */}
                  <div className="w-12 h-12 bg-emerald-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 z-10 shrink-0">
                    <span className="material-symbols-outlined">trending_flat</span>
                  </div>

                  {/* New Selection Card */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex-1 p-6 border-2 rounded-[32px] relative transition-all ${
                      newPositionId ? 'border-emerald-900 bg-emerald-50/50 shadow-xl shadow-emerald-900/5' : 'border-dashed border-slate-200 bg-white'
                    }`}
                  >
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-emerald-900 text-white text-[10px] font-black uppercase rounded-full">Novo Cargo</span>
                    {newPositionId ? (
                      <div>
                        <h4 className="text-lg font-black text-emerald-900 mt-2">
                          {MOCK_POSITIONS.find(p => p.id === newPositionId)?.name}
                        </h4>
                        <p className="text-sm text-emerald-700/60 font-bold uppercase tracking-widest">
                          Nível {MOCK_POSITIONS.find(p => p.id === newPositionId)?.level}
                        </p>
                        <div className="mt-4 pt-4 border-t border-emerald-900/10">
                          <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">Nova Faixa Salarial</p>
                          <input 
                            type="text" 
                            placeholder="R$ 0,00"
                            className="w-full bg-transparent border-none p-0 text-lg font-black text-emerald-900 outline-none placeholder:text-emerald-900/20"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 py-6">
                        <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Selecione o destino</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Position Selection List */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargos Disponíveis para Promoção/Transferência</p>
                  <div className="grid grid-cols-2 gap-4">
                    {MOCK_POSITIONS.map(pos => (
                      <div 
                        key={pos.id}
                        onClick={() => setNewPositionId(pos.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          newPositionId === pos.id ? 'border-emerald-900 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-300'
                        }`}
                      >
                        <h5 className="text-sm font-bold text-slate-900">{pos.name}</h5>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{pos.level}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Motivo da Alteração</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium appearance-none">
                    <option>Promoção Vertical</option>
                    <option>Transferência Lateral</option>
                    <option>Ajuste de Mercado</option>
                    <option>Mérito</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {step === 2 ? (
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Trocar Colaborador
              </button>
            ) : <div />}
            
            <div className="flex items-center gap-4">
              <button
                onClick={reset}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button
                className="px-8 py-3 bg-emerald-900 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={step === 1 || !newPositionId}
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangePositionModal;
