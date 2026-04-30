'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import { AnalysisSkeleton, CitationSkeleton } from '@/app/components/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProgressBar } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Download, Link as LinkIcon, ArrowRight, Plus, Trash2,
  UploadCloud, FileText, Scale, CheckCircle, AlertTriangle, Gavel, MapPin, Star, Search,
  FolderOpen, X, Clock, ChevronRight
} from 'lucide-react';

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600;800&display=swap');
    .prose-brief { font-family: 'Merriweather', serif; color: #334155; line-height: 1.8; font-size: 1.05rem; }
    .prose-brief h1, .prose-brief h2, .prose-brief h3 { font-family: 'Inter', sans-serif; color: #171717; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.6em; letter-spacing: -0.02em; }
    .prose-brief h3 { font-size: 1.25rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
    .prose-brief strong { color: #000; font-weight: 700; }
    .prose-brief ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 1em; }
    .prose-brief li { margin-bottom: 0.4em; }
    .prose-brief a { color: #FF5B33; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 2px; font-weight: 600; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  `}</style>
);

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
    if (!['The', 'Act', 'Section'].includes(match[0])) { citations.push({ type: 'act', title: match[0], href: null }); }
  }
  const unique = [];
  const seen = new Set();
  citations.forEach(c => { if (!seen.has(c.title)) { seen.add(c.title); unique.push(c); }});
  return unique;
};

const indianStates = [
  { name: 'Andhra Pradesh' }, { name: 'Arunachal Pradesh' }, { name: 'Assam' }, { name: 'Bihar' }, 
  { name: 'Chhattisgarh' }, { name: 'Goa' }, { name: 'Gujarat' }, { name: 'Haryana' }, 
  { name: 'Himachal Pradesh' }, { name: 'Jharkhand' }, { name: 'Karnataka' }, { name: 'Kerala' }, 
  { name: 'Madhya Pradesh' }, { name: 'Maharashtra' }, { name: 'Manipur' }, { name: 'Meghalaya' }, 
  { name: 'Mizoram' }, { name: 'Nagaland' }, { name: 'Odisha' }, { name: 'Punjab' }, 
  { name: 'Rajasthan' }, { name: 'Sikkim' }, { name: 'Tamil Nadu' }, { name: 'Telangana' }, 
  { name: 'Tripura' }, { name: 'Uttar Pradesh' }, { name: 'Uttarakhand' }, { name: 'West Bengal' }, 
  { name: 'Delhi' }, { name: 'Jammu and Kashmir' }, { name: 'Ladakh' }, { name: 'Puducherry' }
];

export default function CaseAdvisorClient() {
  const { isLoggedIn, loading, userEmail } = useAuth(true); 
  const t = useTranslations('CaseAdvisor');
  const locale = useLocale(); 

  const schema = useMemo(() => z.object({
    caseTitle: z.string().min(1, t('toasts.reqErr')),
    plaintiffName: z.string().min(1, t('toasts.reqErr')),
    defendantName: z.string().min(1, t('toasts.reqErr')),
    caseType: z.string().min(1, t('toasts.reqErr')),
    state: z.string().min(1, t('toasts.reqErr')),
    city: z.string().min(1, t('toasts.reqErr')),
    causeDate: z.string().optional(),
    description: z.string().min(10, t('toasts.reqErr')),
    reliefSought: z.string().optional(), 
    suitValue: z.string().optional(),
    priorActions: z.string().optional(),
    certificateStatus: z.string().optional(),
    certificateFile: z.any().optional(),
    witnesses: z.array(z.object({
      name: z.string().min(1, t('toasts.witErr')),
      connection: z.string().min(1, t('toasts.witErr')),
      knowledge: z.string().min(1, t('toasts.witErr')),
    })).optional(),
    evidence: z.array(z.object({
      type: z.enum(['documents', 'photos', 'testimony', 'other']),
      description: z.string().min(1, t('toasts.evErr')),
      fileName: z.string().optional() 
    })).optional(),
  }), [t]);

  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [witnesses, setWitnesses] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [activeCitations, setActiveCitations] = useState([]);
  const router = useRouter();

  // ── Case History Drawer ──────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [caseHistory, setCaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const caseTypeColors = {
    contract: '#3B82F6',
    property: '#10B981',
    family:   '#8B5CF6',
    consumer: '#F59E0B',
    tort:     '#EF4444',
    other:    '#6B7280',
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

  useEffect(() => {
    if (!userEmail) return;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/case-advisor/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          setCaseHistory(data.history || []);
        }
      } catch (_) {}
      finally { setHistoryLoading(false); }
    };
    fetchHistory();
  }, [userEmail]);

  const loadFromHistory = (entry) => {
    setResult(entry.result);
    setActiveCitations(parseCitations(entry.result));
    setStep(4);
    setHistoryOpen(false);
  };

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', 
    defaultValues: {
      caseTitle: '', plaintiffName: '', defendantName: '', caseType: '', state: '', city: '',
      causeDate: '', description: '', reliefSought: '', suitValue: '',
      priorActions: '', certificateStatus: '', certificateFile: null,
      witnesses: [], evidence: [],
    },
  });
  
  const { register, handleSubmit, formState: { errors, dirtyFields }, watch, getValues, setValue, trigger } = methods;

  const [displaySuitValue, setDisplaySuitValue] = useState('');
  const handleSuitValueChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 15) return;
    setValue('suitValue', rawValue, { shouldValidate: true });
    setDisplaySuitValue(rawValue ? new Intl.NumberFormat('en-IN').format(rawValue) : '');
  };

  const addWitness = () => {
    const current = getValues('witnesses') || [];
    setValue('witnesses', [...current, { name: '', connection: '', knowledge: '' }]);
    setWitnesses([...current, {}]);
  };
  const removeWitness = (index) => {
    const current = getValues('witnesses');
    const updated = current.filter((_, i) => i !== index);
    setValue('witnesses', updated);
    setWitnesses(updated);
  };

  const addEvidence = () => {
    const current = getValues('evidence') || [];
    setValue('evidence', [...current, { type: 'documents', description: '', fileName: '' }]);
    setEvidence([...current, {}]);
  };
  const removeEvidence = (index) => {
    const current = getValues('evidence');
    const updated = current.filter((_, i) => i !== index);
    setValue('evidence', updated);
    setEvidence(updated);
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) setValue(`evidence.${index}.fileName`, file.name);
  };

  const handleCertFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('certificateStatus', `Have Certificate: ${file.name}`);
      setValue('certificateFile', e.target.files);
    }
  };

  const getInputClass = (fieldName, isError) => {
    const base = "w-full p-3 border rounded-lg bg-gray-800 text-white focus:outline-none transition-all duration-200 ";
    if (isError) return base + "border-red-500 focus:ring-2 focus:ring-red-500";
    
    let isDirty = false;
    if (typeof fieldName === 'string') isDirty = dirtyFields[fieldName];
    else if (Array.isArray(fieldName)) isDirty = fieldName.some(f => dirtyFields[f]);

    if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        let current = dirtyFields;
        for (const part of parts) {
            if (current && current[part]) current = current[part];
            else { current = undefined; break; }
        }
        if (current) isDirty = true;
    }

    if (isDirty) return base + "border-green-500 focus:ring-2 focus:ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
    return base + "border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500";
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setResult('');
    setActiveCitations([]);
    setStep(4);

    try {
      const payload = {
        ...data,
        locale: locale,
        email: userEmail,
        certificateFile: data.certificateFile?.[0]?.name || "Not uploaded",
        evidence: data.evidence?.map(item => ({
          type: item.type,
          description: item.description,
          attachedFile: item.fileName || "No file attached"
        }))
      };

      const res = await fetch('/api/case-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });
      const apiData = await res.json();
      
      if (res.ok) {
        setResult(apiData.text);
        const citations = parseCitations(apiData.text);
        setActiveCitations(citations);
        toast.success(t('toasts.success'));
      } else {
        toast.error(apiData.message || t('toasts.failed'));
        setStep(3); 
      }
    } catch (err) {
      toast.error(t('toasts.error'));
      setStep(3);
    }
    setIsLoading(false);
  };

  const onError = (errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    const errorMsg = errors[firstErrorKey]?.message || t('toasts.reqErr');
    if (firstErrorKey === 'witnesses') toast.error(t('toasts.witErr'));
    else if (firstErrorKey === 'evidence') toast.error(t('toasts.evErr'));
    else toast.error(errorMsg);
  };

  const nextStep = async () => {
    let fields = [];
    if (step === 1) fields = ['caseTitle', 'plaintiffName', 'defendantName', 'caseType', 'state', 'city'];
    if (step === 2) fields = ['description'];
    
    const isValid = await trigger(fields);
    if (isValid) setStep(s => s + 1);
    else toast.error(t('toasts.reqErr'));
  };

  const handleExportPDF = () => {
    if (!result) { toast.error(t('toasts.noAnalysis')); return; }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    let yPos = 20; 

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("Advocat-Easy Case Report", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Strategic Analysis & Roadmap", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 6;
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`Case: ${getValues('caseTitle') || 'Untitled Case'}`, margin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Client: ${getValues('plaintiffName')} | Opponent: ${getValues('defendantName')}`, margin, yPos);
    yPos += 10;

    const splitText = result.split('\n');
    doc.setFontSize(11);
    
    splitText.forEach(line => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        const cleanLine = line.replace(/\*\*/g, '').replace(/###/g, '').trim();

        if (line.startsWith('###')) {
            yPos += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text(cleanLine, margin, yPos);
            yPos += 2;
            doc.setDrawColor(44, 62, 80);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, margin + 80, yPos);
            yPos += 8;
        } else if (line.includes('**')) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0);
            const wrappedText = doc.splitTextToSize(cleanLine, maxLineWidth);
            doc.text(wrappedText, margin, yPos);
            yPos += (wrappedText.length * 6) + 2;
        } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(50);
            const bulletText = `•  ${cleanLine.replace(/^[\*\-]\s*/, '')}`;
            const wrappedText = doc.splitTextToSize(bulletText, maxLineWidth);
            doc.text(wrappedText, margin + 2, yPos);
            yPos += (wrappedText.length * 6) + 2;
        } else if (line.trim().length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(20);
            const wrappedText = doc.splitTextToSize(cleanLine, maxLineWidth);
            doc.text(wrappedText, margin, yPos);
            yPos += (wrappedText.length * 6) + 2;
        } else {
            yPos += 4;
        }
    });

    doc.save(`${getValues('caseTitle') || 'Advocat_Report'}.pdf`);
    toast.success(t('toasts.pdfSuccess'));
  };

  const handleDirectoryRoute = () => {
      const city = encodeURIComponent(getValues('city') || '');
      const category = encodeURIComponent(getValues('caseType') || '');
      // Opens directory in a NEW TAB so you never lose the generated report
      window.open(`/${locale}/directory?city=${city}&category=${category}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">Loading...</div>;
  if (!isLoggedIn) return null;

  return (
    <>
      <FontLoader />
      <div className="min-h-screen w-full bg-[#121212] text-white py-20 pb-20 font-sans">
        
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <Gavel className="text-[#FF5B33]" size={32} />
                {t('header.title') || "Case Advisor"}
             </h1>
             <div className="flex items-center gap-3">
               <div className="text-sm text-gray-400 font-mono">{t('header.step', { step }) || `Step ${step} of 4`}</div>
               <button
                 type="button"
                 onClick={() => { setStep(1); methods.reset(); setWitnesses([]); setEvidence([]); }}
                 className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                 style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                 title="Start a new case"
               >
                 <Plus size={14} /> New Case
               </button>
               <button
                 type="button"
                 onClick={() => setHistoryOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                 style={{ backgroundColor: 'rgba(255,91,51,0.1)', border: '1px solid rgba(255,91,51,0.25)', color: '#FF5B33' }}
               >
                 <FolderOpen size={15} />
                 Case Dossiers
                 {caseHistory.length > 0 && (
                   <span style={{ backgroundColor: '#FF5B33', color: 'white', borderRadius: 999, fontSize: 10, padding: '1px 7px', fontWeight: 700 }}>
                     {caseHistory.length}
                   </span>
                 )}
               </button>
             </div>
          </div>
          
          <ProgressBar value={(step / 4) * 100} className="mb-8" />
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            
            {step < 4 && (
                <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold border-b border-gray-700 pb-4 mb-6 text-white">{t('step1.title') || "Basic Information"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.caseName') || "Case Title"}</label>
                                <Input {...register('caseTitle')} className={getInputClass('caseTitle', errors.caseTitle)} placeholder={t('step1.caseNamePh') || "e.g. Property Dispute"} />
                                </div>
                                <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.category') || "Category"}</label>
                                <select {...register('caseType')} className={getInputClass('caseType', errors.caseType)}>
                                    <option value="">{t('step1.catSelect') || "Select Category"}</option>
                                    <option value="contract">{t('step1.catContract') || "Contract"}</option>
                                    <option value="property">{t('step1.catProperty') || "Property"}</option>
                                    <option value="family">{t('step1.catFamily') || "Family"}</option>
                                    <option value="consumer">{t('step1.catConsumer') || "Consumer"}</option>
                                    <option value="tort">{t('step1.catTort') || "Tort"}</option>
                                    <option value="other">{t('step1.catOther') || "Other"}</option>
                                </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.yourName') || "Your Name"}</label>
                                    <Input {...register('plaintiffName')} placeholder={t('step1.yourNamePh') || "Full Name"} className={getInputClass('plaintiffName', errors.plaintiffName)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.opponent') || "Opponent"}</label>
                                    <Input {...register('defendantName')} placeholder={t('step1.opponentPh') || "Opponent Name"} className={getInputClass('defendantName', errors.defendantName)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.state') || "State"}</label>
                                    <select {...register('state')} className={getInputClass('state', errors.state)}>
                                    <option value="">{t('step1.stateSelect') || "Select State"}</option>
                                    {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step1.city') || "City"}</label>
                                    <Input {...register('city')} placeholder={t('step1.cityPh') || "e.g. Mumbai"} className={getInputClass('city', errors.city)} />
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="button" variant="brand" size="xl" onClick={nextStep} className="w-full justify-center hover:shadow-[0_0_20px_rgba(255,91,51,0.3)]">{t('step1.nextBtn') || "Next"} <ArrowRight size={20}/></Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold border-b border-gray-700 pb-4 mb-6 text-white">{t('step2.title') || "Case Details"}</h3>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step2.whatHappened') || "What Happened?"}</label>
                                <Textarea {...register('description')} rows={6} placeholder={t('step2.whatHappenedPh') || "Describe the timeline..."} className={getInputClass('description', errors.description)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step2.outcome') || "Relief Sought"}</label>
                                <Textarea {...register('reliefSought')} rows={2} placeholder={t('step2.outcomePh') || "What do you want to achieve?"} className={getInputClass('reliefSought', errors.reliefSought)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step2.startDate') || "Cause Date"}</label>
                                    <Input type="date" lang="en-GB" {...register('causeDate')} className={getInputClass('causeDate', errors.causeDate)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">{t('step2.value') || "Suit Value"}</label>
                                    <Input value={displaySuitValue} onChange={handleSuitValueChange} placeholder={t('step2.valuePh') || "Amount in INR"} className={getInputClass('suitValue', errors.suitValue)} />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-semibold text-white">{t('step2.backBtn') || "Back"}</button>
                                <Button type="button" variant="brand" size="xl" onClick={nextStep} className="w-2/3 justify-center">{t('step2.nextBtn') || "Next"}</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold border-b border-gray-700 pb-4 mb-6 text-white">{t('step3.title') || "Evidence & Witnesses"}</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-blue-400 uppercase tracking-wider">{t('step3.evLabel') || "Evidence"}</label>
                                    <button type="button" onClick={addEvidence} className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1 rounded hover:bg-blue-900/50 flex items-center gap-1"><Plus size={14}/> {t('step3.addBtn') || "Add File"}</button>
                                </div>
                                {evidence.length === 0 && <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center text-gray-500 text-sm">{t('step3.noEv') || "No evidence added."}</div>}
                                {evidence.map((e, i) => (
                                    <div key={i} className="p-4 bg-[#121212] border border-gray-700 rounded-xl space-y-3 relative">
                                        <button type="button" onClick={() => removeEvidence(i)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <select {...register(`evidence.${i}.type`)} className={getInputClass(`evidence.${i}.type`, false)}>
                                                <option value="documents">{t('step3.typeDoc') || "Document"}</option>
                                                <option value="photos">{t('step3.typePhoto') || "Photo"}</option>
                                                <option value="testimony">{t('step3.typeStmt') || "Statement"}</option>
                                                <option value="other">{t('step3.typeOther') || "Other"}</option>
                                            </select>
                                            <div className="md:col-span-2">
                                                <label className="flex items-center justify-center w-full p-3 border border-gray-600 bg-[#1E1E1E] rounded-lg cursor-pointer hover:border-[#FF5B33] transition group">
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors truncate">
                                                        <UploadCloud size={18} /> {watch(`evidence.${i}.fileName`) || t('step3.attachProof') || 'Attach Proof'}
                                                    </div>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                                                </label>
                                            </div>
                                        </div>
                                        <Input {...register(`evidence.${i}.description`)} placeholder={t('step3.proofDescPh') || "Description"} className={getInputClass(`evidence.${i}.description`, errors.evidence?.[i]?.description)} />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-green-400 uppercase tracking-wider">{t('step3.witLabel') || "Witnesses"}</label>
                                    <button type="button" onClick={addWitness} className="text-xs bg-green-900/30 text-green-400 px-3 py-1 rounded hover:bg-green-900/50 flex items-center gap-1"><Plus size={14}/> {t('step3.addBtn') || "Add"}</button>
                                </div>
                                {witnesses.length === 0 && <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center text-gray-500 text-sm">{t('step3.noWit') || "No witnesses added."}</div>}
                                {witnesses.map((w, i) => (
                                    <div key={i} className="p-4 bg-[#121212] border border-gray-700 rounded-xl space-y-3 relative">
                                        <button type="button" onClick={() => removeWitness(i)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input {...register(`witnesses.${i}.name`)} placeholder={t('step3.wNamePh') || "Name"} className={getInputClass(`witnesses.${i}.name`, errors.witnesses?.[i]?.name)} />
                                            <Input {...register(`witnesses.${i}.connection`)} placeholder={t('step3.wRelPh') || "Relationship"} className={getInputClass(`witnesses.${i}.connection`, errors.witnesses?.[i]?.connection)} />
                                        </div>
                                        <Input {...register(`witnesses.${i}.knowledge`)} placeholder={t('step3.wKnowPh') || "What do they know?"} className={getInputClass(`witnesses.${i}.knowledge`, errors.witnesses?.[i]?.knowledge)} />
                                    </div>
                                ))}
                            </div>

                            <Alert variant="warning">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg"><AlertTriangle className="text-yellow-500" size={20}/></div>
                                    <div>
                                        <AlertTitle className="text-yellow-500">{t('step3.secTitle')}</AlertTitle>
                                        <AlertDescription className="text-gray-400">
                                            {t('step3.secDesc')} <br/>
                                            <span className="text-yellow-600/80 italic">{t('step3.secNote')}</span>
                                        </AlertDescription>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="has65B" 
                                            className="accent-yellow-500 w-4 h-4"
                                            onChange={() => setValue('certificateStatus', 'Have Certificate')} 
                                        />
                                        <span className="text-sm text-gray-300">{t('step3.secYes')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="has65B" 
                                            className="accent-yellow-500 w-4 h-4"
                                            onChange={() => {
                                                setValue('certificateStatus', 'Need Drafting');
                                                setValue('certificateFile', null);
                                            }}
                                        />
                                        <span className="text-sm text-gray-300">{t('step3.secNo')}</span>
                                    </label>
                                </div>

                                {watch('certificateStatus')?.includes('Have Certificate') ? (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-yellow-700/40 bg-[#121212] rounded-lg cursor-pointer hover:bg-yellow-900/10 transition group">
                                            <div className="flex flex-col items-center gap-2 text-sm text-gray-400 group-hover:text-yellow-500 transition-colors">
                                                <UploadCloud size={24} /> 
                                                <span className="font-medium">{watch('certificateFile')?.[0]?.name || t('step3.secUpload')}</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                className="hidden" 
                                                onChange={handleCertFileChange}
                                            />
                                        </label>
                                    </div>
                                ) : watch('certificateStatus') === 'Need Drafting' ? (
                                    <Alert variant="info" className="animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} />
                                            <span>{t.rich('step3.secNoted', { bold: (chunks) => <strong>{chunks}</strong> })}</span>
                                        </div>
                                    </Alert>
                                ) : null}
                            </Alert>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-semibold text-white">{t('step2.backBtn') || "Back"}</button>
                                <Button type="submit" variant="brand" size="xl" className="w-2/3 justify-center shadow-lg shadow-orange-900/20">{t('step3.genBtn') || "Generate Report"}</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- RESULT STEP (The "Paper" View) --- */}
            {step === 4 && (
              <div className="animate-in zoom-in-95 duration-500">
                 {/* REMOVED overflow-hidden to prevent vertical clipping of long AI text */}
                 <div className="bg-white rounded-lg shadow-2xl min-h-[80vh] flex flex-col md:flex-row pb-10">
                    
                    {/* Left: The Document */}
                    <div className="flex-1 p-8 md:p-12 bg-white text-slate-900 flex flex-col relative">
                       <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                           <div>
                               <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('step4.title') || "Legal Brief & Analysis"}</h2>
                               <p className="text-slate-500 text-sm">{t('step4.preparedFor') || "Prepared for"} <span className="font-semibold text-slate-900">{getValues('plaintiffName')}</span></p>
                           </div>
                           <Scale className="text-[#FF5B33]" size={40} />
                       </div>

                       <div className="prose-brief grow">
                           {isLoading ? (
                               <AnalysisSkeleton />
                           ) : (
                               <ReactMarkdown
                                  components={{
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                                    )
                                  }}
                              >{result}</ReactMarkdown>
                           )}
                       </div>

                       {/* --- NEW: PROFESSIONAL REDESIGNED DIRECTORY WIDGET --- */}
                       {!isLoading && (
                           <div className="mt-12 border-t border-slate-200 pt-8">
                               <div className="bg-[#171717] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                                   <div className="text-left">
                                       <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                           <Search size={20} className="text-[#FF5B33]" />
                                           Find Legal Representation
                                       </h3>
                                       <p className="text-slate-400 text-sm max-w-md">
                                           Your case assessment is complete. Take the next step by finding specialized {getValues('caseType') || 'legal'} representation in {getValues('city') || 'your area'}.
                                       </p>
                                   </div>
                                   <Button
                                       type="button"
                                       variant="brand"
                                       size="md"
                                       onClick={handleDirectoryRoute}
                                       className="shrink-0"
                                   >
                                       Search Directory <ArrowRight size={18} />
                                   </Button>
                               </div>
                           </div>
                       )}
                    </div>

                    {/* Right: The Reference Rail */}
                    <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 p-6 text-slate-800 shrink-0">
                        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <LinkIcon size={14}/> {t('step4.citations') || "Citations"}
                        </h3>
                        
                        {isLoading ? (
                            <CitationSkeleton />
                        ) : (
                            <ul className="space-y-3 custom-scrollbar overflow-y-auto max-h-[calc(100vh-200px)]">
                                {activeCitations.length === 0 ? (
                                    <li className="text-sm text-slate-400 italic">{t('step4.noCitations') || "No direct citations extracted."}</li>
                                ) : (
                                    activeCitations.map((c, i) => (
                                        <li key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-orange-200 transition-colors text-sm">
                                            {c.type === 'link' ? (
                                                <a href={c.href} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline flex items-start gap-2">
                                                    <LinkIcon size={14} className="mt-1 shrink-0"/> 
                                                    <span className="wrap-break-word">{c.title}</span>
                                                </a>
                                            ) : (
                                                <div className="flex items-start gap-2 text-slate-700 font-medium">
                                                    <Gavel size={14} className="mt-1 shrink-0 text-purple-600"/>
                                                    <span>{c.title}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}

                        {/* Action Buttons in Sidebar */}
                        <div className="mt-8 space-y-3 pt-6 border-t border-slate-200">
                            <Button type="button" variant="dark" onClick={handleExportPDF} disabled={isLoading || !result} className="w-full justify-center text-sm">
                                <Download size={16}/> Download PDF
                            </Button>
                            <Button type="button" variant="card-outline" onClick={() => {setStep(1); methods.reset(); setWitnesses([]); setEvidence([]);}} className="w-full justify-center text-sm py-3">
                                Start New Assessment
                            </Button>
                        </div>
                    </div>

                 </div>
              </div>
            )}

          </form>
        </div>
      </div>

      {/* ── Case History Drawer ──────────────────────────── */}
      {/* Backdrop */}
      {historyOpen && (
        <div
          onClick={() => setHistoryOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 40 }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 400,
        backgroundColor: '#0D1117', borderLeft: '1px solid rgba(255,255,255,0.07)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        transform: historyOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>

        {/* Drawer header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FolderOpen size={18} color="#FF5B33" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>Case Dossiers</span>
            </div>
            <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            {caseHistory.length} case{caseHistory.length !== 1 ? 's' : ''} on record — click any to reload its analysis
          </p>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historyLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 40, justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,91,51,0.3)', borderTopColor: '#FF5B33', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Loading dossiers...
            </div>

          ) : caseHistory.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 60, color: 'rgba(255,255,255,0.2)' }}>
              <FolderOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No cases on record yet.</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Complete your first analysis and it will appear here.</p>
            </div>

          ) : (
            caseHistory.map((entry) => {
              const typeColor = caseTypeColors[entry.caseType] || caseTypeColors.other;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => loadFromHistory(entry)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: `3px solid ${typeColor}`,
                    borderRadius: 6, padding: '14px 16px',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  >
                    {/* Top row: title + arrow */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                        {entry.caseTitle}
                      </span>
                      <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2 }} />
                    </div>

                    {/* Middle row: type badge + location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {entry.caseType && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: 1,
                          padding: '2px 8px', borderRadius: 3,
                          backgroundColor: `${typeColor}20`, color: typeColor,
                          textTransform: 'uppercase',
                        }}>
                          {entry.caseType}
                        </span>
                      )}
                      {entry.city && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={9} /> {entry.city}{entry.state ? `, ${entry.state}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Relief sought snippet */}
                    {entry.reliefSought && (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {entry.reliefSought}
                      </p>
                    )}

                    {/* Bottom row: time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>
                      <Clock size={9} /> {timeAgo(entry.createdAt)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}