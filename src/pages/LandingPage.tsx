import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logo-completo.png';
import logoDark from '../assets/logo-completo-dark.png';

interface ModuleFeature {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  highlights: string[];
  badge: string;
}

const MODULES: ModuleFeature[] = [
  {
    id: 'contracts',
    name: 'Contratos & Locações',
    icon: 'contract',
    badge: 'Core Operacional',
    tagline: 'Ciclo completo de locação com segurança jurídica e automação financeira.',
    description:
      'Emita faturas de locação parametrizadas, calcule automaticamente custos de locação, seguro, RCD, fretes, terceiros e treinamentos operacionais. Gere contratos em PDF de padrão formal, acompanhe devoluções e mantenha conciliação bancária precisa.',
    highlights: [
      'Geração de contratos em PDF formal com snapshot imutável',
      'Cálculo automatizado de seguro, RCD, frete e custos extras',
      'Controle de prazos de vigência, prorrogações e devoluções',
      'Conciliação bancária integrada e relatórios de faturamento'
    ]
  },
  {
    id: 'crm',
    name: 'CRM & Pipeline Comercial',
    icon: 'monitoring',
    badge: 'Vendas & Negociações',
    tagline: 'Funil de vendas visual para fechar mais contratos em menos tempo.',
    description:
      'Gerencie leads desde a primeira abordagem até o fechamento. Pipeline no modelo Kanban com etapas customizadas, histórico unificado de interações, agenda de tarefas com lembretes e conversão imediata de oportunidade em contrato.',
    highlights: [
      'Funil Kanban com arrastar e soltar (Drag & Drop)',
      'Qualificação de leads e conversão ágil em clientes',
      'Agenda de tarefas, reuniões e follow-ups comerciais',
      'Preenchimento assistido de formulário de proposta/contrato'
    ]
  },
  {
    id: 'fleet',
    name: 'Gestão de Frotas & Equipamentos',
    icon: 'precision_manufacturing',
    badge: 'Ativos & Disponibilidade',
    tagline: 'Controle total de plataformas elevatórias e máquinas industriais.',
    description:
      'Rastreabilidade total por número de patrimônio e número de série. Acompanhe disponibilidade em tempo real (Disponível, Locado, Em Manutenção, Inativo), horímetro, ano, modelo e histórico consolidado de cada ativo.',
    highlights: [
      'Foco em plataformas tesoura, articuladas, telescópicas e industriais',
      'Rastreabilidade por patrimônio, chassi e horímetro/hodômetro',
      'Galeria de fotos do equipamento e histórico operacional',
      'Status em tempo real sincronizado com locações e ordens de serviço'
    ]
  },
  {
    id: 'maintenance',
    name: 'Manutenções & Materiais',
    icon: 'build',
    badge: 'Oficina & Peças',
    tagline: 'Ordens de Serviço preventivas e corretivas com baixa de estoque.',
    description:
      'Elimine paradas não programadas com planos de manutenção preventiva e gestão de ordens de serviço corretivas. Controle de estoque de peças de reposição com Part Number, alerta de estoque mínimo e baixa automática vinculada à OS.',
    highlights: [
      'Abertura de OS preventiva, corretiva e de inspeção técnica',
      'Registro detalhado de entrada (avarias, fotos e condições)',
      'Catálogo de peças e baixa automática de estoque por OS',
      'Alerta visual inteligente de estoque mínimo e custo de peças'
    ]
  },
  {
    id: 'logistics',
    name: 'Logística & Triagem',
    icon: 'local_shipping',
    badge: 'Expedição & Pátio',
    tagline: 'Da assinatura do contrato à entrega e vistoria na obra do cliente.',
    description:
      'Fluxo de triagem estruturado pós-assinatura de contrato. Vistorias de saída e de retorno, checklist de expedição, conferência de acessórios e encaminhamento direto para faturamento após liberação.',
    highlights: [
      'Triagem inteligente para liberação de equipamentos locados',
      'Checklist de expedição e vistoria técnica de entrega/devolução',
      'Controle de freteiros, motoristas e rotas de entrega',
      'Integração direta com o módulo de faturamento'
    ]
  },
  {
    id: 'hr',
    name: 'RH & Departamento Pessoal',
    icon: 'badge',
    badge: 'Pessoas & Conformidade',
    tagline: 'Ponto digital, gestão de EPIs, NRs e crachás de integração em obras.',
    description:
      'Módulo especializado para o setor industrial e de locação. Controle de Ponto Digital seguro, acompanhamento de entrega e validade de EPIs, gestão de treinamentos obrigatórios (NR-11, NR-12, NR-18, NR-35) e controle de crachás de integração em clientes/obras.',
    highlights: [
      'Ponto Digital (Clock-in) com geolocalização e registro seguro',
      'Ficha de EPIs com controle de validade e termos de entrega',
      'Matriz de treinamentos e certificações obrigatórias de NRs',
      'Controle de crachás de acesso e integrações ativas em obras/clientes'
    ]
  },
  {
    id: 'finance',
    name: 'Financeiro & Conciliação',
    icon: 'attach_money',
    badge: 'Controle de Caixa',
    tagline: 'Faturamento assertivo, conciliação e previsibilidade financeira.',
    description:
      'Extrato financeiro com visão analítica de receitas, faturas vencidas, inadimplência e controle de score de clientes. Exportação de dados para planilhas e relatórios para a diretoria.',
    highlights: [
      'Extrato consolidado de faturamento e previsibilidade de caixa',
      'Conciliação bancária inteligente por fatura de locação',
      'Score de crédito e histórico financeiro de clientes',
      'Exportação de relatórios analíticos em formato XLSX / Excel'
    ]
  },
  {
    id: 'security',
    name: 'Segurança & Governança',
    icon: 'verified_user',
    badge: 'Nuvem & RLS',
    tagline: 'Permissões granulares por cargo e auditoria em nuvem de alta segurança.',
    description:
      'Controle de acesso rigoroso baseado em papéis (Administrador, Diretoria, Gerente, Comercial, Manutenção, RH, Logística). Criptografia ponta a ponta e auditoria completa de alterações.',
    highlights: [
      'Controle de acesso granular baseado em perfis (RBAC)',
      'Políticas de segurança em nível de linha de dados (Supabase RLS)',
      'Primeiro acesso com validação de e-mail corporativo',
      'Backup contínuo e infraestrutura em nuvem de alta disponibilidade'
    ]
  }
];

