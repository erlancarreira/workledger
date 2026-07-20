import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toBlob, toPng } from 'html-to-image';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  Coins,
  Copy,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Hourglass,
  Github,
  Link2,
  LayoutDashboard,
  LogOut,
  Plus,
  Printer,
  ReceiptText,
  Save,
  Send,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  WalletCards,
  Zap,
  X
} from 'lucide-react';
import './tailwind.css';

const messages = {
  pt: {
    appName: 'WorkLedger',
    eyebrow: 'Controle financeiro por hora',
    title: 'WorkLedger',
    subtitle: 'Registre horas, débitos, créditos, pagamentos e saldos transferidos com clareza operacional.',
    language: 'Idioma',
    defaultRate: 'Hora padrão',
    defaultClient: 'Cliente padrão',
    open: 'Em aberto',
    paid: 'Pago',
    transferred: 'Transferido',
    paidTotal: 'Pago',
    workedHours: 'Horas lançadas',
    nextService: 'Para o próximo serviço',
    newService: 'Novo serviço',
    optionalTitle: 'O título é opcional; sem título, será usada a data.',
    titleField: 'Título',
    client: 'Cliente',
    noClient: 'Sem cliente',
    date: 'Data',
    time: 'Hora',
    currency: 'Moeda',
    billingModel: 'Modelo de cobrança',
    billingHourly: 'Por hora',
    billingDaily: 'Por diária',
    billingFixed: 'Valor fixo',
    dailyRate: 'Valor da diária',
    fixedAmount: 'Valor fixo',
    daysWorked: 'Diárias contabilizadas',
    dailySubtotal: 'Subtotal de diárias',
    includedInFixed: 'Incluído no valor fixo',
    initialDiscount: 'Ajuste inicial',
    adjustmentType: 'Tipo de ajuste',
    addAdjustment: 'Adicionar débito ou crédito',
    editAdjustment: 'Editar ajuste',
    adjustmentAmount: 'Valor do ajuste',
    saveAdjustment: 'Salvar ajuste',
    removeAdjustment: 'Remover ajuste',
    adjustmentHelp: 'Use somente quando houver um valor adicional ou um crédito para o cliente.',
    discountOption: 'Crédito — reduz o total',
    surchargeOption: 'Débito — aumenta o total',
    notes: 'Observações',
    serviceNotesPlaceholder: 'Detalhes importantes do serviço',
    clientNamePlaceholder: 'Nome do cliente',
    clientNotesPlaceholder: 'Contato, contrato ou referência',
    createService: 'Criar serviço',
    clients: 'Clientes',
    clientsHelp: 'Cadastre, edite e relacione clientes aos serviços.',
    clientPortal: 'Portal do cliente',
    copyPortalLink: 'Gerar e copiar link',
    portalLinkCopied: 'Link do cliente copiado.',
    portalTitle: 'Histórico financeiro',
    portalSubtitle: 'Acompanhe serviços, pagamentos e valores em aberto.',
    amountBilled: 'Total cobrado',
    amountPaid: 'Total pago',
    amountOutstanding: 'Saldo em aberto',
    paymentHistory: 'Histórico de pagamentos',
    workHistory: 'Jornadas registradas',
    financialComposition: 'Composição do valor',
    portalUpdated: 'Posição financeira consolidada',
    name: 'Nome',
    addClient: 'Adicionar cliente',
    saveClient: 'Salvar cliente',
    cancel: 'Cancelar',
    noNotes: 'Sem observações',
    noClients: 'Nenhum cliente cadastrado.',
    services: 'Serviços',
    record: 'registro',
    records: 'registros',
    noServices: 'Nenhum serviço cadastrado.',
    editService: 'Editar serviço',
    delete: 'Excluir',
    receipt: 'Recibo',
    print: 'Imprimir',
    copyText: 'Copiar texto',
    copyImage: 'Copiar imagem',
    downloadImage: 'Baixar imagem',
    imageCopied: 'Imagem copiada.',
    whatsapp: 'WhatsApp',
    receiptTitle: 'Comprovante de serviço',
    receiptCopied: 'Texto do recibo copiado.',
    issuedAt: 'Emitido em',
    subtotal: 'Subtotal',
    total: 'Total',
    gross: 'Bruto',
    discount: 'Crédito',
    surcharge: 'Débito',
    balance: 'Saldo',
    serviceData: 'Dados do serviço',
    hourlyRate: 'Valor da hora',
    save: 'Salvar',
    logHours: 'Lançar horas',
    add: 'Adicionar',
    payment: 'Baixa de pagamento',
    keepOpen: 'Manter diferença em aberto',
    transferNext: 'Transferir diferença para o próximo serviço',
    totalAmount: 'Valor total',
    settle: 'Baixar',
    serviceHours: 'Horas do serviço',
    carryoverApplied: 'Saldo anterior aplicado',
    discountApplied: 'Crédito aplicado',
    surchargeApplied: 'Débito aplicado',
    financialSummary: 'Resumo financeiro',
    hoursSubtotal: 'Subtotal de horas',
    paymentsApplied: 'Pagamentos recebidos',
    amountDue: 'Saldo em aberto',
    overview: 'Resumo',
    backToServices: 'Voltar aos serviços',
    noHours: 'Nenhuma hora lançada.',
    payments: 'Pagamentos',
    noPayments: 'Nenhum pagamento registrado.',
    deleteService: 'Excluir serviço',
    deleteWarning: 'Esta ação remove o serviço, os lançamentos de horas e os pagamentos vinculados.',
    deleteForever: 'Excluir definitivamente',
    close: 'Fechar',
    loading: 'Carregando controle de horas...',
    createFirst: 'Crie o primeiro serviço para começar.',
    service: 'Serviço',
    none: 'Nenhum',
    nextCarryover: 'O próximo serviço receberá {amount} de saldo anterior.',
    servicePlaceholder: 'Serviço {dateTime}',
    noDate: 'Sem data definida',
    at: 'às',
    createServiceError: 'Não foi possível criar o serviço.',
    editClient: 'Editar cliente',
    removeClient: 'Remover cliente',
    langPt: 'PT',
    langEn: 'EN',
    login: 'Entrar',
    register: 'Cadastrar',
    recover: 'Recuperar senha',
    logout: 'Sair',
    email: 'E-mail',
    password: 'Senha',
    newPassword: 'Nova senha',
    confirmPassword: 'Confirmar senha',
    passwordMismatch: 'As senhas não coincidem.',
    authName: 'Nome',
    loginSubtitle: 'Entre para acessar seus serviços, clientes e pagamentos.',
    registerSubtitle: 'Crie sua conta local para manter seus dados separados.',
    recoverSubtitle: 'Defina uma nova senha para o e-mail cadastrado.',
    authSwitchLogin: 'Já tenho conta',
    authSwitchRegister: 'Criar conta',
    authSwitchRecover: 'Esqueci minha senha',
    authHelp: 'Controle horas trabalhadas, clientes, serviços e pagamentos com segurança em um único painel.',
    signedAs: 'Conectado como',
    settings: 'Configurações',
    settingsHelp: 'Defina o idioma e os padrões usados nos novos serviços.',
    launchDefaults: 'Padrões de lançamento',
    launchDefaultsHelp: 'Usados como padrão ao criar um novo serviço.',
    loginAt: 'Login em',
    quickActions: 'Ações rápidas',
    recentServices: 'Serviços recentes',
    openItems: 'Principais pendências',
    financialProgress: 'Progresso financeiro',
    received: 'recebido',
    viewService: 'Abrir serviço',
    registerPayment: 'Registrar pagamento'
  },
  en: {
    appName: 'WorkLedger',
    eyebrow: 'Hourly finance control',
    title: 'WorkLedger',
    subtitle: 'Track hours, debits, credits, payments, and carried balances with operational clarity.',
    language: 'Language',
    defaultRate: 'Default rate',
    defaultClient: 'Default client',
    open: 'Open',
    paid: 'Paid',
    transferred: 'Transferred',
    paidTotal: 'Paid',
    workedHours: 'Logged hours',
    nextService: 'Next service',
    newService: 'New service',
    optionalTitle: 'The title is optional; the date will be used when empty.',
    titleField: 'Title',
    client: 'Client',
    noClient: 'No client',
    date: 'Date',
    time: 'Time',
    currency: 'Currency',
    billingModel: 'Billing model',
    billingHourly: 'Hourly',
    billingDaily: 'Daily',
    billingFixed: 'Fixed fee',
    dailyRate: 'Daily rate',
    fixedAmount: 'Fixed amount',
    daysWorked: 'Billable days',
    dailySubtotal: 'Daily subtotal',
    includedInFixed: 'Included in fixed fee',
    initialDiscount: 'Initial adjustment',
    adjustmentType: 'Adjustment type',
    addAdjustment: 'Add debit or credit',
    editAdjustment: 'Edit adjustment',
    adjustmentAmount: 'Adjustment amount',
    saveAdjustment: 'Save adjustment',
    removeAdjustment: 'Remove adjustment',
    adjustmentHelp: 'Use only for an additional charge or a credit for the client.',
    discountOption: 'Credit — reduces total',
    surchargeOption: 'Debit — increases total',
    notes: 'Notes',
    serviceNotesPlaceholder: 'Important service details',
    clientNamePlaceholder: 'Client name',
    clientNotesPlaceholder: 'Contact, contract, or reference',
    createService: 'Create service',
    clients: 'Clients',
    clientsHelp: 'Create, edit, and link clients to services.',
    clientPortal: 'Client portal',
    copyPortalLink: 'Generate and copy link',
    portalLinkCopied: 'Client link copied.',
    portalTitle: 'Financial history',
    portalSubtitle: 'Review services, payments, and outstanding balances.',
    amountBilled: 'Total billed',
    amountPaid: 'Total paid',
    amountOutstanding: 'Outstanding',
    paymentHistory: 'Payment history',
    workHistory: 'Logged work sessions',
    financialComposition: 'Amount breakdown',
    portalUpdated: 'Consolidated financial position',
    name: 'Name',
    addClient: 'Add client',
    saveClient: 'Save client',
    cancel: 'Cancel',
    noNotes: 'No notes',
    noClients: 'No clients yet.',
    services: 'Services',
    record: 'record',
    records: 'records',
    noServices: 'No services yet.',
    editService: 'Edit service',
    delete: 'Delete',
    receipt: 'Receipt',
    print: 'Print',
    copyText: 'Copy text',
    copyImage: 'Copy image',
    downloadImage: 'Download image',
    imageCopied: 'Image copied.',
    whatsapp: 'WhatsApp',
    receiptTitle: 'Service receipt',
    receiptCopied: 'Receipt text copied.',
    issuedAt: 'Issued at',
    subtotal: 'Subtotal',
    total: 'Total',
    gross: 'Gross',
    discount: 'Credit',
    surcharge: 'Debit',
    balance: 'Balance',
    serviceData: 'Service details',
    hourlyRate: 'Hourly rate',
    save: 'Save',
    logHours: 'Log hours',
    add: 'Add',
    payment: 'Payment settlement',
    keepOpen: 'Keep remaining balance open',
    transferNext: 'Transfer remaining balance to next service',
    totalAmount: 'Full amount',
    settle: 'Settle',
    serviceHours: 'Service hours',
    carryoverApplied: 'Previous balance applied',
    discountApplied: 'Credit applied',
    surchargeApplied: 'Debit applied',
    financialSummary: 'Financial summary',
    hoursSubtotal: 'Hours subtotal',
    paymentsApplied: 'Payments received',
    amountDue: 'Amount due',
    overview: 'Overview',
    backToServices: 'Back to services',
    noHours: 'No hours logged.',
    payments: 'Payments',
    noPayments: 'No payments registered.',
    deleteService: 'Delete service',
    deleteWarning: 'This removes the service, logged hours, and linked payments.',
    deleteForever: 'Delete permanently',
    close: 'Close',
    loading: 'Loading WorkLedger...',
    createFirst: 'Create the first service to start.',
    service: 'Service',
    none: 'None',
    nextCarryover: 'The next service will receive {amount} as previous balance.',
    servicePlaceholder: 'Service {dateTime}',
    noDate: 'No date set',
    at: 'at',
    createServiceError: 'Could not create the service.',
    editClient: 'Edit client',
    removeClient: 'Remove client',
    langPt: 'PT',
    langEn: 'EN',
    login: 'Sign in',
    register: 'Register',
    recover: 'Recover password',
    logout: 'Sign out',
    email: 'Email',
    password: 'Password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    passwordMismatch: 'Passwords do not match.',
    authName: 'Name',
    loginSubtitle: 'Sign in to access your services, clients, and payments.',
    registerSubtitle: 'Create a local account to keep your data separated.',
    recoverSubtitle: 'Set a new password for the registered email.',
    authSwitchLogin: 'I already have an account',
    authSwitchRegister: 'Create account',
    authSwitchRecover: 'Forgot password',
    authHelp: 'Track hours, clients, services, and payments securely from one clear dashboard.',
    signedAs: 'Signed in as',
    settings: 'Settings',
    settingsHelp: 'Choose the language and defaults used for new services.',
    launchDefaults: 'Entry defaults',
    launchDefaultsHelp: 'Used as defaults when creating a new service.',
    loginAt: 'Signed in at',
    quickActions: 'Quick actions',
    recentServices: 'Recent services',
    openItems: 'Top outstanding items',
    financialProgress: 'Financial progress',
    received: 'received',
    viewService: 'Open service',
    registerPayment: 'Record payment'
  }
};

