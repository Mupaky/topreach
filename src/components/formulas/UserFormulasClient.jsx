// app/components/formulas/UserFormulasClient.jsx
'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Assuming shadcn/ui

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button as ShadButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faVideo, faPen, faCoins, faListAlt, faFileSignature, faMagic, faTools } from "@fortawesome/free-solid-svg-icons";
import Transition from "@/components/others/Transition";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import { BeatLoader } from "react-spinners";

export default function UserFormulasClient({ initialUser, initialFormulas, serverFetchError }) {
  const [user, setUser] = useState(initialUser);
  const [formulas, setFormulas] = useState(initialFormulas || []);

  const [editingPointsBalance, setEditingPointsBalance] = useState(0);
  const [recordingPointsBalance, setRecordingPointsBalance] = useState(0);
  const [designPointsBalance, setDesignPointsBalance] = useState(0);
  const [isFetchingPoints, setIsFetchingPoints] = useState(false);

  const [selectedId, setSelectedId] = useState('');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false); // For form submission
  const [msg, setMsg] = useState(serverFetchError || '');
  const [isClientReady, setIsClientReady] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const pointTypeLabels = useMemo(() => ({
    editingPoints: "Монтаж",
    recordingPoints: "Заснемане",
    designPoints: "Дизайн"
  }), []);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    async function fetchAllPointsBalances() {
      if (!user?.id) {
        setEditingPointsBalance(0); setRecordingPointsBalance(0); setDesignPointsBalance(0);
        return;
      }
      setIsFetchingPoints(true);
      try {
        const pointsTypes = ['editingPoints', 'recordingPoints', 'designPoints'];
        const results = await Promise.all(
          pointsTypes.map(type =>
            fetch(`/api/activePoints?userId=${user.id}&type=${type}`)
              .then(res => {
                if (!res.ok) {
                  console.error(`API error for ${type}, status: ${res.status}`);
                  return { total: 0, error: `API error for ${type}` };
                }
                return res.json();
              })
          )
        );
        setEditingPointsBalance(results[0]?.total || 0);
        setRecordingPointsBalance(results[1]?.total || 0);
        setDesignPointsBalance(results[2]?.total || 0);
        if(results.some(r => r.error)) console.warn("Some points API calls might have failed or returned 0 due to error:", results.filter(r=>r.error));

      } catch (err) {
        console.error("❌ Error fetching all points balances (catch block):", err);
        setMsg("Грешка при зареждане на баланса по точки.");
        setEditingPointsBalance(0); setRecordingPointsBalance(0); setDesignPointsBalance(0);
      } finally {
        setIsFetchingPoints(false);
      }
    }
    if (isClientReady && user?.id) {
        fetchAllPointsBalances();
    }
  }, [user?.id, isClientReady]);

  useEffect(() => {
    setUser(initialUser);
    setFormulas(initialFormulas || []);
    if (serverFetchError) {
      setMsg(serverFetchError);
    }
  }, [initialUser, initialFormulas, serverFetchError]);

  const selectedFormula = useMemo(() => {
    return formulas.find(f => f.id === selectedId);
  }, [formulas, selectedId]);

  useEffect(() => {
    if (!selectedFormula) {
      setValues({});
      if (!serverFetchError && msg && !msg.startsWith("Грешка при зареждане на формулите")) {
        setMsg('');
      }
      return;
    }
    const initialValues = {};
    if (selectedFormula.fields && Array.isArray(selectedFormula.fields)) {
      selectedFormula.fields.forEach(field => {
        if (field.type === 'yesno' || field.type === 'checkbox') {
          initialValues[field.key] = field.defaultValue === true; // Ensure boolean
        } else if (field.type === 'number') {
          initialValues[field.key] = field.defaultValue !== undefined ? String(field.defaultValue) : (field.min !== undefined ? String(field.min) : '0');
        } else {
          initialValues[field.key] = field.defaultValue || '';
        }
      });
    }
    setValues(initialValues);
    if (!serverFetchError || (msg && !msg.startsWith("Грешка при зареждане на формулите"))) {
      setMsg('');
    }
  }, [selectedId, selectedFormula, serverFetchError, msg]);

  const handleInputChange = (key, value) => setValues(prev => ({ ...prev, [key]: value }));
  const handleCheckboxChange = (key, checked) => { if (typeof checked === 'boolean') setValues(prev => ({ ...prev, [key]: checked })); };

  const calculateTotalCostBreakdown = useMemo(() => {
    const costs = { editingPoints: 0, recordingPoints: 0, designPoints: 0 };
    if (!selectedFormula || !Array.isArray(selectedFormula.fields)) return costs;

    // Add base price to its specified pointsType
    if (selectedFormula.basePrice && selectedFormula.pointsType && costs.hasOwnProperty(selectedFormula.pointsType)) {
        costs[selectedFormula.pointsType] = (costs[selectedFormula.pointsType] || 0) + Number(selectedFormula.basePrice);
    }

    selectedFormula.fields.forEach(field => {
      const fieldValue = values[field.key];
      // Use field's specific pointsType, fallback to formula's main pointsType if field's is missing/invalid
      const fieldPointsType = (field.pointsType && costs.hasOwnProperty(field.pointsType))
                               ? field.pointsType
                               : (selectedFormula.pointsType && costs.hasOwnProperty(selectedFormula.pointsType)
                                  ? selectedFormula.pointsType
                                  : null);


      if (!fieldPointsType) {
          console.warn(`Field "${field.label}" (key: ${field.key}) has invalid or missing pointsType: '${field.pointsType}', and formula default '${selectedFormula.pointsType}' is also invalid or missing. Skipping cost calculation for this field.`);
          return;
      }

      let fieldCost = 0;
      switch (field.type) {
        case 'text': case 'textarea':
          if (fieldValue && field.cost) fieldCost = Number(field.cost);
          break;
        case 'number':
          if (field.cost !== undefined && fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== '') {
            const quantity = Number(fieldValue);
            if (!isNaN(quantity)) {
                if (quantity === 0 && field.costIfZero !== undefined) fieldCost = Number(field.costIfZero);
                else if (quantity !== 0) fieldCost = quantity * Number(field.cost); // Only multiply if quantity is not 0 (unless costIfZero applies)
            }
          }
          break;
        case 'yesno': case 'checkbox':
          if (fieldValue === true && field.costYes !== undefined) fieldCost = Number(field.costYes);
          else if (fieldValue === false && field.costNo !== undefined) fieldCost = Number(field.costNo);
          break;
        case 'dropdown':
          if (fieldValue && field.options && Array.isArray(field.options)) {
            const selectedOption = field.options.find(opt => opt.value === fieldValue);
            if (selectedOption && selectedOption.cost !== undefined) fieldCost = Number(selectedOption.cost);
          }
          break;
        default: break;
      }
      costs[fieldPointsType] = (costs[fieldPointsType] || 0) + fieldCost;
    });
    return costs;
  }, [selectedFormula, values]);

  const hasEnoughPoints = useMemo(() => {
    if (isFetchingPoints || !selectedFormula) return true; // Default to true if not ready to check, button will be disabled by !selectedId
    const costBreakdown = calculateTotalCostBreakdown;
    if (costBreakdown.editingPoints > editingPointsBalance) return false;
    if (costBreakdown.recordingPoints > recordingPointsBalance) return false;
    if (costBreakdown.designPoints > designPointsBalance) return false;
    return true;
  }, [calculateTotalCostBreakdown, editingPointsBalance, recordingPointsBalance, designPointsBalance, isFetchingPoints, selectedFormula]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!user) { setMsg('Моля, влезте в профила си.'); return; }
    if (!selectedFormula) { setMsg('Моля, изберете формула.'); return; }
    setLoading(true);
    setMsg('');

    const costBreakdown = calculateTotalCostBreakdown;

    if (!hasEnoughPoints) {
        setMsg("Нямате достатъчно точки за тази поръчка. Проверете балансите си.");
        setLoading(false);
        return;
    }

    const spendPayload = {
        userId: user.id,
        pointsCostBreakdown: costBreakdown,
        formulaId: selectedFormula.id,
        formulaName: selectedFormula.name,
        filledValues: values,
        formulaFields: selectedFormula.fields
    };

    try {
      const res = await fetch('/api/formulas/spend-points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spendPayload) });
      const result = await res.json();
      if (!res.ok) {
        setMsg(result.message || 'Грешка при обработка на поръчката.');
      } else {
        setMsg(result.message || `Поръчка #${result.order?.id} е създадена успешно!`);
        setSelectedId(''); setValues({});
        if (user?.id) { // Re-fetch all points balances
            setIsFetchingPoints(true);
            Promise.all(
                ['editingPoints', 'recordingPoints', 'designPoints'].map(type =>
                    fetch(`/api/activePoints?userId=${user.id}&type=${type}`).then(res => res.json())
                )
            ).then(results => {
                setEditingPointsBalance(results[0]?.total || 0);
                setRecordingPointsBalance(results[1]?.total || 0);
                setDesignPointsBalance(results[2]?.total || 0);
            }).catch(err => console.error("Error re-fetching all points balances:", err))
            .finally(() => setIsFetchingPoints(false));
        }
        setLastOrderDetails({
            id: result.order?.id,
            name: selectedFormula.name,
            costBreakdown: costBreakdown,
            filled: values,
            formulaFields: selectedFormula.fields
        });
        setShowConfirmation(true);
      }
    } catch (error) { setMsg('Неочаквана грешка при изпращане на поръчката.'); }
    finally { setLoading(false); }
  };

  const availableFormulas = useMemo(() => {
    if (!Array.isArray(formulas)) return [];
    return formulas.filter(f => {
      if (!f || typeof f.access === 'undefined') return false;
      if (f.access === 'public') return true;
      if (f.access === 'user' && user) return true;
      if (f.access === 'admin' && user && user.role === 'admin') return true;
      return false;
    });
  }, [formulas, user]);

  const getFormulaIcon = (formType) => {
    switch (String(formType).toLowerCase()) {
      case 'vlog': return <FontAwesomeIcon icon={faVideo} className="text-accent w-5 h-5" />;
      case 'tiktok': return <FontAwesomeIcon icon={faFilm} className="text-accent w-5 h-5" />;
      case 'recording': return <FontAwesomeIcon icon={faVideo} className="text-accent w-5 h-5" />;
      case 'thumbnail': return <FontAwesomeIcon icon={faPen} className="text-accent w-5 h-5" />;
      case 'editing': return <FontAwesomeIcon icon={faMagic} className="text-accent w-5 h-5" />;
      case 'general': return <FontAwesomeIcon icon={faListAlt} className="text-accent w-5 h-5" />;
      default: return <FontAwesomeIcon icon={faTools} className="text-accent w-5 h-5" />;
    }
  };

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex justify-center items-center">
        <p className="text-gray-400">Зареждане на формуляри...</p>
      </div>
    );
  }

  const formElementBaseClass = "w-full bg-gray-800 border-gray-700 px-4 py-2.5 rounded-lg text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
  const selectTriggerStyled = `${formElementBaseClass} flex items-center justify-between`;
  const selectContentStyled = "bg-gray-800 border-gray-700 text-white rounded-md shadow-lg z-50";
  const labelStyled = "block text-sm font-medium text-gray-300 mb-1.5";

  const renderTotalCostString = () => {
    if (!selectedFormula) return "0 точки";
    const breakdown = calculateTotalCostBreakdown;
    const parts = [];
    if (breakdown.editingPoints > 0) parts.push(`${breakdown.editingPoints} ${pointTypeLabels.editingPoints}`);
    if (breakdown.recordingPoints > 0) parts.push(`${breakdown.recordingPoints} ${pointTypeLabels.recordingPoints}`);
    if (breakdown.designPoints > 0) parts.push(`${breakdown.designPoints} ${pointTypeLabels.designPoints}`);
    
    if (parts.length === 0) { // Handle if total cost is 0 after calculation
        // Check if basePrice exists and which type it is, even if 0
        if (selectedFormula && selectedFormula.basePrice !== undefined && selectedFormula.pointsType) {
            return `0 ${pointTypeLabels[selectedFormula.pointsType] || 'точки'}`;
        }
        return "0 точки";
    }
    return parts.join(', ') + ' т.';
  };

  return (
  <Transition delay={0.2}>
    <section className="min-h-screen bg-background text-foreground py-32 md:py-44">
      <MaxWidthWrapper>
        <div className="w-96 h-96 absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/70 to-background blur-[100px] filter rounded-full -z-10" />
        <div className="relative mb-12 text-center">
            <div className="relative pt-8 md:pt-12 lg:pt-16">
                <h1 className="hidden md:flex absolute top-0 left-1/2 -translate-y-[70%] sm:-translate-y-[60%] -translate-x-1/2 mx-auto w-max text-6xl md:text-8xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent z-0">
                    УСЛУГИ
                </h1>
                <h1 className="md:hidden mx-auto w-max text-5xl font-[800] mb-2 relative bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
                    УСЛУГИ
                </h1>
            </div>
            <p className="text-neutral-400 text-center max-w-xl mx-auto">
                {selectedFormula ? selectedFormula.description || "Попълнете опциите за избраната услуга." : "Изберете услуга от списъка, за да конфигурирате вашата поръчка."}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[{label: pointTypeLabels.editingPoints, value: editingPointsBalance}, {label: pointTypeLabels.recordingPoints, value: recordingPointsBalance}, {label: pointTypeLabels.designPoints, value: designPointsBalance}].map(balance => (
                <div key={balance.label} className="bg-gray-800/70 backdrop-blur-sm border border-secondary p-4 rounded-xl shadow-lg text-center">
                    <p className="text-sm text-neutral-400 mb-1">{balance.label}</p>
                    <p className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faCoins} className="text-yellow-400 w-5 h-5" />
                        {isFetchingPoints ? <BeatLoader size={8} color="white"/> : balance.value} т.
                    </p>
                </div>
            ))}
        </div>
        <div className="text-center mb-10">
            <Link href="/points">
            <ShadButton variant="default" className="bg-accent hover:bg-accentLighter text-white h-11 px-8 text-md font-semibold rounded-lg shadow-lg">
            Купи още точки
              </ShadButton>
            </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
            {(initialFormulas.length === 0 && !serverFetchError && !msg.includes('Грешка')) ? (
                 <p className="text-gray-400 text-center py-4">Няма налични формули в момента.</p>
            ) : availableFormulas.length > 0 ? (
              <div className="space-y-2 bg-gray-800/70 backdrop-blur-sm border border-secondary p-6 rounded-xl shadow-lg">
                <Label htmlFor="formula-select" className={labelStyled}>Изберете Услуга:</Label>
                <Select onValueChange={setSelectedId} value={selectedId} name="formula-select">
                  <SelectTrigger className={selectTriggerStyled} aria-label="Избери формула">
                    <SelectValue placeholder="— Моля, изберете услуга —" />
                  </SelectTrigger>
                  <SelectContent className={selectContentStyled}>
                    {availableFormulas.map(f => (
                      <SelectItem key={f.id} value={f.id} className="focus:bg-gray-700 hover:bg-gray-700/80 data-[state=checked]:bg-accent/80">
                        <div className="flex items-center gap-2">
                            {getFormulaIcon(f.formType)}
                            <span>{f.name} (Базова цена: {f.basePrice || 0} {f.pointsType ? pointTypeLabels[f.pointsType] || 'т.' : 'т.'})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : !serverFetchError ? (
                 <p className="text-gray-400 text-center py-4">Няма налични услуги за вашия акаунт.</p>
            ) : null }

            {msg && !selectedFormula && (
                <p className={`text-center font-medium p-4 rounded-lg shadow ${msg.toLowerCase().includes('грешка') || msg.toLowerCase().includes('error') ? 'bg-red-800/30 text-red-300 border border-red-700' : 'bg-blue-800/30 text-blue-300 border border-blue-700'}`}>
                    {msg}
                </p>
            )}

            {selectedFormula && Array.isArray(selectedFormula.fields) && (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-secondary p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                  {getFormulaIcon(selectedFormula.formType)}
                  <h2 className="text-2xl font-bold text-white">{selectedFormula.name}</h2>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {selectedFormula.fields.map(field => (
                      <div key={field.id || field.key} className="space-y-1.5">
                        <Label htmlFor={field.key} className={labelStyled}>
                          {field.label}
                          {(field.cost !== undefined || field.costYes !== undefined) && field.pointsType && (
                            <span className="text-xs text-gray-400 ml-1">
                                (+{field.type === 'yesno' || field.type === 'checkbox'
                                    ? `${field.costYes || 0} Да / ${field.costNo || 0} Не`
                                    : field.cost || 0}
                                {' '}{pointTypeLabels[field.pointsType] || 'т.'}
                                )
                            </span>
                          )}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {(field.type === 'text' || field.type === 'number' || field.type === 'textarea') && (
                          field.type === 'textarea' ? (
                            <Textarea id={field.key} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementBaseClass} rows={3} placeholder={field.placeholder || ''} required={field.required} />
                          ) : (
                            <Input id={field.key} type={field.type === 'number' ? 'number' : 'text'} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementBaseClass} placeholder={field.placeholder || (field.type === 'number' ? (field.min !== undefined ? String(field.min) : '0') : '')} min={field.min} max={field.max} step={field.step} required={field.required} />
                          )
                        )}
                        {(field.type === 'yesno' || field.type === 'checkbox') && (
                          <div className="flex items-center space-x-2.5 pt-2 h-10">
                            <Checkbox id={field.key} checked={!!values[field.key]} onCheckedChange={(checked) => handleCheckboxChange(field.key, checked)} className="h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accentLighter border-gray-500"/>
                            <Label htmlFor={field.key} className="text-sm text-gray-300 cursor-pointer select-none">Да</Label>
                          </div>
                        )}
                        {field.type === 'dropdown' && field.options && Array.isArray(field.options) && (
                          <Select onValueChange={(value) => handleInputChange(field.key, value)} value={values[field.key] || ''} name={field.key} required={field.required}>
                            <SelectTrigger className={selectTriggerStyled}><SelectValue placeholder="— моля, изберете —" /></SelectTrigger>
                            <SelectContent className={selectContentStyled}>
                              {field.options.map((opt, i) => (
                                <SelectItem key={opt.value || i} value={opt.value} className="focus:bg-gray-700 hover:bg-gray-700/80 data-[state=checked]:bg-accent/80">
                                    {opt.label}
                                    {opt.cost !== undefined && <span className="text-xs text-gray-400 ml-1">(+{opt.cost || 0} {pointTypeLabels[field.pointsType] || 'т.'})</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                         {field.description && <p className="text-xs text-gray-400 pt-1">{field.description}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="pt-5 border-t border-gray-700 mt-6">
                    <p className="text-right font-semibold text-xl">
                      Общо: <span className="text-accentLighter">{renderTotalCostString()}</span>
                    </p>
                  </div>
                  <ShadButton type="submit"
                    disabled={loading || !selectedId || isFetchingPoints || !hasEnoughPoints}
                    className="w-full bg-accent hover:bg-accentLighter disabled:bg-gray-600 text-white font-semibold py-3 text-base rounded-lg h-11 transition-colors">
                    {loading ? <BeatLoader size={10} color="white" /> : 'Потвърди и изразходвай точки'}
                  </ShadButton>
                  {selectedId && !isFetchingPoints && !hasEnoughPoints && (
                    <div className="text-red-400 text-sm text-center mt-2 space-y-1">
                        <p>Нямате достатъчно точки за тази поръчка.</p>
                        {Object.entries(calculateTotalCostBreakdown).map(([type, cost]) => {
                            if (cost > 0) {
                                const balance = type === 'editingPoints' ? editingPointsBalance : type === 'recordingPoints' ? recordingPointsBalance : designPointsBalance;
                                if (cost > balance) {
                                    return <p key={type}>Нужни {pointTypeLabels[type]}: {cost}т., Налични: {balance}т.</p>;
                                }
                            }
                            return null;
                        })}
                    </div>
                  )}
                </form>
              </div>
            )}

            {msg && selectedFormula && (
              <p className={`mt-6 text-center font-medium p-4 rounded-lg shadow ${msg.toLowerCase().includes('грешка') || msg.toLowerCase().includes('error') ? 'bg-red-800/30 text-red-300 border border-red-700' : 'bg-green-800/30 text-green-300 border border-green-700'}`}>
                {msg}
              </p>
            )}
        </div>

        <Dialog open={showConfirmation} onOpenChange={(isOpen) => { if(!isOpen) { setMsg(''); setShowConfirmation(false); } else { setShowConfirmation(isOpen); }}}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-accentLighter">✅ Поръчката е Приета!</DialogTitle>
              <DialogDescription className="text-sm text-gray-300 pt-1">
                Благодарим Ви! Поръчка #{lastOrderDetails?.id} е регистрирана. Ще се свържем с Вас.
              </DialogDescription>
            </DialogHeader>
            {lastOrderDetails && (
              <div className="my-4 max-h-60 overflow-y-auto bg-gray-700/50 p-4 rounded-lg border border-gray-600 text-sm space-y-1">
                <p className="mb-2 text-accent font-semibold">Детайли по поръчката:</p>
                <p><span className="text-gray-300">Услуга:</span> {lastOrderDetails.name}</p>
                <ul className="space-y-1 pl-1">
                  {lastOrderDetails.formulaFields?.map((field) => {
                    const value = lastOrderDetails.filled[field.key];
                    const label = field.label;
                    const type = field.type;
                    const renderValue = () => (type === "checkbox" || type === "yesno") ? (value ? "Да" : "Не") : String(value ?? "N/A");
                    return <li key={field.key}><span className="text-gray-400">{label}:</span> {renderValue()}</li>;
                  })}
                </ul>
                 <p className="mt-2 pt-2 border-t border-gray-600"><span className="text-gray-300">Общо изразходвани:</span>
                    <span className="font-semibold text-accentLighter ml-1">
                        {lastOrderDetails.costBreakdown && Object.entries(lastOrderDetails.costBreakdown)
                            .filter(([_, cost]) => cost > 0)
                            .map(([type, cost]) => `${cost} ${pointTypeLabels[type] || 'т.'}`)
                            .join(', ')
                        }
                    </span>
                 </p>
              </div>
            )}
            <DialogFooter className="pt-4">
                <DialogClose asChild><ShadButton className="w-full bg-accent hover:bg-accentLighter text-white">Разбрах</ShadButton></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MaxWidthWrapper>
    </section>
  </Transition>
  );
}