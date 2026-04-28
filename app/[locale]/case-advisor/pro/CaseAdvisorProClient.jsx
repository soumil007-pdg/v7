'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import { ChatSkeleton } from '@/app/components/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import {
  Download, Link as LinkIcon, ArrowRight, Plus, Trash2,
  UploadCloud, FileText, Scale, CheckCircle, AlertTriangle, Gavel, MapPin, Star, Search
} from 'lucide-react';

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;500;600;800&display=swap');
    .prose-brief { font-family: 'Merriweather', serif; color: #e8dcc8; line-height: 1.8; font-size: 1.05rem; }
    .prose-brief h1, .prose-brief h2, .prose-brief h3 { font-family: 'Inter', sans-serif; color: #d4af37; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.6em; letter-spacing: -0.02em; }
    .prose-brief h3 { font-size: 1.25rem; border-bottom: 2px solid #d4af37; padding-bottom: 0.5rem; }
    .prose-brief strong { color: #d4af37; font-weight: 700; }
    .prose-brief ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 1em; }
    .prose-brief li { margin-bottom: 0.4em; }
    .prose-brief a { color: #d4af37; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 2px; font-weight: 600; }
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

export default function CaseAdvisorProClient() {
  const { isLoggedIn, loading } = useAuth(true);
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
  const [displaySuitValue, setDisplaySuitValue] = useState('');
  const [activeCitations, setActiveCitations] = useState([]);

  const { register, handleSubmit, getValues, watch, formState: { errors }, trigger, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { witnesses: [], evidence: [] }
  });

  const handleSuitValueChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setDisplaySuitValue(formatted);
  };

  const addWitness = () => setWitnesses([...witnesses, { name: '', connection: '', knowledge: '' }]);
  const removeWitness = (index) => setWitnesses(witnesses.filter((_, i) => i !== index));

  const addEvidence = () => setEvidence([...evidence, { type: 'documents', description: '', fileName: null }]);
  const removeEvidence = (index) => setEvidence(evidence.filter((_, i) => i !== index));

  const handleFileChange = (e, index) => {
    if (e.target.files?.[0]) {
      const newEvidence = [...evidence];
      newEvidence[index].fileName = e.target.files[0].name;
      setEvidence(newEvidence);
    }
  };

  const getInputClass = (fieldName, error) => {
    const base = "w-full px-5 py-3 rounded-lg border-2 text-white bg-[#0d2436] font-medium outline-none transition-all text-base placeholder:text-gray-400 ";
    const dirtyFields = watch();
    let isDirty = false;

    if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        let current = dirtyFields;
        for (const part of parts) {
            if (current && current[part]) current = current[part];
            else { current = undefined; break; }
        }
        if (current) isDirty = true;
    }

    if (isDirty) return base + "border-[#d4af37] focus:ring-2 focus:ring-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]";
    return base + "border-[#2a4a66] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]";
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
    doc.setTextColor(212, 175, 55);
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
            doc.setTextColor(212, 175, 55);
            doc.text(cleanLine, margin, yPos);
            yPos += 2;
            doc.setDrawColor(212, 175, 55);
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
      window.open(`/${locale}/directory?city=${city}&category=${category}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a3a52] text-white">Loading...</div>;
  if (!isLoggedIn) return null;

  const stepTitles = [
    { num: 1, title: 'Initial Consultation' },
    { num: 2, title: 'Review' },
    { num: 3, title: 'Strategy' },
    { num: 4, title: 'Report' }
  ];

  return (
    <>
      <FontLoader />
      <div className="min-h-screen w-full bg-[#1a3a52] text-white py-16 px-6 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">

            {/* LEFT SIDEBAR */}
            <aside className="w-80 flex-shrink-0">
              <div className="bg-[#0d2436] border-2 border-[#2a4a66] rounded-2xl p-8 sticky top-32">
                <div className="mb-8 pb-8 border-b-2 border-[#2a4a66]">
                  <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Case Strategist</h2>
                  <p className="text-sm text-gray-400">Legal Education & Advisory</p>
                </div>

                <div className="space-y-3">
                  {stepTitles.map((s) => (
                    <button
                      key={s.num}
                      onClick={() => s.num <= step && setStep(s.num)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-l-4 transition-all ${
                        step === s.num
                          ? 'bg-[#1a3a52] border-l-[#d4af37] text-[#d4af37] font-bold'
                          : step > s.num
                          ? 'border-l-gray-600 text-gray-400'
                          : 'border-l-gray-600 text-gray-500'
                      }`}
                    >
                      <span className="text-sm font-semibold">Step {s.num}</span>
                      <div className="text-xs mt-1 opacity-75">{s.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1">
              <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">

                {step < 4 && (
                  <div className="bg-[#0d2436] border-2 border-[#2a4a66] rounded-2xl p-12">

                    {step === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#2a4a66] pb-4 mb-6">Step 1: Tell Us About Your Matter</h3>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                          <input {...register('plaintiffName')} className={getInputClass('plaintiffName', errors.plaintiffName)} placeholder="Enter your full name" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                          <input type="email" className={getInputClass('email', false)} placeholder="your@email.com" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Phone Number</label>
                          <input type="tel" className={getInputClass('phone', false)} placeholder="+91 XXXXX XXXXX" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Briefly Describe Your Legal Matter</label>
                          <textarea {...register('description')} rows="4" className={getInputClass('description', errors.description)} placeholder="Describe your situation..." />
                        </div>

                        <button type="button" onClick={nextStep} className="w-full bg-[#d4af37] hover:bg-[#c99f2e] text-[#0d2436] py-3 rounded-lg font-bold text-lg">
                          Next →
                        </button>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#2a4a66] pb-4 mb-6">Step 2: Case Details</h3>
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Case Title</label>
                          <input {...register('caseTitle')} className={getInputClass('caseTitle', errors.caseTitle)} placeholder="e.g. Property Dispute" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Category</label>
                          <select {...register('caseType')} className={getInputClass('caseType', errors.caseType)}>
                            <option value="">Select Category</option>
                            <option value="contract">Contract</option>
                            <option value="property">Property</option>
                            <option value="family">Family</option>
                          </select>
                        </div>

                        <div className="flex gap-4">
                          <button type="button" onClick={() => setStep(1)} className="w-1/2 bg-[#2a4a66] text-white py-3 rounded-lg font-semibold">Back</button>
                          <button type="button" onClick={nextStep} className="w-1/2 bg-[#d4af37] text-[#0d2436] py-3 rounded-lg font-bold">Next</button>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#2a4a66] pb-4 mb-6">Step 3: Evidence & More</h3>
                        <p className="text-gray-300">Additional case information and evidence can be added here.</p>
                        <div className="flex gap-4">
                          <button type="button" onClick={() => setStep(2)} className="w-1/2 bg-[#2a4a66] text-white py-3 rounded-lg font-semibold">Back</button>
                          <button type="submit" className="w-1/2 bg-[#d4af37] text-[#0d2436] py-3 rounded-lg font-bold">Analyze Case</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="bg-[#0d2436] border-2 border-[#d4af37] rounded-2xl p-12">
                    <h3 className="text-3xl font-bold text-[#d4af37] border-b-2 border-[#2a4a66] pb-4 mb-6">Case Analysis</h3>
                    {isLoading ? <ChatSkeleton /> : result ? (
                      <div className="space-y-4">
                        <div className="bg-[#1a3a52] border-l-4 border-[#d4af37] p-6 rounded text-gray-200">
                          <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleExportPDF} className="bg-[#d4af37] text-[#0d2436] px-6 py-3 rounded-lg font-bold">Export PDF</button>
                          <button onClick={() => { reset(); setStep(1); setResult(''); }} className="bg-[#2a4a66] text-white px-6 py-3 rounded-lg font-semibold">New Case</button>
                        </div>
                      </div>
                    ) : <p className="text-gray-400">Analyzing your case...</p>}
                  </div>
                )}
              </form>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