const I18nContext = React.createContext({
  language: 'pt',
  setLanguage: () => {},
  t: (key) => key
});

function useI18n() {
  return React.useContext(I18nContext);
}

function centsToMoney(cents = 0, currency = 'BRL', language = 'pt') {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency
  }).format(cents / 100);
}

function centsToInput(cents = 0) {
  return (cents / 100).toFixed(2);
}

function normalizeMoneyInput(value) {
  const raw = String(value || '').trim();
  if (!raw) return '0.00';
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  const hasComma = cleaned.includes(',');
  const normalized = hasComma ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return '0.00';
  return amount.toFixed(2);
}

function formatMoneyInputValue(value, currency = 'BRL', language = 'pt') {
  const amount = Number(normalizeMoneyInput(value));
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatMoneyRealtime(value, currency = 'BRL', language = 'pt') {
  const digits = String(value || '').replace(/\D/g, '');
  const cents = digits ? Number(digits) : 0;
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

function moneyInputProps(value, onChange, currency, language) {
  return {
    inputMode: 'decimal',
    value,
    onChange: (event) => onChange(formatMoneyRealtime(event.target.value, currency, language)),
    onBlur: () => onChange(formatMoneyInputValue(value, currency, language))
  };
}

function minutesToLabel(minutes = 0) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}min`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}min`;
}

function billingTypeLabel(type, t) {
  return t(type === 'daily' ? 'billingDaily' : type === 'fixed' ? 'billingFixed' : 'billingHourly');
}

function billingRateLabel(type, t) {
  return t(type === 'daily' ? 'dailyRate' : type === 'fixed' ? 'fixedAmount' : 'hourlyRate');
}

function billingBaseLabel(service, t) {
  return t(service.billingType === 'daily' ? 'dailySubtotal' : service.billingType === 'fixed' ? 'fixedAmount' : 'hoursSubtotal');
}