const INTEGRATIONS = [
  {
    name: 'Supabase Cloud',
    category: 'Banco de Dados & Storage',
    icon: 'database',
    description: 'PostgreSQL corporativo de alta performance com segurança RLS e armazenamento escalável de arquivos e fotos.'
  },
  {
    name: 'WhatsApp Business',
    category: 'Comunicação',
    icon: 'chat',
    description: 'Envio de propostas, avisos de vencimento de contratos, alertas operacionais e contato ágil com o locatário.'
  },
  {
    name: 'Geração & Assinatura de PDF',
    category: 'Documentos',
    icon: 'picture_as_pdf',
    description: 'Contratos e fichas de ordens de serviço gerados em PDF de alta qualidade com snapshots imutáveis.'
  },
  {
    name: 'Exportação XLSX / Excel',
    category: 'Business Intelligence',
    icon: 'table_view',
    description: 'Relatórios consolidados de faturamento, frotas e manutenções prontos para contabilidade e diretoria.'
  },
  {
    name: 'Consulta de CNPJ / Receita',
    category: 'Validação Cadastral',
    icon: 'domain',
    description: 'Preenchimento automatizado de dados cadastrais e validação instantânea de clientes industriais.'
  },
  {
    name: 'PWA Mobile & Tablet',
    category: 'Acesso em Campo',
    icon: 'smartphone',
    description: 'Instale o ERP diretamente no smartphone ou tablet dos técnicos, motoristas e equipe de pátio.'
  },
  {
    name: 'Integrações de Obras & NRs',
    category: 'Conformidade Industrial',
    icon: 'safety_check',
    description: 'Gestão de liberações de portaria, ASOs, NRs e crachás para entrada em grandes complexos industriais.'
  },
  {
    name: 'Segurança & RBAC',
    category: 'Governança',
    icon: 'lock',
    description: 'Autenticação segura via tokens JWT com níveis de permissão restritos por departamento.'
  }
];

