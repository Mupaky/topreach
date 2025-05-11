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
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { faFilm, faVideo, faPen, faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserFormulasClient({ initialUser, initialFormulas, serverFetchError }) {
  const [user, setUser] = useState(initialUser);
  const [formulas, setFormulas] = useState(initialFormulas || []);

  // State for different point types
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

  

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Fetch all point balances when user is available
  useEffect(() => {
    async function fetchAllPointsBalances() {
      if (!user?.id) {
        setEditingPointsBalance(0);
        setRecordingPointsBalance(0);
        setDesignPointsBalance(0);
        return;
      }

      setIsFetchingPoints(true);
      try {
        const pointsTypes = ['editingPoints', 'recordingPoints', 'designPoints'];
        const results = await Promise.all(
          pointsTypes.map(type =>
            fetch(`/api/activePoints?userId=${user.id}&type=${type}`).then(res => res.json())
          )
        );

        setEditingPointsBalance(results[0]?.total || 0);
        setRecordingPointsBalance(results[1]?.total || 0);
        setDesignPointsBalance(results[2]?.total || 0);

      } catch (err) {
        console.error("❌ Error fetching all points balances:", err);
        setMsg("Грешка при зареждане на баланса по точки.");
        setEditingPointsBalance(0);
        setRecordingPointsBalance(0);
        setDesignPointsBalance(0);
      } finally {
        setIsFetchingPoints(false);
      }
    }

    fetchAllPointsBalances();
  }, [user?.id]); // Re-fetch if user.id changes

  useEffect(() => {
    setFormulas(initialFormulas || []);
    if (serverFetchError) {
      setMsg(serverFetchError);
    }
  }, [initialFormulas, serverFetchError]);

  const selectedFormula = useMemo(() => {
    return formulas.find(f => f.id === selectedId);
  }, [formulas, selectedId]);

  useEffect(() => {
    if (!selectedFormula) {
      setValues({});
      if (!serverFetchError && msg.includes('Грешка при зареждане')) setMsg('');
      else if (!serverFetchError) setMsg('');
      return;
    }
    const initialValues = {};
    if (selectedFormula.fields && Array.isArray(selectedFormula.fields)) {
      selectedFormula.fields.forEach(field => {
        if (field.type === 'yesno' || field.type === 'checkbox') {
          initialValues[field.key] = false;
        } else if (field.type === 'number' && (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '')) {
          initialValues[field.key] = field.defaultValue;
        } else if (field.type === 'number') {
            initialValues[field.key] = field.min !== undefined ? String(field.min) : '0';
        } else {
          initialValues[field.key] = '';
        }
      });
    }
    setValues(initialValues);
    if (!serverFetchError || !msg.includes('Грешка при зареждане')) {
      setMsg('');
    }
  }, [selectedId, selectedFormula, serverFetchError, msg]);

  const handleInputChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, checked) => {
    if (typeof checked === 'boolean') {
      setValues(prev => ({ ...prev, [key]: checked }));
    }
  };

  const calculateTotalCost = () => {
    // ... (calculation logic remains the same)
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
            if (!isNaN(quantity) && quantity > 0) total += quantity * Number(field.cost);
            else if (quantity === 0 && field.costIfZero !== undefined) total += Number(field.costIfZero);
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
  };

  const handleFormSubmit = async (event) => {
    // ... (submission logic remains the same)
    event.preventDefault();
    if (!user) { setMsg('Моля, влезте в профила си.'); return; }
    if (!selectedFormula) { setMsg('Моля, изберете формула.'); return; }
    setLoading(true);
    const totalCost = calculateTotalCost();
    if (!selectedFormula.pointsType) {
        setMsg("Грешка: формулата няма тип точки."); setLoading(false); return;
    }
    const spendPayload = { userId: user.id, pointsToSpend: totalCost, pointsType: selectedFormula.pointsType, formulaId: selectedFormula.id, formulaName: selectedFormula.name, filledValues: values, formulaFields: selectedFormula.fields };
    try {
      const res = await fetch('/api/formulas/spend-points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spendPayload) });
      const result = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMsg(result.message || 'Грешка при обработка.');
      } else {
        setMsg(result.message || `Поръчка #${result.order?.id} успешна!`);
        setSelectedId(''); setValues({});
        // Re-fetch points after successful order
        if (user?.id) {
            setIsFetchingPoints(true);
            fetch(`/api/activePoints?userId=${user.id}&type=${selectedFormula.pointsType}`)
                .then(res => res.json())
                .then(data => {
                    if (selectedFormula.pointsType === 'editingPoints') setEditingPointsBalance(data.total || 0);
                    else if (selectedFormula.pointsType === 'recordingPoints') setRecordingPointsBalance(data.total || 0);
                    else if (selectedFormula.pointsType === 'designPoints') setDesignPointsBalance(data.total || 0);
                })
                .catch(err => console.error("Error re-fetching points balance:", err))
                .finally(() => setIsFetchingPoints(false));
        }
        setShowConfirmation(true);
        setLastOrderDetails({
          name: selectedFormula.name,
          total: totalCost,
          filled: values,
          formulaFields: selectedFormula.fields,
        });
      }
    } catch (error) { setLoading(false); setMsg('Неочаквана грешка.'); }
  };

  const availableFormulas = useMemo(() => {
    // ... (filtering logic remains the same)
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
    switch (formType) {
      case 'vlog':
      case 'tiktok':
        return <FontAwesomeIcon icon={faFilm} className="text-accent w-5 h-5" />;
      case 'recording':
        return <FontAwesomeIcon icon={faVideo} className="text-accent w-5 h-5" />;
      case 'thumbnail':
        return <FontAwesomeIcon icon={faPen} className="text-accent w-5 h-5" />;
      default:
        return <FontAwesomeIcon icon={faCoins} className="text-accent w-5 h-5" />;
    }
  };

  // Determine which balance to show primarily based on selected formula
  const currentFormulaPointsType = selectedFormula?.pointsType;
  let primaryBalance = 0;
  let primaryBalanceLabel = "Баланс";

  if (currentFormulaPointsType === 'editingPoints') {
    primaryBalance = editingPointsBalance;
    primaryBalanceLabel = "Баланс Монтаж";
  } else if (currentFormulaPointsType === 'recordingPoints') {
    primaryBalance = recordingPointsBalance;
    primaryBalanceLabel = "Баланс Заснемане";
  } else if (currentFormulaPointsType === 'designPoints') {
    primaryBalance = designPointsBalance;
    primaryBalanceLabel = "Баланс Дизайн";
  } else if (user) { // Default if no formula selected or formula has no specific type
    primaryBalance = editingPointsBalance; // Or some other default like total of all points
    primaryBalanceLabel = "Баланс Монтаж";
  }


  if (!isClientReady) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 flex justify-center items-center">
        <p className="text-gray-400">Зареждане...</p>
      </div>
    );
  }

  const formElementClassName = "w-full bg-gray-700 border-gray-600 px-4 py-2.5 rounded-lg text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
  const selectTriggerClassName = `${formElementClassName} flex items-center justify-between`;
  const selectContentClassName = "bg-gray-700 border-gray-600 text-white rounded-md shadow-lg z-50";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
  <div className="min-h-screen bg-gray-900 text-white pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-accent mb-2">
            {selectedFormula ? selectedFormula.name : "Използвай Услуга"}
          </h1>
          <p className="text-gray-400 text-md">
            {selectedFormula ? selectedFormula.description || "Попълнете опциите по-долу." : "Изберете услуга, за да видите нейните опции и да изчислите цената."}
          </p>
        </div>

        {/* Updated Balance Section */}
        <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-lg border border-gray-700/80 space-y-5">
          {/* Grid for Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Баланс Монтаж</p>
              <p className="text-xl font-semibold text-accent flex items-center gap-2">
  <FontAwesomeIcon icon={faCoins} className="text-yellow-400 w-5 h-5" />
                {isFetchingPoints ? '...' : editingPointsBalance} т.
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Баланс Заснемане</p>
              <p className="text-xl font-semibold text-accent flex items-center gap-2">
  <FontAwesomeIcon icon={faCoins} className="text-yellow-400 w-5 h-5" />
                {isFetchingPoints ? '...' : recordingPointsBalance} т.
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Баланс Дизайн</p>
              <p className="text-xl font-semibold text-accent flex items-center gap-2">
  <FontAwesomeIcon icon={faCoins} className="text-yellow-400 w-5 h-5" />
                {isFetchingPoints ? '...' : designPointsBalance} т.
              </p>
            </div>
          </div>
          
          {/* Separator - Optional, if you want it above the button */}
          {/* <hr className="border-gray-700 !my-5" />  */}

          {/* "Купи точки" Button */}
          <div className="pt-1"> {/* Add some top padding if separator is removed */}
            <Link href="/points" passHref legacyBehavior>
              <Button 
                variant="default" 
                className="bg-white text-accent hover:bg-gray-200 h-10 px-6 text-sm font-semibold rounded-lg w-full sm:w-auto shadow"
              >
                  Купи точки
              </Button>
            </Link>
          </div>
        </div>

        {/* ... (rest of your JSX: Formula Selector, Dynamic Form, Messages) remains the same as your last working version ... */}
        {/* Formula Selector */}
        {initialFormulas.length === 0 && !serverFetchError && !msg.includes('Грешка') ? (
             <p className="text-gray-400 text-center py-4">Няма налични формули.</p>
        ) : availableFormulas.length > 0 ? (
          <div className="space-y-2">
            <Label className={labelClassName}>Избор на формула:</Label>
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger className={selectTriggerClassName} aria-label="Избери формула">
                <SelectValue placeholder="— Избери формула —" />
              </SelectTrigger>
              <SelectContent className={selectContentClassName}>
                {availableFormulas.map(f => (
                  <SelectItem key={f.id} value={f.id} className="focus:bg-gray-600 hover:bg-gray-600/80">
                    {f.name} (Базова цена: {f.basePrice || 0}т.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : !serverFetchError ? (
             <p className="text-gray-400 text-center py-4">Няма достъпни формули за вашия акаунт.</p>
        ) : null }

        {msg && !selectedFormula && (
            <p className={`text-center font-medium p-3 rounded-md ${msg.includes('Грешка') ? 'bg-red-800/30 text-red-300' : 'bg-blue-800/30 text-blue-300'}`}>
                {msg}
            </p>
        )}

        {selectedFormula && selectedFormula.fields && (
          <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                {getFormulaIcon(selectedFormula.formType)}
                <h2 className="text-xl font-semibold">{selectedFormula.name}</h2>
              </div>
              <h2 className="text-xl font-semibold text-white">
                {selectedFormula.name || "Детайли"}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {selectedFormula.fields.map(field => (
                  <div key={field.id || field.key} className="space-y-1.5">
                    <Label htmlFor={field.key} className={labelClassName}>
                      {field.label}
                    </Label>
                    {(field.type === 'text' || field.type === 'number' || field.type === 'textarea') && (
                      field.type === 'textarea' ? (
                        <Textarea id={field.key} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementClassName} rows={3} placeholder={field.placeholder || ''} />
                      ) : (
                        <Input id={field.key} type={field.type === 'number' ? 'number' : 'text'} value={values[field.key] || ''} onChange={(e) => handleInputChange(field.key, e.target.value)} className={formElementClassName} placeholder={field.placeholder || (field.type === 'number' ? '0' : '')} />
                      )
                    )}
                    {(field.type === 'yesno' || field.type === 'checkbox') && (
                      <div className="flex items-center space-x-2.5 pt-2">
                        <Checkbox
                          id={field.key}
                          checked={!!values[field.key]} // Ensures true/false, not string
                          onCheckedChange={(checked) => handleCheckboxChange(field.key, checked)}
                          className="h-5 w-5 data-[state=checked]:bg-accent border-gray-500"
                        />       
                        <Label htmlFor={field.key} className="text-sm text-gray-300 cursor-pointer select-none">
                          Да (+{field.costYes || 0}т.) / Не (+{field.costNo || 0}т.)
                        </Label>
                      </div>
                    )}
                    {field.type === 'dropdown' && field.options && Array.isArray(field.options) && (
                      <Select onValueChange={(value) => handleInputChange(field.key, value)} value={values[field.key] || ''}>
                        <SelectTrigger className={selectTriggerClassName}><SelectValue placeholder="— избери —" /></SelectTrigger>
                        <SelectContent className={selectContentClassName}>
                          {field.options.map((opt, i) => (
                            <SelectItem key={opt.value || i} value={opt.value} className="focus:bg-gray-600 hover:bg-gray-600/80">{opt.label} (+{opt.cost || 0}т.)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-gray-700 mt-6">
                <p className="text-right font-semibold text-xl">
                  Общо точки: <span className="text-accent">{calculateTotalCost()}</span>
                </p>
              </div>
              <Button type="submit" disabled={loading || !selectedId} className="w-full bg-accent hover:bg-accent/90 disabled:bg-gray-600 text-white font-semibold py-3 text-base rounded-lg h-11 transition-colors">
                {loading ? 'Изпращане…' : 'Потвърди и изразходвай точки'}
              </Button>
            </form>
          </div>
        )}

        {msg && selectedFormula && (
          <p className={`mt-6 text-center font-medium p-3 rounded-md ${msg.startsWith('Успешно') ? 'bg-green-800/40 text-green-300' : 'bg-red-800/40 text-red-300'}`}>
            {msg}
          </p>
        )}

      </div>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent">
              ✅ Поръчката е приета!
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              Благодарим Ви! Ще се свържем с Вас възможно най-скоро.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-60 overflow-y-auto bg-gray-800 p-3 rounded text-sm space-y-1">
            <p className="mb-1 text-accent font-semibold">Въведени данни:</p>
            <ul className="space-y-1">
              {lastOrderDetails?.filled &&
                lastOrderDetails.formulaFields?.map((field) => {
                  const value = lastOrderDetails.filled[field.key];
                  const label = field.label;
                  const type = field.type;

                  const renderValue = () => {
                    if (type === "checkbox" || type === "yesno") {
                      return value ? "Да" : "Не";
                    }
                    return String(value ?? "");
                  };

                  const cost = (() => {
                    if (type === "checkbox" || type === "yesno") {
                      return value ? field.costYes : field.costNo;
                    }
                    if (type === "number") {
                      const val = Number(value);
                      if (!isNaN(val)) return val * (field.cost || 0);
                    }
                    if (type === "text" || type === "textarea") {
                      return field.cost || 0;
                    }
                    if (type === "dropdown" && field.options) {
                      const selected = field.options.find((opt) => opt.value === value);
                      return selected?.cost || 0;
                    }
                    return null;
                  })();

                  return (
                    <li key={field.key}>
                      <span className="text-gray-300">{label}:</span>{" "}
                      {renderValue()}
                      {cost !== null && !isNaN(cost) ? (
                        <span className="text-gray-400"> ({cost} т.)</span>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </div>

          <DialogFooter className="pt-6">
            <Button onClick={() => setShowConfirmation(false)} className="w-full bg-accent text-white">
              Разбрах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    
  );
}