function localDateInput(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function localTimeInput(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

function serviceScheduleLabel(service, t = (key) => key) {
  if (!service.service_date && !service.service_time) return t('noDate');
  const [year, month, day] = String(service.service_date || '').split('-');
  const date = year && month && day ? `${day}/${month}/${year}` : service.service_date;
  return [date, service.service_time].filter(Boolean).join(` ${t('at')} `);
}

function serviceDateLabel(service, t = (key) => key) {
  if (!service.service_date) return t('noDate');
  const [year, month, day] = String(service.service_date || '').split('-');
  return year && month && day ? `${day}/${month}/${year}` : service.service_date;
}

function dateTimeLabel(value, language = 'pt') {
  return new Date(value).toLocaleString(language === 'en' ? 'en-US' : 'pt-BR');
}

function clientLabel(service, t = (key) => key) {
  return service.clientName || service.client || t('noClient');
}

function currencySummary(byCurrency, key, language) {
  const currencies = ['BRL', 'USD'];
  const parts = currencies
    .map((currency) => [currency, byCurrency?.[currency]?.[key] || 0])
    .filter(([, value], index) => value > 0 || index === 0)
    .map(([currency, value]) => centsToMoney(value, currency, language));
  return parts.join(' · ');
}

function buildReceiptLines(service, t, language) {
  const moneyFor = (value) => centsToMoney(value, service.currency, language);
  const lines = [
    'WORKLEDGER',
    t('receiptTitle').toUpperCase(),
    '',
    `${t('client')}: ${clientLabel(service, t)}`,
    `${t('service')}: ${service.title}`,
    `${t('date')}: ${serviceDateLabel(service, t)}`,
    `${t('currency')}: ${service.currency}`,
    `${t('billingModel')}: ${billingTypeLabel(service.billingType, t)}`,
    `${billingRateLabel(service.billingType, t)}: ${moneyFor(service.rate_cents)}`,
    '',
    t('serviceHours').toUpperCase()
  ];

  if (service.entries.length) {
    service.entries.forEach((entry) => {
      const entryValue = Math.round((entry.minutes / 60) * service.rate_cents);
      const value = service.billingType === 'hourly' ? moneyFor(entryValue) : service.billingType === 'daily' ? t('billingDaily') : t('includedInFixed');
      lines.push(`${entry.start_time} - ${entry.end_time} | ${minutesToLabel(entry.minutes)} | ${value}`);
    });
  } else {
    lines.push(t('noHours'));
  }

  lines.push('', `${billingBaseLabel(service, t)}: ${moneyFor(service.baseCents)}`);
  if (service.carryover_cents > 0) lines.push(`${t('carryoverApplied')} (+): + ${moneyFor(service.carryover_cents)}`);
  if (service.adjustmentCents > 0) {
    const sign = service.adjustmentType === 'surcharge' ? '+' : '−';
    lines.push(`${t(service.adjustmentType === 'surcharge' ? 'surcharge' : 'discount')} (${sign}): ${sign} ${moneyFor(service.adjustmentCents)}`);
  }
  lines.push(
    `${t('amountBilled')}: ${moneyFor(service.totalCents)}`,
    `${t('paymentsApplied')} (−): − ${moneyFor(service.paidCents)}`,
    `${t('amountDue')}: ${moneyFor(service.balanceCents)}`,
    `${t('open')}: ${service.status === 'open' ? t('open') : service.status === 'paid' ? t('paid') : t('transferred')}`,
    '',
    `${t('issuedAt')}: ${dateTimeLabel(new Date(), language)}`
  );
  return lines;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a ação.');
  return data.dashboard || data;
}

function StatCard({ icon: Icon, label, value, muted, tone = 'neutral' }) {
  const toneIcon = {
    neutral: 'lg:bg-slate-100 lg:text-slate-600',
    success: 'lg:bg-emerald-50 lg:text-emerald-600',
    warning: 'lg:bg-amber-50 lg:text-amber-600'
  }[tone];
  const toneHover = {
    neutral: 'lg:hover:border-slate-300',
    success: 'lg:hover:border-emerald-300',
    warning: 'lg:hover:border-amber-300'
  }[tone];
  return (
    <section className={`stat-card tone-${tone} lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-[0_1px_2px_rgba(15,23,42,.04)] lg:transition-colors lg:duration-200 lg:after:hidden ${toneHover}`}>
      <div className={`stat-icon lg:h-9 lg:w-9 lg:rounded-lg ${toneIcon}`}><Icon size={18} /></div>
      <span className="lg:text-[13px] lg:font-medium lg:text-slate-500">{label}</span>
      <strong className={`${muted ? 'muted-value' : ''} lg:text-[1.65rem] lg:font-semibold lg:tracking-tight lg:text-slate-900`}>{value}</strong>
    </section>
  );
}

function StatusBadge({ status }) {
  const { t } = useI18n();
  const labels = { open: t('open'), paid: t('paid'), transferred: t('transferred') };
  return <span className={`badge ${status}`}>{labels[status] || status}</span>;
}

function ClientPortal({ token }) {
  const { t, language } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/public/client/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Não foi possível abrir o portal.');
        return payload;
      })
      .then(setData)
      .catch((reason) => setError(reason.message));
  }, [token]);

  if (error) return <main className="loading"><div className="error">{error}</div></main>;
  if (!data) return <main className="loading">{t('loading')}</main>;

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div>
          <div className="portal-brand"><span>WL</span><p>WorkLedger</p></div>
          <h1>{t('portalTitle')}</h1>
          <p className="subtitle">{t('portalSubtitle')}</p>
        </div>
        <div className="portal-client">
          <span>{t('client')}</span>
          <strong>{data.client.name}</strong>
        </div>
        <LanguageSwitcher />
      </header>

      <section className="portal-totals">
        {Object.entries(data.totals).map(([currency, totals]) => (
          <article className="portal-currency" key={currency}>
            <div className="portal-currency-heading"><span>{t('portalUpdated')}</span><strong>{currency}</strong></div>
            <div className="portal-kpi-grid">
              <div><span>{t('amountBilled')}</span><b>{centsToMoney(totals.totalCents, currency, language)}</b></div>
              <div><span>{t('amountPaid')}</span><b>{centsToMoney(totals.paidCents, currency, language)}</b></div>
              <div className="portal-balance"><span>{t('amountOutstanding')}</span><b>{centsToMoney(totals.balanceCents, currency, language)}</b></div>
            </div>
          </article>
        ))}
      </section>

      <section className="panel portal-history">
        <div className="section-heading"><strong>{t('services')}</strong><span>{data.services.length} {t(data.services.length === 1 ? 'record' : 'records')}</span></div>
        {data.services.map((service) => (
          <article className="portal-service" key={service.id}>
            <div className="portal-service-heading">
              <div>
                <span className="portal-service-reference">{t('service')} #{service.id}</span>
                <h2>{service.title}</h2>
                <span>{serviceDateLabel(service, t)} · {minutesToLabel(service.workedMinutes)} · {service.currency}</span>
              </div>
              <StatusBadge status={service.status} />
            </div>
            <div className="portal-service-body">
              <div className="portal-breakdown">
                <strong>{t('financialComposition')}</strong>
                <span><small>{billingBaseLabel(service, t)}</small><b>{centsToMoney(service.baseCents, service.currency, language)}</b></span>
                {service.carryover_cents > 0 ? <span><small>{t('carryoverApplied')} (+)</small><b>+ {centsToMoney(service.carryover_cents, service.currency, language)}</b></span> : null}
                {service.adjustmentCents > 0 ? (
                  <span className={service.adjustmentType === 'surcharge' ? 'portal-debit' : 'portal-credit'}>
                    <small>{t(service.adjustmentType === 'surcharge' ? 'surcharge' : 'discount')} ({service.adjustmentType === 'surcharge' ? '+' : '−'})</small>
                    <b>{service.adjustmentType === 'surcharge' ? '+' : '−'} {centsToMoney(service.adjustmentCents, service.currency, language)}</b>
                  </span>
                ) : null}
                <span className="portal-breakdown-total"><small>{t('amountBilled')}</small><b>{centsToMoney(service.totalCents, service.currency, language)}</b></span>
                <span className="portal-credit"><small>{t('paymentsApplied')} (−)</small><b>− {centsToMoney(service.paidCents, service.currency, language)}</b></span>
                <span className="portal-breakdown-balance"><small>{t('amountDue')}</small><b>{centsToMoney(service.balanceCents, service.currency, language)}</b></span>
              </div>
              <div className="portal-work">
                <strong>{t('workHistory')}</strong>
                {service.entries.length ? service.entries.map((entry) => (
                  <span key={entry.id}>
                    <span>{new Date(`${entry.work_date}T12:00:00`).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}<small>{entry.start_time}–{entry.end_time} · {minutesToLabel(entry.minutes)}</small></span>
                    <span className="portal-entry-value">
                      <b>{service.billingType === 'hourly' ? centsToMoney(Math.round((entry.minutes / 60) * service.rate_cents), service.currency, language) : billingTypeLabel(service.billingType, t)}</b>
                      <small>{service.billingType === 'hourly' ? `${minutesToLabel(entry.minutes)} × ${centsToMoney(service.rate_cents, service.currency, language)}/h` : service.billingType === 'daily' ? centsToMoney(service.rate_cents, service.currency, language) : t('includedInFixed')}</small>
                    </span>
                  </span>
                )) : <small>{t('noHours')}</small>}
              </div>
            </div>
            {service.payments.length ? (
              <div className="portal-payments">
                <strong>{t('paymentHistory')}</strong>
                {service.payments.map((payment) => (
                  <span key={payment.id}>{new Date(payment.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}<b>{centsToMoney(payment.amount_cents, service.currency, language)}</b></span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}

function App() {
  const [language, setLanguageState] = useState(() => localStorage.getItem('workledger-language') || 'pt');
  const [user, setUser] = useState(undefined);
  const [loginAt, setLoginAt] = useState(() => localStorage.getItem('workledger-login-at') || new Date().toISOString());
  const [dashboard, setDashboard] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mobileView, setMobileView] = useState('services');
  const [mobileDetail, setMobileDetail] = useState(false);
  const t = (key) => messages[language]?.[key] || messages.pt[key] || key;
  const portalToken = new URLSearchParams(window.location.search).get('client_portal');

  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    const isPrivateLink = Boolean(portalToken || new URLSearchParams(window.location.search).get('reset_token'));
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', `${window.location.origin}/social-card.png`);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', `${window.location.origin}/social-card.png`);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', isPrivateLink ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }, [language, portalToken]);

  function setLanguage(nextLanguage) {
    setLanguageState(nextLanguage);
    localStorage.setItem('workledger-language', nextLanguage);
  }

  function persistUser(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      const nextLoginAt = new Date().toISOString();
      setLoginAt(nextLoginAt);
      localStorage.setItem('workledger-login-at', nextLoginAt);
    } else {
      localStorage.removeItem('workledger-login-at');
      setDashboard(null);
      setSelectedId(null);
    }
  }

  useEffect(() => {
    localStorage.removeItem('workledger-user');
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  if (portalToken) {
    return (
      <I18nContext.Provider value={{ language, setLanguage, t }}>
        <ClientPortal token={portalToken} />
      </I18nContext.Provider>
    );
  }

  const selected = useMemo(() => {
    if (!dashboard?.services?.length) return null;
    return dashboard.services.find((service) => service.id === selectedId) || dashboard.services[0];
  }, [dashboard, selectedId]);

  async function refresh() {
    const data = await api('/api/dashboard');
    setDashboard(data);
    if (!selectedId && data.services[0]) setSelectedId(data.services[0].id);
  }

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      const data = await action();
      setDashboard(data);
      const exists = data.services.some((service) => service.id === selectedId);
      if (!exists && data.services[0]) setSelectedId(data.services[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (user) refresh().catch((err) => setError(err.message));
  }, [user?.id]);

  useEffect(() => {
    if (user && !localStorage.getItem('workledger-login-at')) {
      localStorage.setItem('workledger-login-at', loginAt);
    }
  }, [user?.id, loginAt]);

  useEffect(() => {
    const installationId = new URLSearchParams(window.location.search).get('github_installation_id');
    const connected = new URLSearchParams(window.location.search).get('github_connected');
    const githubError = new URLSearchParams(window.location.search).get('github_error');
    if (!user) return;
    if (githubError) {
      window.history.replaceState({}, '', window.location.pathname);
      setError('Não foi possível conectar sua conta do GitHub. Tente novamente.');
      return;
    }
    if (connected !== null) {
      window.history.replaceState({}, '', window.location.pathname);
      setError(`GitHub conectado: ${connected} repositório(s) disponível(is).`);
      refresh().catch((err) => setError(err.message));
      return;
    }
    if (!installationId) return;
    api('/api/github/installations/attach', { method: 'POST', body: JSON.stringify({ installationId: Number(installationId) }) })
      .then((result) => {
        window.history.replaceState({}, '', window.location.pathname);
        setError(`GitHub conectado: ${result.repositoryCount} repositório(s) disponível(is).`);
        return refresh();
      })
      .catch((err) => setError(err.message));
  }, [user?.id]);

  if (user === undefined) {
    return <main className="loading">{t('loading')}</main>;
  }

  if (!user) {
    return (
      <I18nContext.Provider value={{ language, setLanguage, t }}>
        <AuthScreen onAuth={persistUser} />
      </I18nContext.Provider>
    );
  }

  if (!dashboard) {
    return <main className="loading">{t('loading')}</main>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
    <div className="min-h-screen lg:flex">
      <NavRail t={t} activeView={mobileView} onSelectView={(view) => { setMobileView(view); setMobileDetail(false); }} />
      <main className="app-shell flex min-h-screen flex-col lg:flex-1 lg:min-w-0 lg:px-10 lg:py-8 xl:px-14">
      <AppHeader t={t} onLogout={() => api('/api/auth/logout', { method: 'POST' }).finally(() => persistUser(null))} />

      {error ? <div className="error">{error}</div> : null}

      <section className={`stats-grid mobile-pane ${mobileView === 'overview' ? 'mobile-active' : ''}`}>
        <StatCard tone="neutral" icon={ReceiptText} label={t('amountBilled')} value={currencySummary(dashboard.totals.byCurrency, 'totalCents', language)} />
        <StatCard tone="success" icon={Banknote} label={t('amountPaid')} value={currencySummary(dashboard.totals.byCurrency, 'paidCents', language)} />
        <StatCard tone="warning" icon={WalletCards} label={t('amountOutstanding')} value={currencySummary(dashboard.totals.byCurrency, 'openCents', language)} />
        <StatCard tone="neutral" icon={Clock3} label={t('workedHours')} value={minutesToLabel(dashboard.totals.workedMinutes)} />
      </section>
      <section className={`settings-panel mobile-pane ${mobileView === 'settings' ? 'mobile-active' : ''}`} aria-label={t('settings')}>
        <div className="panel settings-language-panel">
          <div className="preferences-heading">
            <span>{t('settings')}</span>
            <small>{t('settingsHelp')}</small>
          </div>
          <label className="settings-language-field">
            <span>{t('language')}</span>
            <LanguageSwitcher />
          </label>
        </div>
        <section className="workspace-preferences" aria-label="Preferências de lançamento">
        <div className="preferences-heading">
          <span>{t('launchDefaults')}</span>
          <small>{t('launchDefaultsHelp')}</small>
        </div>
        <div className="preferences-core">
          <DefaultClientEditor dashboard={dashboard} run={run} busy={busy} />
          <RateEditor dashboard={dashboard} run={run} busy={busy} />
        </div>
        <GithubDefaultRepositoryEditor dashboard={dashboard} run={run} busy={busy} />
        </section>
      </section>
      {dashboard.settings.pending_carryover_cents > 0 ? (
        <div className={`carryover-notice mobile-pane ${mobileView === 'overview' ? 'mobile-active' : ''}`}>
          <Hourglass size={16} />
          <span>{t('nextService')}</span>
          <strong>{centsToMoney(dashboard.settings.pending_carryover_cents, dashboard.settings.pending_carryover_currency || 'BRL', language)}</strong>
        </div>
      ) : null}

      <OverviewContent
        dashboard={dashboard}
        language={language}
        t={t}
        active={mobileView === 'overview'}
        onNavigate={(view) => { setMobileView(view); setMobileDetail(false); }}
        onOpenService={(id) => { setSelectedId(id); setMobileView('services'); setMobileDetail(true); }}
      />

      <div className={`mobile-pane ${mobileView === 'new' ? 'mobile-active' : ''}`}>
        <NewServiceForm dashboard={dashboard} run={run} busy={busy} onCreated={(id) => {
          setSelectedId(id);
          setMobileView('services');
          setMobileDetail(true);
        }} />
      </div>

      <div className={`mobile-pane ${mobileView === 'clients' ? 'mobile-active' : ''}`}>
        <ClientManager clients={dashboard.clients} run={run} busy={busy} />
      </div>

      <section className={`detail-panel mobile-pane ${mobileView === 'services' ? 'mobile-active' : ''}`}>
        <div className={`mobile-service-list ${mobileDetail ? 'mobile-hidden' : ''}`}>
          <ServiceList services={dashboard.services} selected={selected} onSelect={(id) => {
            setSelectedId(id);
            setMobileDetail(true);
          }} />
        </div>
        <div className={`mobile-service-detail ${mobileDetail ? 'mobile-shown' : ''}`}>
          <button type="button" className="mobile-back-button" onClick={() => setMobileDetail(false)}>
            <ArrowLeft size={17} /> {t('backToServices')}
          </button>
          {selected ? (
            <ServiceDetail service={selected} clients={dashboard.clients} run={run} busy={busy} />
          ) : (
            <div className="empty-state">{t('createFirst')}</div>
          )}
        </div>
      </section>
      <nav className="mobile-nav" aria-label="Navegação principal">
        <button type="button" className={mobileView === 'overview' ? 'active' : ''} onClick={() => { setMobileView('overview'); setMobileDetail(false); }}>
          <LayoutDashboard size={19} /><span>{t('overview')}</span>
        </button>
        <button type="button" className={mobileView === 'services' ? 'active' : ''} onClick={() => { setMobileView('services'); setMobileDetail(false); }}>
          <BriefcaseBusiness size={19} /><span>{t('services')}</span>
        </button>
        <button type="button" className={mobileView === 'new' ? 'active' : ''} onClick={() => { setMobileView('new'); setMobileDetail(false); }}>
          <Plus size={19} /><span>{t('newService')}</span>
        </button>
        <button type="button" className={mobileView === 'clients' ? 'active' : ''} onClick={() => { setMobileView('clients'); setMobileDetail(false); }}>
          <UserRound size={19} /><span>{t('clients')}</span>
        </button>
        <button type="button" className={mobileView === 'settings' ? 'active' : ''} onClick={() => { setMobileView('settings'); setMobileDetail(false); }}>
          <SlidersHorizontal size={19} /><span>{t('settings')}</span>
        </button>
      </nav>
      <SessionFooter user={user} loginAt={loginAt} language={language} t={t} />
    </main>
    </div>
    </I18nContext.Provider>
  );
}

function AppHeader({ t, onLogout }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <img className="app-brand-logo" src="/favicon.svg" width="40" height="40" alt="" />
        <span><strong>{t('appName')}</strong><small>{t('eyebrow')}</small></span>
      </div>
      <button type="button" className="app-header-logout" onClick={onLogout}><LogOut size={16} /> {t('logout')}</button>
    </header>
  );
}

function OverviewContent({ dashboard, language, t, active, onNavigate, onOpenService }) {
  const recentServices = dashboard.services.slice(0, 5);
  const outstandingServices = [...dashboard.services]
    .filter((service) => service.balanceCents > 0)
    .sort((a, b) => b.balanceCents - a.balanceCents)
    .slice(0, 4);
  const currencies = Object.entries(dashboard.totals.byCurrency || {});

  return (
    <section className={`overview-content mobile-pane ${active ? 'mobile-active' : ''}`}>
      <div className="overview-main-column">
        <section className="panel overview-progress-panel">
          <div className="overview-section-heading">
            <span><WalletCards size={17} /> {t('financialProgress')}</span>
          </div>
          <div className="overview-progress-list">
            {currencies.map(([currency, totals]) => {
              const percentage = totals.totalCents > 0 ? Math.min(100, Math.round((totals.paidCents / totals.totalCents) * 100)) : 0;
              return (
                <div className="overview-progress-item" key={currency}>
                  <div><strong>{currency}</strong><span>{percentage}% {t('received')}</span></div>
                  <div className="overview-progress-track"><span style={{ width: `${percentage}%` }} /></div>
                  <small>{centsToMoney(totals.paidCents, currency, language)} / {centsToMoney(totals.totalCents, currency, language)}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel overview-list-panel">
          <div className="overview-section-heading"><span><ReceiptText size={17} /> {t('recentServices')}</span><small>{recentServices.length}</small></div>
          <div className="overview-service-list">
            {recentServices.map((service) => (
              <button type="button" key={service.id} className="overview-service-row" onClick={() => onOpenService(service.id)}>
                <span><strong>{service.title}</strong><small>{clientLabel(service, t)} · {serviceDateLabel(service, t)}</small></span>
                <span><StatusBadge status={service.status} /><b>{centsToMoney(service.balanceCents, service.currency, language)}</b><ArrowRight size={15} /></span>
              </button>
            ))}
            {!recentServices.length ? <p className="empty-text">{t('noServices')}</p> : null}
          </div>
        </section>
      </div>

      <aside className="overview-side-column">
        <section className="panel overview-actions-panel">
          <div className="overview-section-heading"><span><Zap size={17} /> {t('quickActions')}</span></div>
          <div className="overview-actions-grid">
            <button type="button" onClick={() => onNavigate('new')}><Plus size={17} /><span>{t('newService')}</span></button>
            <button type="button" onClick={() => onNavigate('clients')}><UserRound size={17} /><span>{t('addClient')}</span></button>
            <button type="button" disabled={!dashboard.services.length} onClick={() => dashboard.services[0] && onOpenService(dashboard.services[0].id)}><Clock3 size={17} /><span>{t('logHours')}</span></button>
            <button type="button" disabled={!outstandingServices.length} onClick={() => outstandingServices[0] && onOpenService(outstandingServices[0].id)}><Banknote size={17} /><span>{t('registerPayment')}</span></button>
          </div>
        </section>

        <section className="panel overview-list-panel overview-outstanding-panel">
          <div className="overview-section-heading"><span><AlertCircle size={17} /> {t('openItems')}</span><small>{outstandingServices.length}</small></div>
          <div className="overview-outstanding-list">
            {outstandingServices.map((service) => (
              <button type="button" key={service.id} onClick={() => onOpenService(service.id)}>
                <span><strong>{service.title}</strong><small>{clientLabel(service, t)}</small></span>
                <b>{centsToMoney(service.balanceCents, service.currency, language)}</b>
              </button>
            ))}
            {!outstandingServices.length ? <p className="empty-text">{t('noServices')}</p> : null}
          </div>
        </section>
      </aside>
    </section>
  );
}

function NavRail({ t, activeView, onSelectView }) {
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: t('overview') },
    { id: 'services', icon: BriefcaseBusiness, label: t('services') },
    { id: 'new', icon: Plus, label: t('newService') },
    { id: 'clients', icon: UserRound, label: t('clients') },
    { id: 'settings', icon: SlidersHorizontal, label: t('settings') }
  ];
  return (
    <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:w-24 lg:shrink-0 lg:flex-col lg:items-center lg:bg-[#0e211d] lg:px-2 lg:py-5">
      <img className="h-11 w-11 rounded-xl shadow-lg" src="/favicon.svg" width="44" height="44" alt="WorkLedger" />
      <nav className="mt-7 flex flex-1 flex-col items-center gap-3">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onSelectView(id)}
            className={`group relative flex w-20 flex-col items-center gap-1.5 rounded-xl border border-transparent py-3 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/10 hover:text-white hover:shadow-none ${activeView === id ? 'border-white/10 bg-white/12 text-white' : 'bg-transparent text-white/50'}`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10 ${activeView === id ? 'bg-[#18a596] shadow-[0_6px_16px_rgba(24,165,150,.35)]' : ''}`}><Icon size={17} strokeWidth={2} /></span>
            <span className="max-w-full text-center text-[9px] font-semibold leading-tight tracking-wide">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function SessionFooter({ user, loginAt, language, t }) {
  const locale = language === 'en' ? 'en-US' : 'pt-BR';
  const loginDate = new Date(loginAt);
  const formattedLogin = Number.isNaN(loginDate.getTime())
    ? '—'
    : loginDate.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <footer className="session-footer">
      <div>
        <span>{t('signedAs')}</span>
        <strong>{user.name}</strong>
      </div>
      <div>
        <span>{t('loginAt')}</span>
        <time dateTime={loginAt}>{formattedLogin}</time>
      </div>
    </footer>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className="language-switcher" role="group" aria-label={t('language')}>
      <button type="button" aria-pressed={language === 'pt'} className={language === 'pt' ? 'active' : ''} onClick={() => setLanguage('pt')}>{t('langPt')}</button>
      <button type="button" aria-pressed={language === 'en'} className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>{t('langEn')}</button>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const { t } = useI18n();
  const resetToken = new URLSearchParams(window.location.search).get('reset_token');
  const [mode, setMode] = useState(resetToken ? 'recover' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const modeTitle = mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('recover');
  const modeSubtitle = mode === 'login' ? t('loginSubtitle') : mode === 'register' ? t('registerSubtitle') : t('recoverSubtitle');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'recover' && form.password !== form.confirmPassword) {
        throw new Error(t('passwordMismatch'));
      }
      const endpoint = mode === 'login' ? '/api/auth/login' : mode === 'register' ? '/api/auth/register' : '/api/auth/recover';
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'recover' ? { password: form.password, token: resetToken } : form)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}. A API não retornou uma resposta válida.`);
      if (mode === 'recover') window.history.replaceState({}, '', window.location.pathname);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="ledger-book">
        <section className="auth-hero">
          <span className="folio-mark" aria-hidden="true">N&ordm; 01</span>
          <div className="auth-brand" aria-label="WorkLedger">
            <img className="product-logo" src="/favicon.svg" width="72" height="72" alt="" />
            <span><strong>WorkLedger</strong><small>{t('eyebrow')}</small></span>
          </div>
          <h1>{t('title')}</h1>
          <p className="subtitle">{t('authHelp')}</p>
          <ul className="auth-hero-features">
            <li><Clock3 size={15} /><span>{t('workedHours')}</span></li>
            <li><Users size={15} /><span>{t('clients')}</span></li>
            <li><Banknote size={15} /><span>{t('payments')}</span></li>
          </ul>
        </section>

        <div className="ledger-spine" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>

        <section className="auth-card">
          <div className="auth-card-header">
            <div>
              <h2>{modeTitle}</h2>
              <p>{modeSubtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {error ? <div className="error">{error}</div> : null}

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' ? (
              <label className="field">
                <span>{t('authName')}</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            ) : null}

            {mode !== 'recover' ? <label className="field">
              <span>{t('email')}</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label> : null}

            <label className="field">
              <span>{mode === 'recover' ? t('newPassword') : t('password')}</span>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {mode === 'recover' ? (
              <label className="field">
                <span>{t('confirmPassword')}</span>
                <div className="password-field">
                  <input type={showConfirmation ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
                  <button type="button" aria-label={showConfirmation ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowConfirmation(!showConfirmation)}>
                    {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            ) : null}

            <button className="primary-button" type="submit" disabled={busy}>{modeTitle}</button>
          </form>

          <div className="auth-links">
            {mode !== 'login' ? <button type="button" className="secondary-button" onClick={() => setMode('login')}>{t('authSwitchLogin')}</button> : null}
            {mode !== 'register' ? <button type="button" className="secondary-button" onClick={() => setMode('register')}>{t('authSwitchRegister')}</button> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function RateEditor({ dashboard, run, busy }) {
  const { t, language } = useI18n();
  const [rate, setRate] = useState(formatMoneyInputValue(centsToInput(dashboard.settings.default_rate_cents), 'BRL', language));

  useEffect(() => {
    setRate(formatMoneyInputValue(centsToInput(dashboard.settings.default_rate_cents), 'BRL', language));
  }, [dashboard.settings.default_rate_cents, language]);

  return (
    <form
      className="rate-editor"
      onSubmit={(event) => {
        event.preventDefault();
        run(() => api('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ defaultRate: rate })
        }));
      }}
    >
      <label>
        {t('defaultRate')}
        <input {...moneyInputProps(rate, setRate, 'BRL', language)} />
      </label>
      <button type="submit" disabled={busy} title={t('save')}><Save size={17} /></button>
    </form>
  );
}

function DefaultClientEditor({ dashboard, run, busy }) {
  const { t } = useI18n();
  const [defaultClientId, setDefaultClientId] = useState(String(dashboard.settings.default_client_id || ''));

  useEffect(() => {
    setDefaultClientId(String(dashboard.settings.default_client_id || ''));
  }, [dashboard.settings.default_client_id]);

  return (
    <form
      className="top-setting-editor"
      onSubmit={(event) => {
        event.preventDefault();
        run(() => api('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ defaultClientId })
        }));
      }}
    >
      <label>
        {t('defaultClient')}
        <select value={defaultClientId} onChange={(event) => setDefaultClientId(event.target.value)}>
          <option value="">{t('noClient')}</option>
          {dashboard.clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={busy} title={t('save')}><Save size={17} /></button>
    </form>
  );
}

function GithubDefaultRepositoryEditor({ dashboard, run, busy }) {
  const [repositoryId, setRepositoryId] = useState(String(dashboard.settings.default_github_repository_id || ''));
  const [error, setError] = useState('');
  const [integration, setIntegration] = useState(null);
  const [availableInstallations, setAvailableInstallations] = useState([]);
  const [installationId, setInstallationId] = useState('');
  const [managing, setManaging] = useState(false);
  useEffect(() => setRepositoryId(String(dashboard.settings.default_github_repository_id || '')), [dashboard.settings.default_github_repository_id]);
  useEffect(() => { api('/api/github/status').then(setIntegration).catch(() => {}); }, []);

  async function loadAvailableInstallations() {
    try {
      setError('');
      const data = await api('/api/github/available-installations');
      setAvailableInstallations(data.installations || []);
      if (data.installations?.[0]) setInstallationId(String(data.installations[0].installationId));
    } catch (err) { setError(err.message); }
  }

  async function attachInstallation() {
    try {
      setError('');
      const data = await api('/api/github/installations/attach', { method: 'POST', body: JSON.stringify({ installationId: Number(installationId) }) });
      if (!data.repositoryCount) throw new Error('Esta instalação não possui repositórios disponíveis.');
      window.location.reload();
    } catch (err) { setError(err.message); }
  }

  async function disconnectInstallation(id) {
    if (!window.confirm('Desvincular esta conta do WorkLedger? Os repositórios e commits importados por ela serão removidos do sistema.')) return;
    try {
      setError('');
      await api(`/api/github/installations/${id}`, { method: 'DELETE' });
      window.location.reload();
    } catch (err) { setError(err.message); }
  }

  const connectionManager = (
    <div className="github-connection-manager">
      {availableInstallations.length ? <div className="github-installation-picker"><select value={installationId} onChange={(event) => setInstallationId(event.target.value)}>{availableInstallations.map((item) => <option key={item.installationId} value={item.installationId}>{item.accountLogin} · {item.repositorySelection === 'all' ? 'todos os repositórios' : 'repositórios selecionados'}</option>)}</select><button type="button" className="receipt-action" disabled={!installationId || busy} onClick={attachInstallation}>Vincular conta</button></div> : <button type="button" className="secondary-button" disabled={busy} onClick={loadAvailableInstallations}><Github size={15} /> Escolher conta GitHub</button>}
      {integration?.installations?.length ? <div className="github-connected-accounts">{integration.installations.map((item) => <span key={item.installation_id}>{item.account_login}<button type="button" disabled={busy} onClick={() => disconnectInstallation(item.installation_id)} title="Desvincular conta"><X size={13} /></button></span>)}</div> : null}
    </div>
  );
  if (!dashboard.githubRepositories?.length) return (
    <section className="github-preference-card is-empty">
      <div className="github-preference-title"><span className="github-preference-icon"><Github size={18} /></span><div><strong>Integração GitHub</strong><small>Busque os repositórios autorizados pela sua GitHub App para defini-los como padrão ou usá-los em serviços específicos.</small></div></div>
      <div className="github-preference-action">{connectionManager}<small>Escolha a conta antes de importar seus repositórios.</small></div>
      {error ? <em>{error}</em> : null}
    </section>
  );
  return (
    <form className="github-preference-card is-ready" onSubmit={(event) => {
      event.preventDefault();
      run(() => api('/api/settings', { method: 'PATCH', body: JSON.stringify({ defaultGithubRepositoryId: repositoryId }) }));
    }}>
      <div className="github-preference-title"><span className="github-preference-icon"><Github size={18} /></span><div><strong>Integração GitHub</strong><small>Este repositório será sugerido em novos serviços e poderá ser alterado em cada item.</small></div></div>
      <div className="github-default-control">
        <label className="github-repository-default-field">
          <span>Repositório padrão</span>
          <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>
            <option value="">Sem repositório</option>
            {dashboard.githubRepositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.full_name}</option>)}
          </select>
        </label>
        <button type="submit" disabled={busy} title="Salvar repositório padrão"><Save size={17} /></button>
      </div>
      <button type="button" className="secondary-button github-manage-button" disabled={busy} onClick={() => { setManaging((value) => !value); if (!managing) loadAvailableInstallations(); }}>{managing ? 'Fechar' : 'Trocar conta'}</button>
      {managing ? <div className="github-preference-manager">{connectionManager}</div> : null}
      {error ? <em>{error}</em> : null}
    </form>
  );
}

function NewServiceForm({ dashboard, run, busy, onCreated }) {
  const { t, language } = useI18n();
  const defaultClientId = dashboard.settings.default_client_id
    ? String(dashboard.settings.default_client_id)
    : dashboard.clients.length === 1 ? String(dashboard.clients[0].id) : '';
  const [form, setForm] = useState({
    title: '',
    clientId: defaultClientId,
    githubRepositoryId: dashboard.settings.default_github_repository_id ? String(dashboard.settings.default_github_repository_id) : '',
    serviceDate: localDateInput(),
    serviceTime: '00:00',
    currency: dashboard.settings.pending_carryover_cents > 0 ? dashboard.settings.pending_carryover_currency : 'BRL',
    billingType: 'hourly',
    rate: formatMoneyInputValue(centsToInput(dashboard.settings.default_rate_cents), 'BRL', language),
    adjustmentType: 'discount',
    discount: '0.00',
    notes: ''
  });

  useEffect(() => {
    if (!form.clientId && defaultClientId) {
      setForm((current) => ({ ...current, clientId: defaultClientId }));
    }
  }, [defaultClientId, form.clientId]);

  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        run(async () => {
          const storedUser = JSON.parse(localStorage.getItem('workledger-user') || 'null');
          const result = await fetch('/api/services', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(storedUser?.id ? { 'x-user-id': String(storedUser.id) } : {})
            },
            body: JSON.stringify(form)
          });
          const data = await result.json();
          if (!result.ok) throw new Error(data.error || t('createServiceError'));
          onCreated(data.service.id);
          const nextClientId = data.dashboard.settings.default_client_id
            ? String(data.dashboard.settings.default_client_id)
            : data.dashboard.clients.length === 1 ? String(data.dashboard.clients[0].id) : '';
          setForm({
            title: '',
            clientId: nextClientId,
            githubRepositoryId: data.dashboard.settings.default_github_repository_id ? String(data.dashboard.settings.default_github_repository_id) : '',
            serviceDate: localDateInput(),
            serviceTime: '00:00',
            currency: data.dashboard.settings.pending_carryover_cents > 0 ? data.dashboard.settings.pending_carryover_currency : 'BRL',
            billingType: 'hourly',
            rate: formatMoneyInputValue(centsToInput(data.dashboard.settings.default_rate_cents), 'BRL', language),
            adjustmentType: 'discount',
            discount: '0.00',
            notes: ''
          });
          return data.dashboard;
        });
      }}
    >
      <div className="panel-title">
        <span className="panel-icon"><Plus size={17} /></span>
        <span>
          <strong>{t('newService')}</strong>
          <small>{t('optionalTitle')}</small>
        </span>
      </div>
      {dashboard.settings.pending_carryover_cents > 0 ? (
        <p className="carry-alert">
          {t('nextCarryover').replace('{amount}', centsToMoney(dashboard.settings.pending_carryover_cents, dashboard.settings.pending_carryover_currency || 'BRL', language))}
        </p>
      ) : null}
      <label className="field">
        <span>{t('titleField')}</span>
        <input
          placeholder={t('servicePlaceholder').replace('{dateTime}', serviceDateLabel({ service_date: form.serviceDate }, t))}
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </label>
      <label className="field">
        <span>{t('client')}</span>
        <select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>
          <option value="">{t('noClient')}</option>
          {dashboard.clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </label>
      {dashboard.githubRepositories?.length ? (
        <label className="field wide-field github-service-field">
          <span>Repositório GitHub <small>Opcional</small></span>
          <select value={form.githubRepositoryId} onChange={(event) => setForm({ ...form, githubRepositoryId: event.target.value })}>
            <option value="">Nenhum repositório neste serviço</option>
            {dashboard.githubRepositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.full_name}</option>)}
          </select>
          <small>Você pode alterar ou remover o vínculo depois, no detalhe do serviço.</small>
        </label>
      ) : null}
      <label className="field">
        <span>{t('date')}</span>
        <input
          type="date"
          value={form.serviceDate}
          onChange={(event) => setForm({ ...form, serviceDate: event.target.value })}
        />
      </label>
      <label className="field">
        <span>{t('currency')}</span>
        <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
        </select>
      </label>
      <label className="field">
        <span>{t('billingModel')}</span>
        <select value={form.billingType} onChange={(event) => setForm({ ...form, billingType: event.target.value })}>
          <option value="hourly">{t('billingHourly')}</option>
          <option value="daily">{t('billingDaily')}</option>
          <option value="fixed">{t('billingFixed')}</option>
        </select>
      </label>
      <label className="field">
        <span>{billingRateLabel(form.billingType, t)}</span>
        <input {...moneyInputProps(form.rate, (value) => setForm({ ...form, rate: value }), form.currency, language)} />
      </label>
      <label className="field">
        <span>{t('notes')}</span>
        <textarea
          placeholder={t('serviceNotesPlaceholder')}
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={busy}>
        <Plus size={17} /> {t('createService')}
      </button>
    </form>
  );
}

function ClientManager({ clients, run, busy }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ id: null, name: '', notes: '' });
  const [portalStatus, setPortalStatus] = useState('');
  const editing = Boolean(form.id);

  function reset() {
    setForm({ id: null, name: '', notes: '' });
  }

  return (
    <section className="panel client-panel">
      <div className="panel-title">
        <span className="panel-icon"><Users size={17} /></span>
        <span>
          <strong>{t('clients')}</strong>
          <small>{t('clientsHelp')}</small>
        </span>
      </div>

      <form
        className="client-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const data = await api(editing ? `/api/clients/${form.id}` : '/api/clients', {
              method: editing ? 'PATCH' : 'POST',
              body: JSON.stringify({ name: form.name, notes: form.notes })
            });
            reset();
            return data;
          });
        }}
      >
        <label className="field">
          <span>{t('name')}</span>
          <input
            placeholder={t('clientNamePlaceholder')}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('notes')}</span>
          <input
            placeholder={t('clientNotesPlaceholder')}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
        <div className="client-actions">
          <button type="submit" disabled={busy}><Save size={16} /> {editing ? t('saveClient') : t('addClient')}</button>
          {editing ? (
            <button type="button" className="secondary-button" disabled={busy} onClick={reset}>{t('cancel')}</button>
          ) : null}
        </div>
      </form>

      <div className="client-list">
        {portalStatus ? <div className="success-message">{portalStatus}</div> : null}
        {clients.length ? clients.map((client) => (
          <div className="client-row" key={client.id}>
            <span>
              <strong>{client.name}</strong>
              <small>{client.notes || t('noNotes')}</small>
            </span>
            <div>
              <button
                type="button"
                className="portal-link-button"
                title={t('copyPortalLink')}
                disabled={busy}
                onClick={async () => {
                  try {
                    const result = await api(`/api/clients/${client.id}/share-link`, { method: 'POST' });
                    await navigator.clipboard.writeText(result.url || `${window.location.origin}/?client_portal=${encodeURIComponent(result.token)}`);
                    setPortalStatus(t('portalLinkCopied'));
                  } catch (error) {
                    setPortalStatus(error.message);
                  }
                }}
              >
                <Link2 size={15} /> {t('clientPortal')}
              </button>
              <button
                type="button"
                className="icon-button"
                title={t('editClient')}
                disabled={busy}
                onClick={() => setForm({ id: client.id, name: client.name, notes: client.notes })}
              >
                <Save size={15} />
              </button>
              <button
                type="button"
                className="icon-button danger-button"
                title={t('removeClient')}
                disabled={busy}
                onClick={() => run(() => api(`/api/clients/${client.id}`, { method: 'DELETE' }))}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )) : <p className="empty-text">{t('noClients')}</p>}
      </div>
    </section>
  );
}

