import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toBlob, toPng } from 'html-to-image';
import {
  Banknote,
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
  Link2,
  Plus,
  Printer,
  ReceiptText,
  Save,
  Send,
  Trash2,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import './styles.css';

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
    initialDiscount: 'Ajuste inicial',
    adjustmentType: 'Tipo de ajuste',
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
    authHelp: 'Seus dados ficam protegidos na nuvem. O login salvo no navegador mantém sua sessão neste computador.',
    signedAs: 'Conectado como'
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
    initialDiscount: 'Initial adjustment',
    adjustmentType: 'Adjustment type',
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
    authHelp: 'Your data is securely stored in the cloud. The browser-saved login keeps your session on this computer.',
    signedAs: 'Signed in as'
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
    '',
    t('serviceHours').toUpperCase()
  ];

  if (service.entries.length) {
    service.entries.forEach((entry) => {
      const entryValue = Math.round((entry.minutes / 60) * service.rate_cents);
      lines.push(`${entry.start_time} - ${entry.end_time} | ${minutesToLabel(entry.minutes)} | ${moneyFor(entryValue)}`);
    });
  } else {
    lines.push(t('noHours'));
  }

  lines.push('', `${t('subtotal')}: ${moneyFor(service.hoursCents)}`);
  if (service.carryover_cents > 0) lines.push(`${t('carryoverApplied')}: ${moneyFor(service.carryover_cents)}`);
  if (service.adjustmentCents > 0) {
    lines.push(`${t(service.adjustmentType === 'surcharge' ? 'surcharge' : 'discount')}: ${moneyFor(service.adjustmentCents)}`);
  }
  lines.push(
    `${t('total')}: ${moneyFor(service.totalCents)}`,
    `${t('paidTotal')}: ${moneyFor(service.paidCents)}`,
    `${t('balance')}: ${moneyFor(service.balanceCents)}`,
    `${t('open')}: ${service.status === 'open' ? t('open') : service.status === 'paid' ? t('paid') : t('transferred')}`,
    '',
    `${t('issuedAt')}: ${dateTimeLabel(new Date(), language)}`
  );
  return lines;
}