const TIMELINE_STEPS = [
  {
    step: '01',
    days: 'Dias 1 a 3',
    title: 'Diagnóstico & Parametrização',
    description:
      'Mapeamento dos processos da sua locadora, configuração das regras de faturamento, dados cadastrais da empresa e estrutura de usuários/cargos.',
    icon: 'settings_suggest'
  },
  {
    step: '02',
    days: 'Dias 4 a 7',
    title: 'Importação & Migração de Dados',
    description:
      'Carga assistida de sua base de clientes, catálogo de equipamentos com patrimônios/especificações e estoque de peças de manutenção.',
    icon: 'cloud_upload'
  },
  {
    step: '03',
    days: 'Dias 8 a 11',
    title: 'Treinamento Prático das Equipes',
    description:
      'Capacitação segmentada para a equipe comercial (CRM/Contratos), pátio/oficina (Manutenção/Logística) e administrativo (Financeiro/RH).',
    icon: 'school'
  },
  {
    step: '04',
    days: 'Dias 12 a 14',
    title: 'Go-Live & Suporte Assistido',
    description:
      'Virada do sistema em produção com acompanhamento diário de especialistas para garantir uma transição suave e sem ruídos operacionais.',
    icon: 'rocket_launch'
  }
];

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Para frotas em início',
    featured: false,
    fleetLimit: 'Até 30 equipamentos',
    monthlyPrice: 590,
    setupPrice: 1500,
    description: 'Ideal para locadoras regionais que buscam profissionalizar contratos e controle de frota.',
    features: [
      'Até 3 usuários simultâneos',
      'Gestão completa de Contratos & Faturas',
      'Controle de Frota & Patrimônios',
      'CRM & Gestão de Leads básica',
      'Ordens de Serviço de Manutenção',
      'Geração de Contratos em PDF',
      'Suporte via e-mail e ticket (horário comercial)'
    ]
  },
  {
    id: 'pro',
    name: 'Profissional',
    badge: 'Mais Escolhido',
    featured: true,
    fleetLimit: 'Até 100 equipamentos',
    monthlyPrice: 1190,
    setupPrice: 2400,
    description: 'A solução mais completa para locadoras em expansão que exigem máxima eficiência operacional.',
    features: [
      'Até 10 usuários simultâneos',
      'Todos os recursos do Starter',
      'CRM Avançado com Funil Kanban completo',
      'Módulo de Logística & Triagem de Pátio',
      'Estoque de Peças com baixa automática por OS',
      'Conciliação Bancária & Faturamento Inteligente',
      'App PWA para técnicos e equipe de campo',
      'Exportação avançada em XLSX / BI',
      'Suporte prioritário via WhatsApp e Telefone'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Grandes Frotas & Filiais',
    featured: false,
    fleetLimit: 'Equipamentos Ilimitados',
    monthlyPrice: 2490,
    setupPrice: 3900,
    description: 'Para empresas com múltiplas filiais, grandes frotas e exigências rigorosas de compliance e RH.',
    features: [
      'Usuários e acessos ilimitados',
      'Todos os recursos do Plano Profissional',
      'Módulo RH Completo (Ponto Digital, EPIs, NRs)',
      'Controle de Integrações e Crachás de Obras',
      'Migração assistida de bancos de dados legados',
      'Consultor de implantação dedicado',
      'SLA de 99.9% com suporte 24/7',
      'Treinamentos ilimitados para novas contratações'
    ]
  }
];