function ServiceList({ services, selected, onSelect }) {
  const { t, language } = useI18n();
  return (
    <section className="panel service-list-panel">
      <div className="section-heading">
        <strong>{t('services')}</strong>
        <small>{services.length} {services.length === 1 ? t('record') : t('records')}</small>
      </div>
      <div className="service-list">
        {services.map((service) => (
        <button
          className={`service-row ${selected?.id === service.id ? 'active' : ''}`}
          key={service.id}
          onClick={() => onSelect(service.id)}
          type="button"
        >
          <span className="service-row-main">
            <span className="service-row-title"><strong>{service.title}</strong><em>#{service.id}</em></span>
            <small><CalendarDays size={13} /> {serviceScheduleLabel(service, t)}</small>
            <small>{clientLabel(service, t)} · {minutesToLabel(service.workedMinutes)} · {billingTypeLabel(service.billingType, t)} · {service.currency}</small>
          </span>
          <span className="row-right">
            <StatusBadge status={service.status} />
            <span className="row-balance">
              <small>{t('balance')}</small>
              <b>{centsToMoney(service.balanceCents, service.currency, language)}</b>
            </span>
          </span>
        </button>
        ))}
        {!services.length ? <p className="empty-text">{t('noServices')}</p> : null}
      </div>
    </section>
  );
}

