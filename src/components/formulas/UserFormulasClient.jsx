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
  DialogClose // Import DialogClose
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button as ShadButton } from "@/components/ui/button"; // Alias if you have another Button component
import { Checkbox } from "@/components/ui/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faVideo, faPen, faCoins, faListAlt, faFileSignature, faMagic, faTools } from "@fortawesome/free-solid-svg-icons"; // Added more icons
import Transition from "@/components/others/Transition"; // Assuming you have this
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper"; // Assuming you have this
import { BeatLoader } from "react-spinners"; // For loading state

export default function UserFormulasClient({ initialUser, initialFormulas, serverFetchError }) {
  const [user, setUser] = useState(initialUser);
  const [formulas, setFormulas] = useState(initialFormulas || []);

  const [editingPointsBalance, setEditingPointsBalance] = useState(0);
  const [recordingPointsBalance, setRecordingPointsBalance] = useState(0);
  const [designPointsBalance, setDesignPointsBalance] = useState(0);
  const [isFetchingPoints, setIsFetchingPoints] = useState(false);

  const [selectedId, setSelectedId] = useState('');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(serverFetchError || '');
  const [isClientReady, setIsClientReady] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

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
              .then(res => res.ok ? res.json() : { total: 0, error: `API error for ${type}` })
          )
        );
        setEditingPointsBalance(results[0]?.total || 0);
        setRecordingPointsBalance(results[1]?.total || 0);
        setDesignPointsBalance(results[2]?.total || 0);
        if(results.some(r => r.error)) console.warn("Some points API calls failed:", results.filter(r=>r.error));

      } catch (err) {
        console.error("❌ Error fetching all points balances:", err);
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
      // Clear general message only if it's not a persistent server error
      if (!serverFetchError && msg && !msg.startsWith("Грешка при зареждане на формулите")) {
        setMsg('');
      }
      return;
    }
    const initialValues = {};
    if (selectedFormula.fields && Array.isArray(selectedFormula.fields)) {
      selectedFormula.fields.forEach(field => {
        if (field.type === 'yesno' || field.type === 'checkbox') initialValues[field.key] = false;
        else if (field.type === 'number') initialValues[field.key] = field.defaultValue !== undefined ? String(field.defaultValue) : (field.min !== undefined ? String(field.min) : '0');
        else initialValues[field.key] = field.defaultValue || '';
      });
    }
    setValues(initialValues);
    if (!serverFetchError || (msg && !msg.startsWith("Грешка при зареждане на формулите"))) {
      setMsg('');
    }
  }, [selectedId, selectedFormula, serverFetchError, msg]); // Added msg to dependencies

  const handleInputChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, checked) => {
    if (typeof checked === 'boolean') {
      setValues(prev => ({ ...prev, [key]: checked }));
    }
  };

  const calculateTotalCost = useMemo(() => {
    if (!selectedFormula || !selectedFormula.fields) return 0;
    let total = Number(selectedFormula.basePrice) || 0;
    selectedFormula.fields.forEach(field => {
      const fieldValue = values[field.key];
      switch (field.type) {
        case 'text': case 'textarea':
          if (fieldValue && field.cost) total += Number(field.cost);
          break;
        case 'number':
          if (field.cost && fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== '') {
            const quantity = Number(fieldValue);
            if (!isNaN(quantity)) { // Allow 0 if costIfZero is defined
                if (quantity === 0 && field.costIfZero !== undefined) total += Number(field.costIfZero);
                else if (quantity > 0) total += quantity * Number(field.cost);
            }
          }
          break;
        case 'yesno': case 'checkbox':
          if (fieldValue === true && field.costYes !== undefined) total += Number(field.costYes);
          else if (fieldValue === false && field.costNo !== undefined) total += Number(field.costNo);
          break;
        case 'dropdown':
          if (fieldValue && field.options && Array.isArray(field.options)) {
            const selectedOption = field.options.find(opt => opt.value === fieldValue);
            if (selectedOption && selectedOption.cost !== undefined) total += Number(selectedOption.cost);
          }
          break;
        default: break;
      }
    });
    return total;
  }, [selectedFormula, values]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!user) { setMsg('Моля, влезте в профила си.'); return; }
    if (!selectedFormula) { setMsg('Моля, изберете формула.'); return; }
    setLoading(true);
    setMsg(''); // Clear previous messages

    const totalCost = calculateTotalCost; // It's already a memoized value
    if (!selectedFormula.pointsType) {
        setMsg("Грешка: Формулата няма дефиниран тип точки."); setLoading(false); return;
    }
    const spendPayload = { userId: user.id, pointsToSpend: totalCost, pointsType: selectedFormula.pointsType, formulaId: selectedFormula.id, formulaName: selectedFormula.name, filledValues: values, formulaFields: selectedFormula.fields };
    try {
      const res = await fetch('/api/formulas/spend-points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spendPayload) });
      const result = await res.json();
      if (!res.ok) {
        setMsg(result.message || 'Грешка при обработка на поръчката.');
      } else {
        setMsg(result.message || `Поръчка #${result.order?.id} е създадена успешно!`);
        setSelectedId(''); setValues({}); // Reset form
        // Re-fetch points after successful order
        if (user?.id) {
            setIsFetchingPoints(true);
            const pointsTypesToUpdate = ['editingPoints', 'recordingPoints', 'designPoints'];
            Promise.all(
                pointsTypesToUpdate.map(type =>
                    fetch(`/api/activePoints?userId=${user.id}&type=${type}`).then(res => res.json())
                )
            ).then(results => {
                setEditingPointsBalance(results[0]?.total || 0);
                setRecordingPointsBalance(results[1]?.total || 0);
                setDesignPointsBalance(results[2]?.total || 0);
            }).catch(err => console.error("Error re-fetching all points balances:", err))
            .finally(() => setIsFetchingPoints(false));
        }
        setLastOrderDetails({ id: result.order?.id, name: selectedFormula.name, total: totalCost, filled: values, formulaFields: selectedFormula.fields });
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
    // Enhanced icons to provide more variety
    switch (String(formType).toLowerCase()) {
      case 'vlog': return <FontAwesomeIcon icon={faVideo} className="text-accent w-5 h-5" />;
      case 'tiktok': return <FontAwesomeIcon icon={faFilm} className="text-accent w-5 h-5" />; // Using faFilm for TikTok too for variety
      case 'recording': return <FontAwesomeIcon icon={faVideo} className="text-accent w-5 h-5" />;
      case 'thumbnail': return <FontAwesomeIcon icon={faPen} className="text-accent w-5 h-5" />;
      case 'editing': return <FontAwesomeIcon icon={faMagic} className="text-accent w-5 h-5" />;
      case 'general': return <FontAwesomeIcon icon={faListAlt} className="text-accent w-5 h-5" />;
      default: return <FontAwesomeIcon icon={faTools} className="text-accent w-5 h-5" />; // Generic tools icon
    }
  };

  const pointTypeLabels = {
    editingPoints: "Монтаж",
    recordingPoints: "Заснемане",
    designPoints: "Дизайн"
  };

  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex justify-center items-center">
        <p className="text-gray-400">Зареждане на формуляри...</p> {/* Changed bg-gray-900 to bg-background */}
      </div>
    );
  }

  // Styled form elements (can be defined outside or as constants)
  const formElementBaseClass = "w-full bg-gray-800 border-gray-700 px-4 py-2.5 rounded-lg text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
  const selectTriggerStyled = `${formElementBaseClass} flex items-center justify-between`;
  const selectContentStyled = "bg-gray-800 border-gray-700 text-white rounded-md shadow-lg z-50";
  const labelStyled = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
  <Transition delay={0.2}>
    <section className="min-h-screen bg-background text-foreground py-32 md:py-44"> {/* Consistent padding with Points page */}
      <MaxWidthWrapper>
        {/* Background Gradient Element - same as Points page */}
        <div className="w-96 h-96 absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/70 to-background blur-[100px] filter rounded-full -z-10" />

        <div className="relative mb-12 text-center">
            <div className="relative pt-8 md:pt-12 lg:pt-16"> {/* Add padding-top to this wrapper */}
                <h1 className="hidden md:flex absolute top-0 left-1/2 -translate-y-[70%] sm:-translate-y-[60%] -translate-x-1/2 mx-auto w-max text-6xl md:text-8xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent z-0">
                    УСЛУГИ
                </h1>
                <h1 className="md:hidden mx-auto w-max text-5xl font-[800] mb-2 relative bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
                    УСЛУГИ
                </h1>
            </div>
            <p className="text-neutral-400 text-center max-w-xl mx-auto"> {/* No top margin needed here now */}
                {selectedFormula ? selectedFormula.description || "Попълнете опциите за избраната услуга." : "Изберете услуга от списъка, за да конфигурирате вашата поръчка."}
            </p>
        </div>

        {/* Balances Section - Styled like Points page cards, but simpler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[{label: "Баланс Монтаж", value: editingPointsBalance}, {label: "Баланс Заснемане", value: recordingPointsBalance}, {label: "Баланс Дизайн", value: designPointsBalance}].map(balance => (
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
            <Link href="/points" passHref legacyBehavior>
                <ShadButton variant="default" className="bg-accent hover:bg-accentLighter text-white h-11 px-8 text-md font-semibold rounded-lg shadow-lg">
                    Купи още точки
                </ShadButton>
            </Link>
        </div>


        {/* Formula Selection & Form Area */}
        <div className="max-w-2xl mx-auto space-y-8">
            {initialFormulas.length === 0 && !serverFetchError && !msg.includes('Грешка') ? (
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

            {/* General Message Display */}
            {msg && !selectedFormula && ( // Only show general msg if no formula is selected
                <p className={`text-center font-medium p-4 rounded-lg shadow ${msg.toLowerCase().includes('грешка') || msg.toLowerCase().includes('error') ? 'bg-red-800/30 text-red-300 border border-red-700' : 'bg-blue-800/30 text-blue-300 border border-blue-700'}`}>
                    {msg}
                </p>
            )}

            {/* Dynamic Form for Selected Formula */}
            {selectedFormula && selectedFormula.fields && (
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
                          {field.type !== 'checkbox' && field.type !== 'yesno' && field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {(field.type === 'text' || field.type === 'number' || field.type === 'textarea') && (
                          field.type === 'textarea' ? (
                            <Textarea id={field.key} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementBaseClass} rows={3} placeholder={field.placeholder || ''} required={field.required} />
                          ) : (
                            <Input id={field.key} type={field.type === 'number' ? 'number' : 'text'} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementBaseClass} placeholder={field.placeholder || (field.type === 'number' ? (field.min !== undefined ? String(field.min) : '0') : '')} min={field.min} max={field.max} step={field.step} required={field.required} />
                          )
                        )}
                        {(field.type === 'yesno' || field.type === 'checkbox') && (
                          <div className="flex items-center space-x-2.5 pt-2 h-10"> {/* Ensure consistent height */}
                            <Checkbox
                              id={field.key}
                              checked={!!values[field.key]}
                              onCheckedChange={(checked) => handleCheckboxChange(field.key, checked)}
                              className="h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accentLighter border-gray-500"
                            />       
                            <Label htmlFor={field.key} className="text-sm text-gray-300 cursor-pointer select-none">
                              Да (+{field.costYes || 0}т.) / Не (+{field.costNo || 0}т.)
                            </Label>
                          </div>
                        )}
                        {field.type === 'dropdown' && field.options && Array.isArray(field.options) && (
                          <Select onValueChange={(value) => handleInputChange(field.key, value)} value={values[field.key] || ''} name={field.key} required={field.required}>
                            <SelectTrigger className={selectTriggerStyled}><SelectValue placeholder="— моля, изберете —" /></SelectTrigger>
                            <SelectContent className={selectContentStyled}>
                              {field.options.map((opt, i) => (
                                <SelectItem key={opt.value || i} value={opt.value} className="focus:bg-gray-700 hover:bg-gray-700/80 data-[state=checked]:bg-accent/80">{opt.label} (+{opt.cost || 0}т.)</SelectItem>
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
                      Общо: <span className="text-accentLighter">{calculateTotalCost} {selectedFormula.pointsType ? pointTypeLabels[selectedFormula.pointsType] || 'точки' : 'точки'}</span>
                    </p>
                  </div>
                  <ShadButton type="submit" disabled={loading || !selectedId || isFetchingPoints || (calculateTotalCost > (selectedFormula.pointsType === 'editingPoints' ? editingPointsBalance : selectedFormula.pointsType === 'recordingPoints' ? recordingPointsBalance : designPointsBalance))} 
                    className="w-full bg-accent hover:bg-accentLighter disabled:bg-gray-600 text-white font-semibold py-3 text-base rounded-lg h-11 transition-colors">
                    {loading ? <BeatLoader size={10} color="white" /> : 'Потвърди и изразходвай точки'}
                  </ShadButton>
                   {/* Message for insufficient points */}
                  {selectedId && !isFetchingPoints && calculateTotalCost > (selectedFormula.pointsType === 'editingPoints' ? editingPointsBalance : selectedFormula.pointsType === 'recordingPoints' ? recordingPointsBalance : designPointsBalance) && (
                    <p className="text-red-400 text-sm text-center mt-2">
                        Нямате достатъчно {selectedFormula.pointsType ? pointTypeLabels[selectedFormula.pointsType] : ''} точки. Текущ баланс: {selectedFormula.pointsType === 'editingPoints' ? editingPointsBalance : selectedFormula.pointsType === 'recordingPoints' ? recordingPointsBalance : designPointsBalance} т.
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* Display success/error message for form submission */}
            {msg && selectedFormula && (
              <p className={`mt-6 text-center font-medium p-4 rounded-lg shadow ${msg.toLowerCase().includes('грешка') || msg.toLowerCase().includes('error') ? 'bg-red-800/30 text-red-300 border border-red-700' : 'bg-green-800/30 text-green-300 border border-green-700'}`}>
                {msg}
              </p>
            )}
        </div> {/* End max-w-2xl */}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={(isOpen) => { if(!isOpen) { setMsg(''); setShowConfirmation(false); } else { setShowConfirmation(isOpen); }}}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-accentLighter">
                ✅ Поръчката е Приета!
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300 pt-1">
                Благодарим Ви! Поръчка #{lastOrderDetails?.id} е регистрирана. Ще се свържем с Вас възможно най-скоро за потвърждение.
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
                 <p className="mt-2 pt-2 border-t border-gray-600"><span className="text-gray-300">Общо изразходвани:</span> <span className="font-semibold text-accentLighter">{lastOrderDetails.total} {pointTypeLabels[selectedFormula?.pointsType] || 'точки'}</span></p>
              </div>
            )}
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <ShadButton className="w-full bg-accent hover:bg-accentLighter text-white">
                        Разбрах
                    </ShadButton>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MaxWidthWrapper>
    </section>
  </Transition>
  );
}