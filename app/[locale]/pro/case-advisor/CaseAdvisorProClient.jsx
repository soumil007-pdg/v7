'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import {
  Scale, ArrowRight, Plus, Trash2, UploadCloud, Link as LinkIcon,
  Download, Search, Gavel, AlertTriangle, CheckCircle, FolderOpen,
  X, Clock, MapPin, ChevronRight, Loader,
} from 'lucide-react';
import '../CaseAdvisor.css';

/* ── Helpers ───────────────────────────────────────── */
const parseCitations = (text) => {
  if (!text) return [];
  const citations = [];
  const linkRegex = /(https?:\/\/[^\s\)]+)/g;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const pre = text.substring(Math.max(0, match.index - 10), match.index);
    if (!pre.endsWith('](')) citations.push({ type: 'link', title: match[1], href: match[1] });
  }
  const actRegex = /((?:Section|Article|Order|Rule)\s+\d+[A-Za-z]*|(?:The\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+Act(?:,\s+\d{4})?)/g;
  while ((match = actRegex.exec(text)) !== null) {
    if (!['The', 'Act', 'Section'].includes(match[0])) citations.push({ type: 'act', title: match[0], href: null });
  }
  const unique = [];
  const seen = new Set();
  citations.forEach(c => { if (!seen.has(c.title)) { seen.add(c.title); unique.push(c); } });
  return unique;
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const caseTypeColors = {
  contract: '#3B82F6',
  property: '#10B981',
  family:   '#8B5CF6',
  consumer: '#F59E0B',
  tort:     '#EF4444',
  other:    '#6B7280',
};

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry',
];

// STEPS built dynamically using translations in component