function ServiceDetail({ service, clients, run, busy }) {
  const { t, language } = useI18n();
  const [editing, setEditing] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  return (
    <div className="detail-grid">
      <section className="panel detail-header">
        <div className="detail-title">
          <div className="title-line"><StatusBadge status={service.status} /><span>{t('service')} #{service.id}</span></div>
          <h2>{service.title}</h2>
          <p><CalendarDays size={15} /> {serviceScheduleLabel(service, t)}</p>
          <div className="detail-meta">
            <span><Users size={14} /> {clientLabel(service, t)}</span>
            <span><Coins size={14} /> {service.currency}</span>
            <span><Clock3 size={14} /> {minutesToLabel(service.workedMinutes)}</span>
            <span><ReceiptText size={14} /> {billingTypeLabel(service.billingType, t)}</span>
          </div>
          <div className="detail-actions">
            <button type="button" className="receipt-action" disabled={busy} onClick={() => setReceiptOpen(true)}>
              <ReceiptText size={16} /> {t('receipt')}
            </button>
            <button type="button" className="secondary-button" disabled={busy} onClick={() => setAdjusting(true)}>
              <Coins size={16} /> {service.adjustmentCents > 0 ? t('editAdjustment') : t('addAdjustment')}
            </button>
            <button type="button" className="secondary-button" disabled={busy} onClick={() => setEditing(true)}>
              <Pencil size={16} /> {t('editService')}
            </button>
            <button type="button" className="danger-action" disabled={busy} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} /> {t('delete')}
            </button>
          </div>
        </div>
        <div className="financial-summary">
          <span className="financial-summary-label">{t('financialSummary')}</span>
          <div className="financial-primary">
            <span>{t('amountDue')}</span>
            <strong>{centsToMoney(service.balanceCents, service.currency, language)}</strong>
          </div>
          <div className="financial-ledger">
            <span><small>{billingBaseLabel(service, t)}</small><b>{centsToMoney(service.baseCents, service.currency, language)}</b></span>
            {service.carryover_cents > 0 ? <span><small>{t('carryoverApplied')} (+)</small><b>+ {centsToMoney(service.carryover_cents, service.currency, language)}</b></span> : null}
            {service.adjustmentCents > 0 ? (
              <span className={service.adjustmentType === 'surcharge' ? 'ledger-debit' : 'ledger-credit'}>
                <small>{t(service.adjustmentType === 'surcharge' ? 'surcharge' : 'discount')} ({service.adjustmentType === 'surcharge' ? '+' : '−'})</small>
                <b>{service.adjustmentType === 'surcharge' ? '+' : '−'} {centsToMoney(service.adjustmentCents, service.currency, language)}</b>
              </span>
            ) : null}
            <span className="ledger-total"><small>{t('amountBilled')}</small><b>{centsToMoney(service.totalCents, service.currency, language)}</b></span>
            <span className="ledger-credit"><small>{t('paymentsApplied')} (−)</small><b>− {centsToMoney(service.paidCents, service.currency, language)}</b></span>
          </div>
        </div>
      </section>

      <EntryForm service={service} run={run} busy={busy} />
      <PaymentForm service={service} run={run} busy={busy} />
      <EntriesTable service={service} run={run} busy={busy} />
      <PaymentsTable service={service} />

      {receiptOpen ? (
        <Modal title={t('receiptTitle')} onClose={() => setReceiptOpen(false)}>
          <ReceiptModal service={service} />
        </Modal>
      ) : null}

      {editing ? (
        <Modal title={t('editService')} onClose={() => setEditing(false)}>
          <ServiceEditForm
            service={service}
            clients={clients}
            run={run}
            busy={busy}
            onSaved={() => setEditing(false)}
          />
        </Modal>
      ) : null}

      {adjusting ? (
        <Modal title={service.adjustmentCents > 0 ? t('editAdjustment') : t('addAdjustment')} onClose={() => setAdjusting(false)}>
          <AdjustmentForm service={service} run={run} busy={busy} onSaved={() => setAdjusting(false)} />
        </Modal>
      ) : null}

      {confirmDelete ? (
        <Modal title={t('deleteService')} onClose={() => setConfirmDelete(false)}>
          <div className="confirm-dialog">
            <p>{t('deleteWarning')}</p>
            <strong>{service.title}</strong>
            <div className="modal-actions">
              <button type="button" className="secondary-button" disabled={busy} onClick={() => setConfirmDelete(false)}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="danger-action"
                disabled={busy}
                onClick={() => run(async () => {
                  const data = await api(`/api/services/${service.id}`, { method: 'DELETE' });
                  setConfirmDelete(false);
                  return data;
                })}
              >
                <Trash2 size={16} /> {t('deleteForever')}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function GithubServicePanel({ service, run, busy }) {
  const [status, setStatus] = useState(null);
  const [repositoryId, setRepositoryId] = useState('');
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [changingRepository, setChangingRepository] = useState(false);

  async function loadStatus() {
    setLoading(true);
    try {
      const data = await api('/api/github/status');
      setStatus(data);
      if (!repositoryId && data.repositories?.[0]) setRepositoryId(String(data.repositories[0].id));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  useEffect(() => {
    if (service.githubRepositories?.length) {
      setRepositoryId((current) => service.githubRepositories.some((repository) => String(repository.id) === current) ? current : String(service.githubRepositories[0].id));
      setCommits([]);
    }
  }, [service.id, service.githubRepositories]);

  async function loadCommits(id = repositoryId) {
    if (!id) return;
    setLoading(true);
    setMessage('');
    try {
      await api(`/api/github/repositories/${id}/sync`, { method: 'POST' });
      const data = await api(`/api/github/repositories/${id}/commits`);
      setCommits(data.commits || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function connectGithub() {
    setMessage('');
    try {
      const data = await api('/api/github/connect');
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function discoverRepositories() {
    setLoading(true);
    setMessage('');
    try {
      const data = await api('/api/github/discover', { method: 'POST' });
      setMessage(data.repositoryCount ? `${data.repositoryCount} repositório(s) encontrado(s). Atualize a página para utilizá-los.` : 'Nenhum repositório foi encontrado. Verifique a permissão da instalação da GitHub App.');
      await loadStatus();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const linked = new Set((service.githubCommits || []).map((commit) => commit.id));
  const linkedRepositories = service.githubRepositories || [];
  return (
    <section className="panel github-panel">
      <div className="section-heading">
        <span className="github-heading"><Github size={18} /><strong>GitHub</strong></span>
        <small>Repositórios e commits do serviço</small>
      </div>
      {!status?.configured && !loading ? (
        <p className="github-empty">A integração GitHub ainda não está configurada no ambiente de produção.</p>
      ) : null}
      {status?.configured && !status.installations?.length ? (
        <div className="github-onboarding">
          <div className="github-onboarding-copy"><span>1</span><p><b>Busque os repositórios autorizados</b> pela instalação existente da GitHub App.</p></div>
          <button type="button" className="receipt-action" disabled={loading} onClick={discoverRepositories}><Github size={16} /> Buscar repositórios</button>
          <div className="github-onboarding-copy muted"><span>2</span><p>Se nenhum repositório for encontrado, <a href={status.installationUrl || '#'}>revise a instalação do App</a> e garanta acesso a pelo menos um repositório.</p></div>
        </div>
      ) : null}
      {status?.repositories?.length && !linkedRepositories.length ? (
        <div className="github-repository-linker">
          <div><strong>Vincule um repositório</strong><small>O serviço exibirá somente commits deste repositório.</small></div>
          <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>
            {status.repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.full_name}</option>)}
          </select>
          <button type="button" className="receipt-action" disabled={busy || !repositoryId} onClick={() => run(() => api(`/api/services/${service.id}/github/repositories`, { method: 'POST', body: JSON.stringify({ repositoryId: Number(repositoryId) }) }))}><Link2 size={16} /> Vincular ao serviço</button>
        </div>
      ) : null}
      {linkedRepositories.length ? (
        <div className="github-repositories">
          <div className="github-repository-title"><strong>Repositório do serviço</strong><small>Os commits sincronizados ficam disponíveis para este serviço.</small></div>
          <div className="github-repository-tags">
            {linkedRepositories.map((repository) => <span key={repository.id} className="github-repository-tag"><Github size={14} /> {repository.full_name}<button type="button" aria-label={`Desvincular ${repository.full_name}`} disabled={busy} onClick={() => run(() => api(`/api/services/${service.id}/github/repositories/${repository.id}`, { method: 'DELETE' }))}><X size={13} /></button></span>)}
          </div>
          <button type="button" className="secondary-button github-change-button" disabled={busy} onClick={() => setChangingRepository((current) => !current)}>{changingRepository ? 'Cancelar alteração' : 'Alterar repositório'}</button>
          {changingRepository ? (
            <div className="github-repository-change">
              <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)}>
                {status?.repositories?.map((repository) => <option key={repository.id} value={repository.id}>{repository.full_name}</option>)}
              </select>
              <button type="button" className="receipt-action" disabled={busy || !repositoryId} onClick={() => run(async () => {
                const data = await api(`/api/services/${service.id}/github/repository`, { method: 'PUT', body: JSON.stringify({ repositoryId: Number(repositoryId) }) });
                setChangingRepository(false); setCommits([]); return data;
              })}>Salvar repositório</button>
            </div>
          ) : null}
        </div>
      ) : null}
      {linkedRepositories.length ? (
        <div className="github-controls">
          <select value={repositoryId} onChange={(event) => { setRepositoryId(event.target.value); setCommits([]); }}>
            {linkedRepositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.full_name}</option>)}
          </select>
          <button type="button" className="secondary-button" disabled={loading || busy} onClick={() => loadCommits()}><Github size={16} /> Sincronizar commits</button>
        </div>
      ) : null}
      {message ? <p className="github-message">{message}</p> : null}
      {service.githubCommits?.length ? (
        <div className="github-linked-list">
          <strong>Vinculados a este serviço</strong>
          {service.githubCommits.map((commit) => (
            <div className="github-commit" key={commit.id}>
              <span><b>{commit.repository_full_name}</b><a href={commit.html_url} target="_blank" rel="noreferrer">{commit.sha.slice(0, 7)}</a><small>{commit.message}</small></span>
              <button type="button" aria-label="Remover vínculo" disabled={busy} onClick={() => run(() => api(`/api/services/${service.id}/github/commits/${commit.id}`, { method: 'DELETE' }))}><X size={15} /></button>
            </div>
          ))}
        </div>
      ) : null}
      {commits.length ? (
        <div className="github-commit-list">
          <strong>Commits recentes</strong>
          {commits.map((commit) => (
            <div className="github-commit" key={commit.id}>
              <span><a href={commit.html_url} target="_blank" rel="noreferrer">{commit.sha.slice(0, 7)}</a><b>{commit.message}</b><small>{commit.author_name || commit.author_login || 'Autor não informado'}</small></span>
              <button type="button" className={linked.has(commit.id) ? 'secondary-button' : 'receipt-action'} disabled={busy || linked.has(commit.id)} onClick={() => run(() => api(`/api/services/${service.id}/github/commits`, { method: 'POST', body: JSON.stringify({ commitId: commit.id }) }))}>{linked.has(commit.id) ? 'Vinculado' : 'Vincular'}</button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ReceiptModal({ service }) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const lines = buildReceiptLines(service, t, language);
  const receiptText = lines.join('\n');

  async function copyReceipt() {
    await navigator.clipboard.writeText(receiptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(receiptText)}`, '_blank', 'noopener,noreferrer');
  }

  async function receiptBlob() {
    const node = document.getElementById('service-receipt');
    return toBlob(node, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true
    });
  }

  async function downloadImage() {
    const node = document.getElementById('service-receipt');
    const dataUrl = await toPng(node, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true
    });
    const link = document.createElement('a');
    link.download = `workledger-recibo-${service.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function copyImage() {
    const blob = await receiptBlob();
    if (!blob || !navigator.clipboard || !window.ClipboardItem) {
      await copyReceipt();
      return;
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    setImageCopied(true);
    window.setTimeout(() => setImageCopied(false), 1800);
  }

  return (
    <div className="receipt-actions-wrap">
      <div className="receipt-paper" id="service-receipt">
        {lines.map((line, index) => (
          <div className={line === '' ? 'receipt-spacer' : 'receipt-line'} key={`${line}-${index}`}>{line}</div>
        ))}
      </div>

      <div className="receipt-actions">
        <button type="button" className="secondary-button" onClick={() => window.print()}><Printer size={16} /> {t('print')}</button>
        <button type="button" className="secondary-button" onClick={copyReceipt}><Copy size={16} /> {copied ? t('receiptCopied') : t('copyText')}</button>
        <button type="button" className="secondary-button" onClick={copyImage}><Copy size={16} /> {imageCopied ? t('imageCopied') : t('copyImage')}</button>
        <button type="button" className="secondary-button" onClick={downloadImage}><Download size={16} /> {t('downloadImage')}</button>
        <button type="button" className="primary-button" onClick={shareWhatsApp}><Send size={16} /> {t('whatsapp')}</button>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  const { t } = useI18n();
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" title={t('close')} onClick={onClose}>
            <X size={17} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function AdjustmentForm({ service, run, busy, onSaved }) {
  const { t, language } = useI18n();
  const [adjustmentType, setAdjustmentType] = useState(service.adjustmentType || service.adjustment_type || 'discount');
  const [amount, setAmount] = useState(formatMoneyInputValue(centsToInput(service.adjustmentCents || 0), service.currency, language));

  return (
    <form
      className="adjustment-form"
      onSubmit={(event) => {
        event.preventDefault();
        run(async () => {
          const data = await api(`/api/services/${service.id}/adjustment`, {
            method: 'PATCH',
            body: JSON.stringify({ adjustmentType, amount })
          });
          onSaved?.();
          return data;
        });
      }}
    >
      <p>{t('adjustmentHelp')}</p>
      <label className="field">
        <span>{t('adjustmentType')}</span>
        <select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value)}>
          <option value="discount">{t('discountOption')}</option>
          <option value="surcharge">{t('surchargeOption')}</option>
        </select>
      </label>
      <label className="field">
        <span>{t('adjustmentAmount')}</span>
        <input {...moneyInputProps(amount, setAmount, service.currency, language)} />
      </label>
      <div className="modal-actions">
        {service.adjustmentCents > 0 ? (
          <button
            type="button"
            className="danger-action"
            disabled={busy}
            onClick={() => run(async () => {
              const data = await api(`/api/services/${service.id}/adjustment`, {
                method: 'PATCH',
                body: JSON.stringify({ adjustmentType: 'discount', amount: 0 })
              });
              onSaved?.();
              return data;
            })}
          >
            <Trash2 size={16} /> {t('removeAdjustment')}
          </button>
        ) : null}
        <button type="submit" disabled={busy}><Save size={16} /> {t('saveAdjustment')}</button>
      </div>
    </form>
  );
}

function ServiceEditForm({ service, clients, run, busy, onSaved }) {
  const { t, language } = useI18n();
  const [form, setForm] = useState({
    title: service.title,
    clientId: service.client_id || '',
    serviceDate: service.service_date || localDateInput(),
    serviceTime: service.service_time || localTimeInput(),
    currency: service.currency || 'BRL',
    billingType: service.billingType || service.billing_type || 'hourly',
    adjustmentType: service.adjustmentType || service.adjustment_type || 'discount',
    notes: service.notes,
    rate: formatMoneyInputValue(centsToInput(service.rate_cents), service.currency, language),
    discount: formatMoneyInputValue(centsToInput(service.discount_cents), service.currency, language)
  });

  useEffect(() => {
    setForm({
      title: service.title,
      clientId: service.client_id || '',
      serviceDate: service.service_date || localDateInput(),
      serviceTime: service.service_time || localTimeInput(),
      currency: service.currency || 'BRL',
      billingType: service.billingType || service.billing_type || 'hourly',
      adjustmentType: service.adjustmentType || service.adjustment_type || 'discount',
      notes: service.notes,
      rate: formatMoneyInputValue(centsToInput(service.rate_cents), service.currency, language),
      discount: formatMoneyInputValue(centsToInput(service.discount_cents), service.currency, language)
    });
  }, [service.id, service.title, service.client_id, service.service_date, service.service_time, service.currency, service.billingType, service.billing_type, service.adjustmentType, service.adjustment_type, service.notes, service.rate_cents, service.discount_cents, language]);

  return (
    <form
      className="form-grid service-edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        run(async () => {
          const data = await api(`/api/services/${service.id}`, {
            method: 'PATCH',
            body: JSON.stringify(form)
          });
          onSaved?.();
          return data;
        });
      }}
    >
      <h3>{t('serviceData')}</h3>
      <label className="field">
        <span>{t('titleField')}</span>
        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      </label>
      <label className="field">
        <span>{t('client')}</span>
        <select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>
          <option value="">{t('noClient')}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t('date')}</span>
        <input type="date" value={form.serviceDate} onChange={(event) => setForm({ ...form, serviceDate: event.target.value })} />
      </label>
      <label className="field">
        <span>{t('time')}</span>
        <input type="time" value={form.serviceTime} onChange={(event) => setForm({ ...form, serviceTime: event.target.value })} />
      </label>
      <label className="field">
        <span>{t('currency')}</span>
        <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
        </select>
      </label>
      <label className="field">
        <span>{t('billingModel')}</span>
        <select value={form.billingType} onChange={(event) => setForm({ ...form, billingType: event.target.value })}>
          <option value="hourly">{t('billingHourly')}</option>
          <option value="daily">{t('billingDaily')}</option>
          <option value="fixed">{t('billingFixed')}</option>
        </select>
      </label>
      <label className="field">
        <span>{billingRateLabel(form.billingType, t)}</span>
        <input {...moneyInputProps(form.rate, (value) => setForm({ ...form, rate: value }), form.currency, language)} />
      </label>
      <label className="field wide-field">
        <span>{t('notes')}</span>
        <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <button type="submit" disabled={busy}><Save size={17} /> {t('save')}</button>
    </form>
  );
}

function EntryForm({ service, run, busy }) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ workDate: today, startTime: '10:00', endTime: '14:00', notes: '' });

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        run(async () => {
          const data = await api(`/api/services/${service.id}/entries`, {
            method: 'POST',
            body: JSON.stringify(form)
          });
          setForm({ ...form, notes: '' });
          return data;
        });
      }}
    >
      <h3>{t('logHours')}</h3>
      <input type="date" value={form.workDate} onChange={(event) => setForm({ ...form, workDate: event.target.value })} />
      <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
      <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
      <input placeholder={t('notes')} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      <button type="submit" disabled={busy}><Clock3 size={17} /> {t('add')}</button>
    </form>
  );
}

function PaymentForm({ service, run, busy }) {
  const { t, language } = useI18n();
  const [amount, setAmount] = useState(formatMoneyInputValue(centsToInput(service.balanceCents), service.currency, language));
  const [mode, setMode] = useState('keep-open');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setAmount(formatMoneyInputValue(centsToInput(service.balanceCents), service.currency, language));
    setMode('keep-open');
    setNotes('');
  }, [service.id, service.balanceCents, service.currency, language]);

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        run(async () => {
          const data = await api(`/api/services/${service.id}/payments`, {
            method: 'POST',
            body: JSON.stringify({ amount, mode, notes })
          });
          setNotes('');
          return data;
        });
      }}
    >
      <h3>{t('payment')}</h3>
      <input {...moneyInputProps(amount, setAmount, service.currency, language)} />
      <select value={mode} onChange={(event) => setMode(event.target.value)}>
        <option value="keep-open">{t('keepOpen')}</option>
        <option value="transfer-next">{t('transferNext')}</option>
      </select>
      <input placeholder={t('notes')} value={notes} onChange={(event) => setNotes(event.target.value)} />
      <button type="button" disabled={busy || service.balanceCents <= 0} onClick={() => setAmount(formatMoneyInputValue(centsToInput(service.balanceCents), service.currency, language))}>
        <Check size={17} /> {t('totalAmount')}
      </button>
      <button type="submit" disabled={busy || service.balanceCents <= 0}><Banknote size={17} /> {t('settle')}</button>
    </form>
  );
}