async function api(path, options = {}) {
  const storedUser = JSON.parse(localStorage.getItem('workledger-user') || 'null');
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(storedUser?.id ? { 'x-user-id': String(storedUser.id) } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a ação.');
  return data.dashboard || data;
}

function StatCard({ icon: Icon, label, value, muted, tone = 'neutral' }) {
  return (
    <section className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon size={18} /></div>
      <span>{label}</span>
      <strong className={muted ? 'muted-value' : ''}>{value}</strong>
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
                <span><small>{t('hoursSubtotal')}</small><b>{centsToMoney(service.hoursCents, service.currency, language)}</b></span>
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
                    <span className="portal-entry-value"><b>{centsToMoney(Math.round((entry.minutes / 60) * service.rate_cents), service.currency, language)}</b><small>{minutesToLabel(entry.minutes)} × {centsToMoney(service.rate_cents, service.currency, language)}/h</small></span>
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
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('workledger-user') || 'null'));
  const [dashboard, setDashboard] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const t = (key) => messages[language]?.[key] || messages.pt[key] || key;
  const portalToken = new URLSearchParams(window.location.search).get('client_portal');

  function setLanguage(nextLanguage) {
    setLanguageState(nextLanguage);
    localStorage.setItem('workledger-language', nextLanguage);
  }

  function persistUser(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('workledger-user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('workledger-user');
      setDashboard(null);
      setSelectedId(null);
    }
  }

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
    <main className="app-shell">
      <header className="topbar">
        <div className="hero-copy">
          <span className="product-mark">WL</span>
          <div>
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1>{t('title')}</h1>
            <p className="subtitle">{t('subtitle')}</p>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="session-card">
            <span>{t('signedAs')}</span>
            <strong>{user.name}</strong>
            <button type="button" className="secondary-button" onClick={() => persistUser(null)}>{t('logout')}</button>
          </div>
          <LanguageSwitcher />
          <DefaultClientEditor dashboard={dashboard} run={run} busy={busy} />
          <RateEditor dashboard={dashboard} run={run} busy={busy} />
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <section className="stats-grid">
        <StatCard tone="warning" icon={WalletCards} label={t('open')} value={currencySummary(dashboard.totals.byCurrency, 'openCents', language)} />
        <StatCard tone="success" icon={Banknote} label={t('paidTotal')} value={currencySummary(dashboard.totals.byCurrency, 'paidCents', language)} />
        <StatCard tone="neutral" icon={Clock3} label={t('workedHours')} value={minutesToLabel(dashboard.totals.workedMinutes)} />
        <StatCard
          tone="warning"
          icon={Coins}
          label={t('nextService')}
          value={centsToMoney(dashboard.settings.pending_carryover_cents, dashboard.settings.pending_carryover_currency || 'BRL', language)}
          muted={!dashboard.settings.pending_carryover_cents}
        />
      </section>

      <div className="workspace">
        <aside className="sidebar">
          <NewServiceForm dashboard={dashboard} run={run} busy={busy} onCreated={setSelectedId} />
          <ClientManager clients={dashboard.clients} run={run} busy={busy} />
        </aside>

        <section className="detail-panel">
          <ServiceList services={dashboard.services} selected={selected} onSelect={setSelectedId} />
          {selected ? (
            <ServiceDetail service={selected} clients={dashboard.clients} run={run} busy={busy} />
          ) : (
            <div className="empty-state">{t('createFirst')}</div>
          )}
        </section>
      </div>
    </main>
    </I18nContext.Provider>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className="language-switcher" aria-label={t('language')}>
      <button type="button" className={language === 'pt' ? 'active' : ''} onClick={() => setLanguage('pt')}>{t('langPt')}</button>
      <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>{t('langEn')}</button>
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
          <span className="product-mark">WL</span>
          <p className="eyebrow">{t('eyebrow')}</p>
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

function NewServiceForm({ dashboard, run, busy, onCreated }) {
  const { t, language } = useI18n();
  const defaultClientId = dashboard.settings.default_client_id
    ? String(dashboard.settings.default_client_id)
    : dashboard.clients.length === 1 ? String(dashboard.clients[0].id) : '';
  const [form, setForm] = useState({
    title: '',
    clientId: defaultClientId,
    serviceDate: localDateInput(),
    serviceTime: '00:00',
    currency: dashboard.settings.pending_carryover_cents > 0 ? dashboard.settings.pending_carryover_currency : 'BRL',
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
            serviceDate: localDateInput(),
            serviceTime: '00:00',
            currency: data.dashboard.settings.pending_carryover_cents > 0 ? data.dashboard.settings.pending_carryover_currency : 'BRL',
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
      <div className="inline-fields">
        <label className="field">
          <span>{t('initialDiscount')}</span>
          <input
            {...moneyInputProps(form.discount, (value) => setForm({ ...form, discount: value }), form.currency, language)}
          />
        </label>
        <label className="field">
          <span>{t('adjustmentType')}</span>
          <select value={form.adjustmentType} onChange={(event) => setForm({ ...form, adjustmentType: event.target.value })}>
            <option value="discount">{t('discountOption')}</option>
            <option value="surcharge">{t('surchargeOption')}</option>
          </select>
        </label>
      </div>
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
            <small>{clientLabel(service, t)} · {minutesToLabel(service.workedMinutes)} · {service.currency}</small>
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
          </div>
          <div className="detail-actions">
            <button type="button" className="receipt-action" disabled={busy} onClick={() => setReceiptOpen(true)}>
              <ReceiptText size={16} /> {t('receipt')}
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
            <span>{t('balance')}</span>
            <strong>{centsToMoney(service.balanceCents, service.currency, language)}</strong>
          </div>
          <div className="financial-metrics">
            <span><small>{t('total')}</small><b>{centsToMoney(service.totalCents, service.currency, language)}</b></span>
            <span><small>{t('paidTotal')}</small><b>{centsToMoney(service.paidCents, service.currency, language)}</b></span>
            <span><small>{t('gross')}</small><b>{centsToMoney(service.grossCents, service.currency, language)}</b></span>
            <span><small>{t(service.adjustmentType === 'surcharge' ? 'surcharge' : 'discount')}</small><b>{centsToMoney(service.adjustmentCents, service.currency, language)}</b></span>
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

function ServiceEditForm({ service, clients, run, busy, onSaved }) {
  const { t, language } = useI18n();
  const [form, setForm] = useState({
    title: service.title,
    clientId: service.client_id || '',
    serviceDate: service.service_date || localDateInput(),
    serviceTime: service.service_time || localTimeInput(),
    currency: service.currency || 'BRL',
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
      adjustmentType: service.adjustmentType || service.adjustment_type || 'discount',
      notes: service.notes,
      rate: formatMoneyInputValue(centsToInput(service.rate_cents), service.currency, language),
      discount: formatMoneyInputValue(centsToInput(service.discount_cents), service.currency, language)
    });
  }, [service.id, service.title, service.client_id, service.service_date, service.service_time, service.currency, service.adjustmentType, service.adjustment_type, service.notes, service.rate_cents, service.discount_cents, language]);

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
        <span>{t('hourlyRate')}</span>
        <input {...moneyInputProps(form.rate, (value) => setForm({ ...form, rate: value }), form.currency, language)} />
      </label>
      <div className="inline-fields">
        <label className="field">
          <span>{t('discount')}</span>
          <input {...moneyInputProps(form.discount, (value) => setForm({ ...form, discount: value }), form.currency, language)} />
        </label>
        <label className="field">
          <span>{t('adjustmentType')}</span>
          <select value={form.adjustmentType} onChange={(event) => setForm({ ...form, adjustmentType: event.target.value })}>
            <option value="discount">{t('discountOption')}</option>
            <option value="surcharge">{t('surchargeOption')}</option>
          </select>
        </label>
      </div>
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
          <Hourglass size={16} /> {t('carryoverApplied')}: {centsToMoney(service.carryover_cents, service.currency, language)}
        </div>
      ) : null}
      {service.adjustmentCents > 0 ? (
        <div className={service.adjustmentType === 'surcharge' ? 'surcharge-line' : 'discount-line'}>
          <Coins size={16} /> {t(service.adjustmentType === 'surcharge' ? 'surchargeApplied' : 'discountApplied')}: {centsToMoney(service.adjustmentCents, service.currency, language)}
        </div>
      ) : null}
      {service.entries.length ? service.entries.map((entry) => (
        <div className="table-row" key={entry.id}>
          <span>
            <strong>{entry.work_date}</strong>
            <small>{entry.start_time} às {entry.end_time} · {minutesToLabel(entry.minutes)}</small>
            {entry.notes ? <small>{entry.notes}</small> : null}
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