/* ── Main Component ────────────────────────────────── */
export default function CaseAdvisorProClient() {
  const { isLoggedIn, loading, userEmail } = useAuth(true);
  const locale = useLocale();
  const t = useTranslations('CaseAdvisorPro');
  const tc = useTranslations('CaseAdvisor');

  const STEPS = [
    { num: 1, label: t('step1Label'), sub: t('step1Sub') },
    { num: 2, label: t('step2Label'), sub: t('step2Sub') },
    { num: 3, label: t('step3Label'), sub: t('step3Sub') },
    { num: 4, label: t('step4Label'), sub: t('step4Sub') },
  ];

  /* Step & result state */
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCitations, setActiveCitations] = useState([]);

  /* Dynamic field state */
  const [witnesses, setWitnesses] = useState([]);
  const [evidence,  setEvidence]  = useState([]);

  /* History drawer */
  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [caseHistory,    setCaseHistory]    = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* Suit value display */
  const [displaySuitValue, setDisplaySuitValue] = useState('');

  /* Fetch history when email is ready */
  useEffect(() => {
    if (!userEmail) return;
    setHistoryLoading(true);
    fetch('/api/case-advisor/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    })
      .then(r => r.ok ? r.json() : { history: [] })
      .then(d => setCaseHistory(d.history || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [userEmail]);

  /* Form schema */
  const schema = useMemo(() => z.object({
    caseTitle:         z.string().min(1, 'Required'),
    plaintiffName:     z.string().min(1, 'Required'),
    defendantName:     z.string().min(1, 'Required'),
    caseType:          z.string().min(1, 'Required'),
    state:             z.string().min(1, 'Required'),
    city:              z.string().min(1, 'Required'),
    causeDate:         z.string().optional(),
    description:       z.string().min(10, 'Please describe the case'),
    reliefSought:      z.string().optional(),
    suitValue:         z.string().optional(),
    priorActions:      z.string().optional(),
    certificateStatus: z.string().optional(),
    witnesses: z.array(z.object({
      name:       z.string().min(1, 'Required'),
      connection: z.string().min(1, 'Required'),
      knowledge:  z.string().min(1, 'Required'),
    })).optional(),
    evidence: z.array(z.object({
      type:        z.enum(['documents','photos','testimony','other']),
      description: z.string().min(1, 'Required'),
      fileName:    z.string().optional(),
    })).optional(),
  }), []);

  const { register, handleSubmit, formState: { errors, dirtyFields }, watch, getValues, setValue, trigger } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      caseTitle:'', plaintiffName:'', defendantName:'', caseType:'', state:'', city:'',
      causeDate:'', description:'', reliefSought:'', suitValue:'', priorActions:'',
      certificateStatus:'', witnesses:[], evidence:[],
    },
  });

  /* Input class helper */
  const ic = (field, err) => {
    let base = 'ca-input';
    if (err) return base + ' error';
    const isDirty = typeof field === 'string'
      ? !!dirtyFields[field]
      : (field || '').split('.').reduce((o, k) => o?.[k], dirtyFields);
    return base + (isDirty ? ' valid' : '');
  };

  /* Suit value */
  const handleSuitValueChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 15) return;
    setValue('suitValue', raw, { shouldValidate: true });
    setDisplaySuitValue(raw ? new Intl.NumberFormat('en-IN').format(raw) : '');
  };

  /* Witness helpers */
  const addWitness = () => {
    const cur = getValues('witnesses') || [];
    const next = [...cur, { name:'', connection:'', knowledge:'' }];
    setValue('witnesses', next);
    setWitnesses(next);
  };
  const removeWitness = (i) => {
    const next = (getValues('witnesses') || []).filter((_,idx) => idx !== i);
    setValue('witnesses', next);
    setWitnesses(next);
  };

  /* Evidence helpers */
  const addEvidence = () => {
    const cur = getValues('evidence') || [];
    const next = [...cur, { type:'documents', description:'', fileName:'' }];
    setValue('evidence', next);
    setEvidence(next);
  };
  const removeEvidence = (i) => {
    const next = (getValues('evidence') || []).filter((_,idx) => idx !== i);
    setValue('evidence', next);
    setEvidence(next);
  };
  const handleFileChange = (e, i) => {
    const f = e.target.files[0];
    if (f) setValue(`evidence.${i}.fileName`, f.name);
  };
  const handleCertFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setValue('certificateStatus', `Have Certificate: ${f.name}`);
  };

  /* Step validation */
  const nextStep = async () => {
    let fields = [];
    if (step === 1) fields = ['caseTitle','plaintiffName','defendantName','caseType','state','city'];
    if (step === 2) fields = ['description'];
    const ok = await trigger(fields);
    if (ok) setStep(s => s + 1);
    else toast.error(t('fillRequired'));
  };

  /* Submit */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setResult('');
    setActiveCitations([]);
    setStep(4);

    try {
      const payload = {
        ...data,
        locale,
        email: userEmail,
        certificateFile: data.certificateFile?.[0]?.name || 'Not uploaded',
        evidence: (data.evidence || []).map(item => ({
          type: item.type,
          description: item.description,
          attachedFile: item.fileName || 'No file attached',
        })),
      };

      const res = await fetch('/api/case-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const apiData = await res.json();

      if (res.ok) {
        setResult(apiData.text);
        setActiveCitations(parseCitations(apiData.text));
        toast.success(tc('toasts.success'));
        /* Refresh history */
        if (userEmail) {
          fetch('/api/case-advisor/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
          })
            .then(r => r.ok ? r.json() : { history: [] })
            .then(d => setCaseHistory(d.history || []))
            .catch(() => {});
        }
      } else {
        toast.error(apiData.message || tc('toasts.failed'));
        setStep(3);
      }
    } catch {
      toast.error(tc('toasts.error'));
      setStep(3);
    }
    setIsSubmitting(false);
  };

  const onError = () => toast.error(t('fillRequired'));

  /* Load from history */
  const loadFromHistory = (entry) => {
    setResult(entry.result);
    setActiveCitations(parseCitations(entry.result));
    setStep(4);
    setHistoryOpen(false);
  };

  /* Export PDF */
  const handleExportPDF = () => {
    if (!result) { toast.error(tc('toasts.noAnalysis')); return; }
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(13, 22, 37);
    doc.text('ADVOCAT-Easy — Case Brief', pw / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Strategic Analysis', pw / 2, y, { align: 'center' });
    y += 10;
    doc.setLineWidth(0.4);
    doc.setDrawColor(200);
    doc.line(margin, y, pw - margin, y);
    y += 10;

    result.split('\n').forEach(line => {
      if (y > 275) { doc.addPage(); y = 20; }
      const clean = line.replace(/\*\*/g, '').replace(/###/g, '').trim();
      if (line.startsWith('###')) {
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(13, 22, 37);
        doc.text(clean, margin, y);
        y += 8;
      } else if (line.includes('**')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0);
        const wrapped = doc.splitTextToSize(clean, pw - 2 * margin);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 6 + 2;
      } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(50);
        const wrapped = doc.splitTextToSize(`• ${clean.replace(/^[\*\-]\s*/, '')}`, pw - 2 * margin);
        doc.text(wrapped, margin + 2, y);
        y += wrapped.length * 6 + 2;
      } else if (clean) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(20);
        const wrapped = doc.splitTextToSize(clean, pw - 2 * margin);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 6 + 2;
      } else {
        y += 4;
      }
    });

    doc.save(`${getValues('caseTitle') || 'Advocat_Brief'}.pdf`);
    toast.success(tc('toasts.pdfSuccess'));
  };

  const handleDirectoryRoute = () => {
    const city = encodeURIComponent(getValues('city') || '');
    const cat  = encodeURIComponent(getValues('caseType') || '');
    window.open(`/${locale}/directory?city=${city}&category=${cat}`, '_blank');
  };

  const resetAll = () => {
    setStep(1);
    setResult('');
    setActiveCitations([]);
    setWitnesses([]);
    setEvidence([]);
  };

  /* ── Auth guard ────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1117', color: 'rgba(255,255,255,0.4)', gap: 12 }}>
        <Loader size={18} style={{ animation: 'ca-spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13 }}>Loading…</span>
        <style>{`@keyframes ca-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }
  if (!isLoggedIn) return null;

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="ca-page">
      <div className="ca-layout">

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className="ca-sidebar">
          <div className="ca-sidebar-logo">
            <h2>ADVOCAT-Easy</h2>
            <p>{t('sidebarSubtitle')}</p>
          </div>

          <nav className="ca-step-nav">
            {STEPS.map(s => (
              <div
                key={s.num}
                className={`ca-step-item ${step === s.num ? 'active' : step > s.num ? 'done' : 'locked'}`}
              >
                <div className="ca-step-num">
                  {step > s.num ? <CheckCircle size={13} /> : s.num}
                </div>
                <div className="ca-step-label">
                  <strong>{s.label}</strong>
                  <span>{s.sub}</span>
                </div>
              </div>
            ))}
          </nav>

          {/* Dossiers + New Case buttons at bottom */}
          <div className="ca-sidebar-footer" style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="ca-dossier-btn"
              onClick={() => setHistoryOpen(true)}
              style={{ flex: 1 }}
            >
              <FolderOpen size={14} />
              {t('caseDossiers')}
              {caseHistory.length > 0 && (
                <span className="ca-badge">{caseHistory.length}</span>
              )}
            </button>
            <button
              type="button"
              title={t('newBtn')}
              onClick={resetAll}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <Plus size={13} /> {t('newBtn')}
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────── */}
        <main className="ca-main">
          <div className="ca-main-header">
            <p className="ca-tag">{tc('header.step', { step })}</p>
            <h1>
              {step === 1 && t('step1Label')}
              {step === 2 && t('step2Label')}
              {step === 3 && t('step3Label')}
              {step === 4 && t('step4Label')}
            </h1>
            <p>
              {step === 1 && t('stepSub1')}
              {step === 2 && t('stepSub2')}
              {step === 3 && t('stepSub3')}
              {step === 4 && (isSubmitting ? t('stepSub4Loading') : t('stepSub4'))}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)}>

            {/* ── Step 1 ─────────────────────────────── */}
            {step === 1 && (
              <div className="ca-form-card">
                <h3>{t('step1FormTitle')}</h3>

                <div className="ca-field-grid">
                  <div className="ca-field">
                    <label className="ca-label">{t('caseTitleLabel')} *</label>
                    <input {...register('caseTitle')} placeholder={t('caseTitlePh')} className={ic('caseTitle', errors.caseTitle)} />
                  </div>
                  <div className="ca-field">
                    <label className="ca-label">{t('categoryLabel')} *</label>
                    <select {...register('caseType')} className={ic('caseType', errors.caseType).replace('ca-input','ca-select')}>
                      <option value="">{t('selectCategory')}</option>
                      <option value="contract">{tc('step1.catContract')}</option>
                      <option value="property">{tc('step1.catProperty')}</option>
                      <option value="family">{tc('step1.catFamily')}</option>
                      <option value="consumer">{tc('step1.catConsumer')}</option>
                      <option value="tort">{tc('step1.catTort')}</option>
                      <option value="other">{tc('step1.catOther')}</option>
                    </select>
                  </div>
                </div>

                <div className="ca-field-grid">
                  <div className="ca-field">
                    <label className="ca-label">{t('plaintiffLabel')} *</label>
                    <input {...register('plaintiffName')} placeholder={t('plaintiffPh')} className={ic('plaintiffName', errors.plaintiffName)} />
                  </div>
                  <div className="ca-field">
                    <label className="ca-label">{t('defendantLabel')} *</label>
                    <input {...register('defendantName')} placeholder={t('defendantPh')} className={ic('defendantName', errors.defendantName)} />
                  </div>
                </div>

                <div className="ca-field-grid">
                  <div className="ca-field">
                    <label className="ca-label">{t('stateLabel')} *</label>
                    <select {...register('state')} className={ic('state', errors.state).replace('ca-input','ca-select')}>
                      <option value="">{t('selectState')}</option>
                      {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="ca-field">
                    <label className="ca-label">{t('cityLabel')} *</label>
                    <input {...register('city')} placeholder={tc('step1.cityPh')} className={ic('city', errors.city)} />
                  </div>
                </div>

                <div className="ca-btn-row">
                  <button type="button" className="ca-btn ca-btn-primary" onClick={nextStep}>
                    {t('continueBtn')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2 ─────────────────────────────── */}
            {step === 2 && (
              <div className="ca-form-card">
                <h3>{t('step2FormTitle')}</h3>

                <div className="ca-field-grid full">
                  <div className="ca-field">
                    <label className="ca-label">{t('factsLabel')} *</label>
                    <textarea {...register('description')} rows={6} placeholder={t('factsPh')} className={ic('description', errors.description).replace('ca-input','ca-textarea')} />
                  </div>
                </div>

                <div className="ca-field-grid full">
                  <div className="ca-field">
                    <label className="ca-label">{t('reliefLabel')}</label>
                    <textarea {...register('reliefSought')} rows={3} placeholder={t('reliefPh')} className="ca-textarea" />
                  </div>
                </div>

                <div className="ca-field-grid">
                  <div className="ca-field">
                    <label className="ca-label">{t('causeDateLabel')}</label>
                    <input type="date" {...register('causeDate')} className="ca-input" />
                  </div>
                  <div className="ca-field">
                    <label className="ca-label">{t('suitValueLabel')}</label>
                    <input value={displaySuitValue} onChange={handleSuitValueChange} placeholder={t('suitValuePh')} className="ca-input" />
                  </div>
                </div>

                <div className="ca-field-grid full">
                  <div className="ca-field">
                    <label className="ca-label">{t('priorActionsLabel')}</label>
                    <textarea {...register('priorActions')} rows={2} placeholder={t('priorActionsPh')} className="ca-textarea" />
                  </div>
                </div>

                <div className="ca-btn-row">
                  <button type="button" className="ca-btn ca-btn-ghost" onClick={() => setStep(1)}>{t('backBtn')}</button>
                  <button type="button" className="ca-btn ca-btn-primary" onClick={nextStep}>
                    {t('continueBtn')} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3 ─────────────────────────────── */}
            {step === 3 && (
              <div className="ca-form-card">
                <h3>{t('step3FormTitle')}</h3>

                {/* Evidence */}
                <div className="ca-section-header">
                  <span className="ca-section-label blue">{t('evidenceSectionLabel')}</span>
                  <button type="button" className="ca-add-btn blue" onClick={addEvidence}>
                    <Plus size={12} /> {t('addEvidenceBtn')}
                  </button>
                </div>

                {evidence.length === 0 && (
                  <div className="ca-empty-state" style={{ marginBottom: 20 }}>{t('noEvidence')}</div>
                )}

                {evidence.map((_, i) => (
                  <div key={i} className="ca-evidence-block">
                    <button type="button" className="ca-remove-btn" onClick={() => removeEvidence(i)}>
                      <Trash2 size={14} />
                    </button>
                    <div className="ca-field-grid" style={{ marginBottom: 10 }}>
                      <div className="ca-field">
                        <label className="ca-label">{t('typeLabel')}</label>
                        <select {...register(`evidence.${i}.type`)} className="ca-select">
                          <option value="documents">{tc('step3.typeDoc')}</option>
                          <option value="photos">{tc('step3.typePhoto')}</option>
                          <option value="testimony">{tc('step3.typeStmt')}</option>
                          <option value="other">{tc('step3.typeOther')}</option>
                        </select>
                      </div>
                      <div className="ca-field">
                        <label className="ca-label">{t('attachFileLabel')}</label>
                        <label className="ca-file-label">
                          <UploadCloud size={15} />
                          {watch(`evidence.${i}.fileName`) || t('chooseFile')}
                          <input type="file" style={{ display: 'none' }} onChange={e => handleFileChange(e, i)} />
                        </label>
                      </div>
                    </div>
                    <div className="ca-field">
                      <label className="ca-label">{t('descriptionLabel')} *</label>
                      <input {...register(`evidence.${i}.description`)} placeholder={t('describeEvidencePh')} className={ic(`evidence.${i}.description`, errors.evidence?.[i]?.description)} />
                    </div>
                  </div>
                ))}

                {/* Witnesses */}
                <div className="ca-section-header" style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="ca-section-label green">{t('witnessesSectionLabel')}</span>
                  <button type="button" className="ca-add-btn green" onClick={addWitness}>
                    <Plus size={12} /> {t('addWitnessBtn')}
                  </button>
                </div>

                {witnesses.length === 0 && (
                  <div className="ca-empty-state" style={{ marginBottom: 20 }}>{t('noWitnesses')}</div>
                )}

                {witnesses.map((_, i) => (
                  <div key={i} className="ca-witness-block">
                    <button type="button" className="ca-remove-btn" onClick={() => removeWitness(i)}>
                      <Trash2 size={14} />
                    </button>
                    <div className="ca-field-grid" style={{ marginBottom: 10 }}>
                      <div className="ca-field">
                        <label className="ca-label">{t('nameLabel')} *</label>
                        <input {...register(`witnesses.${i}.name`)} placeholder={t('witnessNamePh')} className={ic(`witnesses.${i}.name`, errors.witnesses?.[i]?.name)} />
                      </div>
                      <div className="ca-field">
                        <label className="ca-label">{t('relationshipLabel')} *</label>
                        <input {...register(`witnesses.${i}.connection`)} placeholder={t('witnessRelPh')} className={ic(`witnesses.${i}.connection`, errors.witnesses?.[i]?.connection)} />
                      </div>
                    </div>
                    <div className="ca-field">
                      <label className="ca-label">{t('witnessKnowLabel')} *</label>
                      <input {...register(`witnesses.${i}.knowledge`)} placeholder={t('witnessKnowPh')} className={ic(`witnesses.${i}.knowledge`, errors.witnesses?.[i]?.knowledge)} />
                    </div>
                  </div>
                ))}

                {/* 65B Warning */}
                <div className="ca-warning-box">
                  <h4><AlertTriangle size={13} /> {t('sec65bTitle')}</h4>
                  <p>{t('sec65bDesc')}</p>
                  <div className="ca-radio-group">
                    <label className="ca-radio-label">
                      <input type="radio" name="has65B" onChange={() => setValue('certificateStatus', 'Have Certificate')} />
                      {t('sec65bHave')}
                    </label>
                    <label className="ca-radio-label">
                      <input type="radio" name="has65B" onChange={() => setValue('certificateStatus', 'Need Drafting')} />
                      {t('sec65bNeed')}
                    </label>
                  </div>

                  {watch('certificateStatus')?.includes('Have Certificate') && (
                    <label className="ca-file-label">
                      <UploadCloud size={15} />
                      {watch('certificateFile')?.[0]?.name || t('sec65bUpload')}
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }} onChange={handleCertFileChange} />
                    </label>
                  )}

                  {watch('certificateStatus') === 'Need Drafting' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(234,179,8,0.7)', marginTop: 6 }}>
                      <CheckCircle size={13} />
                      {t('sec65bNoted')}
                    </div>
                  )}
                </div>

                <div className="ca-btn-row" style={{ marginTop: 28 }}>
                  <button type="button" className="ca-btn ca-btn-ghost" onClick={() => setStep(2)}>{t('backBtn')}</button>
                  <button type="submit" className="ca-btn ca-btn-primary" style={{ flex: 1 }}>
                    {t('generateBriefBtn')} <Scale size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Result ──────────────────────── */}
            {step === 4 && (
              <div className="ca-result-layout">

                {/* Document body */}
                <div className="ca-result-body">
                  <div className="ca-result-header">
                    <div>
                      <h2>{t('step4FormTitle')}</h2>
                      <p>{t('preparedForLabel')} <strong>{getValues('plaintiffName') || 'Client'}</strong> · {getValues('caseTitle') || 'Case'}</p>
                    </div>
                    <Scale size={36} style={{ color: '#D4AF37', flexShrink: 0 }} />
                  </div>

                  <div className="ca-prose">
                    {isSubmitting ? (
                      <div className="ca-loading-row">
                        <div className="ca-spinner" />
                        <span>{t('analysingCase')}</span>
                      </div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                          ),
                        }}
                      >{result}</ReactMarkdown>
                    )}
                  </div>

                  {/* Find Lawyer widget */}
                  {!isSubmitting && result && (
                    <div className="ca-directory-widget">
                      <div className="ca-directory-inner">
                        <div>
                          <h3><Search size={18} style={{ color: '#D4AF37' }} /> {t('findLawyerTitle')}</h3>
                          <p>{t('findLawyerDesc', { type: getValues('caseType') || 'legal', city: getValues('city') || 'your area' })}</p>
                        </div>
                        <button type="button" className="ca-directory-btn" onClick={handleDirectoryRoute}>
                          {t('searchDirectoryBtn')} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reference rail */}
                <div className="ca-result-rail">
                  <div className="ca-rail-title">
                    <LinkIcon size={12} /> {t('citationsLabel')}
                  </div>

                  <div className="ca-citation-list">
                    {isSubmitting ? (
                      <div className="ca-loading-row" style={{ color: '#94a3b8', fontSize: 12 }}>
                        <div style={{ width:14, height:14, border:'1.5px solid #e2e8f0', borderTopColor:'#475569', borderRadius:'50%', animation:'ca-spin 0.8s linear infinite', flexShrink:0 }} />
                        {t('loadingCitations')}
                      </div>
                    ) : activeCitations.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>{t('noCitations')}</p>
                    ) : (
                      activeCitations.map((c, i) => (
                        <div key={i} className="ca-citation-item">
                          {c.type === 'link' ? (
                            <a href={c.href} target="_blank" rel="noreferrer" className="ca-citation-link">
                              <LinkIcon size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                              <span>{c.title}</span>
                            </a>
                          ) : (
                            <div className="ca-citation-act">
                              <Gavel size={12} style={{ color: '#7c3aed', marginTop: 2, flexShrink: 0 }} />
                              <span>{c.title}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="ca-rail-actions">
                    <button type="button" className="ca-rail-btn dark" onClick={handleExportPDF} disabled={isSubmitting || !result}>
                      <Download size={14} /> {t('downloadPdfBtn')}
                    </button>
                    <button type="button" className="ca-rail-btn outline" onClick={resetAll}>
                      {t('newAnalysisBtn')}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </form>
        </main>
      </div>

      {/* ── History Drawer ──────────────────────────────── */}
      {historyOpen && (
        <div className="ca-drawer-backdrop" onClick={() => setHistoryOpen(false)} />
      )}

      <div className={`ca-drawer ${historyOpen ? 'open' : 'closed'}`}>
        <div className="ca-drawer-header">
          <div className="ca-drawer-header-row">
            <div className="ca-drawer-title">
              <FolderOpen size={17} style={{ color: '#D4AF37' }} />
              {t('drawerTitle')}
            </div>
            <button className="ca-drawer-close" onClick={() => setHistoryOpen(false)}>
              <X size={17} />
            </button>
          </div>
          <p className="ca-drawer-subtitle">
            {caseHistory.length !== 1
              ? t('casesOnRecordPlural', { count: caseHistory.length })
              : t('casesOnRecord', { count: caseHistory.length })}
          </p>
        </div>

        <div className="ca-drawer-body">
          {historyLoading ? (
            <div className="ca-loading-row" style={{ justifyContent: 'center', marginTop: 40 }}>
              <div className="ca-spinner" /> {t('loadingDossiers')}
            </div>
          ) : caseHistory.length === 0 ? (
            <div className="ca-drawer-empty">
              <FolderOpen size={36} style={{ opacity: 0.25 }} />
              <p>{t('noCasesRecord')}<br />{t('noCasesRecordSub')}</p>
            </div>
          ) : (
            caseHistory.map(entry => {
              const tc = caseTypeColors[entry.caseType] || caseTypeColors.other;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="ca-dossier-card"
                  style={{ borderLeft: `3px solid ${tc}` }}
                  onClick={() => loadFromHistory(entry)}
                >
                  <div className="ca-dossier-title-row">
                    <span className="ca-dossier-title">{entry.caseTitle}</span>
                    <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2 }} />
                  </div>

                  <div className="ca-dossier-meta">
                    {entry.caseType && (
                      <span
                        className="ca-type-badge"
                        style={{ backgroundColor: `${tc}20`, color: tc }}
                      >
                        {entry.caseType}
                      </span>
                    )}
                    {entry.city && (
                      <span className="ca-dossier-location">
                        <MapPin size={9} />
                        {entry.city}{entry.state ? `, ${entry.state}` : ''}
                      </span>
                    )}
                  </div>

                  {entry.reliefSought && (
                    <p className="ca-dossier-relief">{entry.reliefSought}</p>
                  )}

                  <div className="ca-dossier-time">
                    <Clock size={9} /> {timeAgo(entry.createdAt)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <style>{`@keyframes ca-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