function EntriesTable({ service, run, busy }) {
  const { t, language } = useI18n();
  return (
    <section className="panel table-panel">
      <h3>{t('serviceHours')}</h3>
      {service.carryover_cents > 0 ? (
        <div className="carry-line">
          <Hourglass size={16} /> {t('carryoverApplied')} (+): {centsToMoney(service.carryover_cents, service.currency, language)}
        </div>
      ) : null}
      {service.adjustmentCents > 0 ? (
        <div className={service.adjustmentType === 'surcharge' ? 'surcharge-line' : 'discount-line'}>
          <Coins size={16} /> {t(service.adjustmentType === 'surcharge' ? 'surchargeApplied' : 'discountApplied')} ({service.adjustmentType === 'surcharge' ? '+' : '−'}): {centsToMoney(service.adjustmentCents, service.currency, language)}
        </div>
      ) : null}
      {service.entries.length ? service.entries.map((entry) => (
        <div className="table-row" key={entry.id}>
          <span>
            <strong>{new Date(`${entry.work_date}T12:00:00`).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}</strong>
            <small>{entry.start_time} às {entry.end_time} · {minutesToLabel(entry.minutes)}</small>
            {entry.notes ? <small>{entry.notes}</small> : null}
          </span>
          <div className="table-row-actions">
            <span>
              <strong>{service.billingType === 'hourly' ? centsToMoney(Math.round((entry.minutes / 60) * service.rate_cents), service.currency, language) : billingTypeLabel(service.billingType, t)}</strong>
              <small>{service.billingType === 'hourly' ? `${minutesToLabel(entry.minutes)} × ${centsToMoney(service.rate_cents, service.currency, language)}/h` : service.billingType === 'daily' ? centsToMoney(service.rate_cents, service.currency, language) : t('includedInFixed')}</small>
            </span>
            <button
              type="button"
              disabled={busy}
              title="Remover lançamento"
              onClick={() => run(() => api(`/api/services/${service.id}/entries/${entry.id}`, { method: 'DELETE' }))}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )) : <p className="empty-text">{t('noHours')}</p>}
    </section>
  );
}

function PaymentsTable({ service }) {
  const { t, language } = useI18n();
  return (
    <section className="panel table-panel">
      <h3>{t('payments')}</h3>
      {service.payments.length ? service.payments.map((payment) => (
        <div className="table-row" key={payment.id}>
          <span>
            <strong>{centsToMoney(payment.amount_cents, service.currency, language)}</strong>
            <small>{new Date(payment.created_at).toLocaleString('pt-BR')}</small>
            {payment.notes ? <small>{payment.notes}</small> : null}
          </span>
        </div>
      )) : <p className="empty-text">{t('noPayments')}</p>}
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