const FAQS = [
  {
    q: 'Quanto tempo leva para colocar o RentDesk em funcionamento na minha locadora?',
    a: 'Nosso processo de implantação express leva entre 7 e 14 dias corridos. Durante esse período realizamos o diagnóstico, a importação dos seus equipamentos e clientes, o treinamento dos colaboradores e o acompanhamento do go-live.'
  },
  {
    q: 'Como é feita a migração dos dados que já tenho em planilhas ou em outro sistema?',
    a: 'Nossa equipe técnica disponibiliza modelos simples de planilhas para importação e auxilia em todo o tratamento e migração dos dados de equipamentos, patrimônios, clientes e histórico.'
  },
  {
    q: 'O sistema funciona em celulares e tablets na oficina ou na obra?',
    a: 'Sim! O RentDesk é construído com tecnologia PWA (Progressive Web App) e design 100% responsivo. Seus mecânicos e motoristas podem acessar o sistema diretamente pelo celular ou tablet para abrir ordens de serviço, registrar pontos e realizar vistorias.'
  },
  {
    q: 'Existe contrato de fidelidade ou multa de cancelamento?',
    a: 'Não cobramos multas rescisórias abusivas. Acreditamos na qualidade e no retorno real que o software entrega para a sua operação no dia a dia.'
  },
  {
    q: 'Meus dados ficam seguros na nuvem?',
    a: 'Totalmente. Utilizamos infraestrutura Supabase Cloud com PostgreSQL criptografado, políticas rigorosas de Row Level Security (RLS), backups diários automatizados e certificações internacionais de segurança.'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [activeModule, setActiveModule] = useState<string>(MODULES[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    fleetSize: '30-100',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Simulação de envio com feedback visual imediato
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 800);
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Olá! Tenho interesse no ERP RentDesk / C3LOC para locação de equipamentos. Gostaria de agendar uma demonstração.`
    );
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
  };

  const currentModuleData = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-mustard-500 selection:text-white antialiased overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-mustard-500/15 via-emerald-500/10 to-transparent blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-mustard-500/10 blur-[140px] rounded-full opacity-40" />
        <div className="absolute top-[70%] -right-40 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full opacity-40" />
      </div>

      {/* ===================== NAVBAR ===================== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="C3LOC ERP"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#modulos" className="hover:text-mustard-400 transition-colors">
              Módulos
            </a>
            <a href="#integracoes" className="hover:text-mustard-400 transition-colors">
              Integrações
            </a>
            <a href="#implantacao" className="hover:text-mustard-400 transition-colors">
              Implantação
            </a>
            <a href="#precos" className="hover:text-mustard-400 transition-colors">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-mustard-400 transition-colors">
              FAQ
            </a>
            <a href="#contato" className="hover:text-mustard-400 transition-colors">
              Contato
            </a>
          </nav>

          {/* Action buttons (Theme Toggle + Login) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              title="Alternar Tema"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-mustard-500 to-mustard-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-mustard-500/25 hover:shadow-mustard-500/40 hover:from-mustard-400 hover:to-mustard-500 active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Acessar Sistema
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative z-10 pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-mustard-500/30 bg-mustard-500/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-mustard-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-mustard-300 uppercase tracking-widest">
                ERP Especializado para Locadoras de Equipamentos
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
            >
              O controle absoluto da sua{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mustard-400 via-amber-300 to-mustard-500">
                frota de locação
              </span>{' '}
              em uma única plataforma.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto"
            >
              Elimine planilhas manuais, faturas perdidas e paradas inesperadas. Integre{' '}
              <strong className="text-white font-semibold">Contratos</strong>,{' '}
              <strong className="text-white font-semibold">CRM Comercial</strong>,{' '}
              <strong className="text-white font-semibold">Manutenção</strong>,{' '}
              <strong className="text-white font-semibold">Logística</strong>,{' '}
              <strong className="text-white font-semibold">RH & NRs</strong> e{' '}
              <strong className="text-white font-semibold">Financeiro</strong> com máxima segurança na nuvem.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="#contato"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-mustard-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-mustard-500/25 hover:bg-mustard-600 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                Agendar Demonstração Gratuita
              </a>
              <a
                href="#modulos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-sm uppercase tracking-wider transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">view_quilt</span>
                Conhecer Módulos
              </a>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-800/80"
            >
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-3xl sm:text-4xl font-black text-mustard-400">+40%</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Produtividade Operacional</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-3xl sm:text-4xl font-black text-white">100%</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Rastreabilidade de Frota</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-3xl sm:text-4xl font-black text-mustard-400">7 a 14</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Dias para Implantação</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">Zero</p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Faturas Esquecidas</p>
              </div>
            </motion.div>
          </div>

          {/* Interactive Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-slate-900/40 border border-slate-700/50 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">c3loc.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sistema em Tempo Real
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Frota Ativa</span>
                    <span className="material-symbols-outlined text-mustard-400">precision_manufacturing</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">84 / 92 Equipamentos</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">91.3% taxa de ocupação</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faturamento Vigente</span>
                    <span className="material-symbols-outlined text-emerald-400">trending_up</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">R$ 284.500,00</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">+14.2% em relação ao mês anterior</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Manutenções & OS</span>
                    <span className="material-symbols-outlined text-amber-400">build</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">3 Preventivas em Dia</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">0 paradas críticas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== MÓDULOS SECTION ===================== */}
      <section id="modulos" className="relative z-10 py-24 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-mustard-400 bg-mustard-500/10 border border-mustard-500/20 px-3.5 py-1.5 rounded-full">
              Módulos Especializados
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              Cada setor da sua locadora em perfeita sincronia.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Do primeiro contato comercial à devolução técnica do equipamento, conte com ferramentas feitas sob medida
              para as demandas do setor.
            </p>
          </div>

          {/* Module Selector & Showcase */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Module Buttons Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {MODULES.map((mod) => {
                const isActive = mod.id === activeModule;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-mustard-500/15 border-mustard-500/50 text-white shadow-lg shadow-mustard-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-mustard-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{mod.icon}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{mod.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{mod.badge}</p>
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        isActive ? 'text-mustard-400 translate-x-1' : 'text-slate-600'
                      }`}
                    >
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Module Details Card */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentModuleData.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-mustard-500/20 text-mustard-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px]">{currentModuleData.icon}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-mustard-400 uppercase tracking-widest">
                          {currentModuleData.badge}
                        </span>
                        <h3 className="text-2xl font-black text-white">{currentModuleData.name}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-slate-300 font-semibold mt-6">{currentModuleData.tagline}</p>
                  <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                    {currentModuleData.description}
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                      Destaques e Recursos Incluídos:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentModuleData.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                        >
                          <span className="material-symbols-outlined text-mustard-400 text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span className="text-xs sm:text-sm text-slate-300 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800">
                    <a
                      href="#contato"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-mustard-400 hover:text-mustard-300 transition-colors"
                    >
                      Solicitar demonstração deste módulo
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTEGRAÇÕES SECTION ===================== */}
      <section id="integracoes" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              Ecossistema Conectado
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              Tecnologia moderna e integrações essenciais.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Conectamos seu ERP aos serviços mais confiáveis para garantir agilidade operacional, mobilidade e
              segurança.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INTEGRATIONS.map((intg, index) => (
              <motion.div
                key={intg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-mustard-500/40 hover:bg-slate-900 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-mustard-400 group-hover:bg-mustard-500 group-hover:text-white flex items-center justify-center transition-all duration-300 mb-5">
                  <span className="material-symbols-outlined text-[26px]">{intg.icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-mustard-400">
                  {intg.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 group-hover:text-mustard-300 transition-colors">
                  {intg.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">{intg.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== IMPLANTAÇÃO SECTION ===================== */}
      <section id="implantacao" className="relative z-10 py-24 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-mustard-400 bg-mustard-500/10 border border-mustard-500/20 px-3.5 py-1.5 rounded-full">
              Onboarding Ágil
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              Implantação completa em 7 a 14 dias.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Metodologia estruturada sem meses de espera ou interrupções traumáticas na sua operação diária.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIMELINE_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-mustard-500/40 font-mono">{step.step}</span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-mustard-500/10 text-mustard-400 border border-mustard-500/20">
                      {step.days}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-mustard-400 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">{step.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Etapa Garantida
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PREÇOS SECTION ===================== */}
      <section id="precos" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-mustard-400 bg-mustard-500/10 border border-mustard-500/20 px-3.5 py-1.5 rounded-full">
              Transparência Total
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              Planos dimensionados para o tamanho da sua locadora.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Mensalidades justas e custo de implantação transparente. Escolha o plano ideal para a sua frota.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                  plan.featured
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-mustard-500 shadow-2xl shadow-mustard-500/10 lg:-translate-y-4'
                    : 'bg-slate-900/70 border border-slate-800'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-mustard-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-widest shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    {!plan.featured && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded-lg">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 mt-2">{plan.description}</p>

                  {/* Fleet limit badge */}
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-mustard-300">
                    <span className="material-symbols-outlined text-[16px]">precision_manufacturing</span>
                    {plan.fleetLimit}
                  </div>

                  {/* Prices breakdown */}
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-bold">R$</span>
                      <span className="text-4xl sm:text-5xl font-black text-white">{plan.monthlyPrice}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ mês</span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Custo de Implantação:</span>
                      <span className="text-xs font-bold text-mustard-400">R$ {plan.setupPrice.toLocaleString('pt-BR')} (taxa única)</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="mt-8 space-y-3.5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Incluso no plano:</p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <span className="material-symbols-outlined text-mustard-400 text-[18px] shrink-0 mt-0.5">
                          check
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <a
                    href="#contato"
                    className={`w-full py-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      plan.featured
                        ? 'bg-mustard-500 text-white hover:bg-mustard-600 shadow-xl shadow-mustard-500/25 active:scale-95'
                        : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
                    }`}
                  >
                    Escolher Plano {plan.name}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section id="faq" className="relative z-10 py-24 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-mustard-400 bg-mustard-500/10 border border-mustard-500/20 px-3.5 py-1.5 rounded-full">
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              Perguntas e Respostas
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Tudo o que você precisa saber antes de transformar a gestão da sua locadora.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-base sm:text-lg font-bold text-white">{faq.q}</span>
                    <span
                      className={`material-symbols-outlined text-mustard-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-2 text-sm sm:text-base text-slate-400 leading-relaxed border-t border-slate-800/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CONTATO / LEAD CAPTURE SECTION ===================== */}
      <section id="contato" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Contact Info Column */}
            <div className="lg:col-span-5">
              <span className="text-xs font-black uppercase tracking-widest text-mustard-400 bg-mustard-500/10 border border-mustard-500/20 px-3.5 py-1.5 rounded-full">
                Fale Conosco
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
                Pronto para acelerar a sua locadora?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
                Preencha o formulário para agendar uma demonstração guiada e personalizada com nossos especialistas em
                locação de equipamentos industriais.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-mustard-500/20 text-mustard-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Atendimento Comercial</p>
                    <p className="text-sm sm:text-base font-bold text-white">comercial@rentdesk.com.br</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">WhatsApp Comercial</p>
                    <button
                      onClick={handleWhatsAppContact}
                      className="text-sm sm:text-base font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      (11) 99999-9999
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                {formSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">Solicitação Recebida com Sucesso!</h3>
                    <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md mx-auto">
                      Obrigado pelo contato! Nossa equipe de especialistas entrará em contato em até 2 horas úteis para
                      agendar sua demonstração.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-8 px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-700 transition-colors"
                    >
                      Enviar Outra Mensagem
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <h3 className="text-xl font-bold text-white mb-2">Agende sua Demonstração</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Seu Nome
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Carlos Silva"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Nome da Empresa / Locadora
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Ex: AlugaForte Equipamentos"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          E-mail Corporativo
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="carlos@alugaforte.com.br"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(11) 98888-7777"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tamanho da Frota Atual
                      </label>
                      <select
                        value={formData.fleetSize}
                        onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                      >
                        <option value="1-30">Até 30 Equipamentos</option>
                        <option value="30-100">30 a 100 Equipamentos</option>
                        <option value="100-300">100 a 300 Equipamentos</option>
                        <option value="300+">Mais de 300 Equipamentos</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mensagem / Principais Necessidades (Opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Ex: Gostaria de saber mais sobre a geração de contratos e controle de manutenção preventiva."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-mustard-500 focus:ring-1 focus:ring-mustard-500 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-4 rounded-2xl bg-mustard-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-mustard-600 active:scale-95 transition-all shadow-xl shadow-mustard-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {formLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">send</span>
                          Enviar Solicitação de Demonstração
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={logoDark} alt="C3LOC ERP" className="h-8 w-auto object-contain opacity-80" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} C3LOC / RentDesk ERP. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#modulos" className="hover:text-mustard-400 transition-colors">
              Módulos
            </a>
            <a href="#precos" className="hover:text-mustard-400 transition-colors">
              Planos
            </a>
            <a href="#contato" className="hover:text-mustard-400 transition-colors">
              Contato
            </a>
            <button onClick={() => navigate('/login')} className="text-mustard-400 hover:underline font-bold">
              Área do Cliente (Login)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
