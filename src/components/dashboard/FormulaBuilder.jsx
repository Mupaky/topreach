// src/components/dashboard/FormulaBuilder.jsx
'use client';

import { useState, useEffect } from 'react';

// Helper to generate simple unique IDs
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// --- Helper Function to Get Default Cost Structure ---
const getDefaultCostStructure = (type) => {
    switch (type) {
        case 'yesno':
        case 'checkbox':
            return { costYes: 0, costNo: 0 };
        case 'dropdown':
            return { options: [] }; // Costs are stored *within* options for dropdown
        default: // text, number, textarea
            return { cost: 0 };
    }
};

const FormulaBuilder = ({ onSubmit, formula }) => {
    // --- Top-level Formula State ---
    const [name, setName] = useState('');
    const [formType, setFormType] = useState('vlog'); // Main category for the formula
    const [customFormTypes, setCustomFormTypes] = useState([]); // List of available custom types/tags FOR THIS FORMULA
    const [newFormTypeEntry, setNewFormTypeEntry] = useState(''); // Input for adding new custom types to the formula's list
    const [access, setAccess] = useState('admin');
    const [basePrice, setBasePrice] = useState(0);
    const [pointsType, setPointsType] = useState('editingPoints'); // Formula's main pointsType (for basePrice)
    const [fields, setFields] = useState([]);
    const [description, setDescription] = useState('');

    // Load formula when editing, or reset form if no formula
    useEffect(() => {
        if (formula && formula.id) {
            setName(formula.name || '');
            setDescription(formula.description || '');
            setFormType(formula.formType || 'vlog');
            
            const loadedCustomTypes = Array.isArray(formula.customFormTypes) ? formula.customFormTypes : [];
            setCustomFormTypes(loadedCustomTypes);

            const standardTypes = ['vlog', 'tiktok', 'thumbnail', 'recording'];
            if (formula.formType && !standardTypes.includes(formula.formType) && !loadedCustomTypes.includes(formula.formType)) {
                setCustomFormTypes(prev => [...new Set([...prev, formula.formType])]);
            }
            
            setAccess(formula.access || 'admin');
            setBasePrice(formula.basePrice !== undefined ? Number(formula.basePrice) : 0);
            setPointsType(formula.pointsType || 'editingPoints');

            setFields((formula.fields || []).map(f => ({
                ...f,
                id: f.id || generateId(),
                pointsType: f.pointsType || 'editingPoints', // Default for loaded field
                associatedFormTypes: Array.isArray(f.associatedFormTypes) ? f.associatedFormTypes : [], // NEW
                // Ensure numeric types for costs
                cost: f.cost !== undefined ? Number(f.cost) : (f.type !== 'yesno' && f.type !== 'checkbox' && f.type !== 'dropdown' ? 0 : undefined),
                costYes: f.costYes !== undefined ? Number(f.costYes) : ((f.type === 'yesno' || f.type === 'checkbox') ? 0 : undefined),
                costNo: f.costNo !== undefined ? Number(f.costNo) : ((f.type === 'yesno' || f.type === 'checkbox') ? 0 : undefined),
                options: (f.type === 'dropdown' && Array.isArray(f.options)) 
                    ? f.options.map(opt => ({...opt, cost: Number(opt.cost) || 0, label: opt.label || '', value: opt.value || ''})) 
                    : (f.type === 'dropdown' ? [] : undefined),
            })));
            setNewFormTypeEntry('');
        } else {
            // Reset all fields for a new formula
            setName(''); setDescription(''); setFormType('vlog'); setCustomFormTypes([]);
            setNewFormTypeEntry(''); setAccess('admin'); setBasePrice(0);
            setPointsType('editingPoints'); setFields([]);
        }
    }, [formula]);

    // --- Manage Formula-Level Custom Types/Tags ---
    const handleAddCustomFormTypeToList = () => {
        const trimmedNewType = newFormTypeEntry.trim();
        if (trimmedNewType && !customFormTypes.includes(trimmedNewType) && !['vlog', 'tiktok', 'thumbnail', 'recording'].includes(trimmedNewType)) {
            setCustomFormTypes(prev => [...prev, trimmedNewType]);
            // setFormType(trimmedNewType); // Optionally select it, or not
            setNewFormTypeEntry('');
        } else if (trimmedNewType) {
            alert(`Тип "${trimmedNewType}" вече съществува или е стандартен.`);
        }
    };
    const handleRemoveCustomFormTypeFromList = (typeToRemove) => {
        setCustomFormTypes(prev => prev.filter(type => type !== typeToRemove));
        if (formType === typeToRemove) setFormType('vlog');
        setFields(prevFields => prevFields.map(f => ({
            ...f,
            associatedFormTypes: (f.associatedFormTypes || []).filter(aft => aft !== typeToRemove)
        })));
    };

    // --- Manage Dynamic Fields ---
    const addField = () => {
        const newFieldType = 'text';
        setFields(prevFields => [
            ...prevFields,
            {
                id: generateId(), label: '', key: '', type: newFieldType,
                options: [],
                pointsType: pointsType, // Default to formula's main pointsType
                associatedFormTypes: [], // Initialize new field property
                ...getDefaultCostStructure(newFieldType),
            },
        ]);
    };

    const updateField = (id, updates) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === id) {
                const updatedField = { ...f, ...updates };
                if ('type' in updates && updates.type !== f.type) {
                    const newStructure = getDefaultCostStructure(updates.type);
                    delete updatedField.cost; delete updatedField.costYes; delete updatedField.costNo;
                    if (updates.type === 'dropdown' && !Array.isArray(updatedField.options)) updatedField.options = [];
                    Object.assign(updatedField, newStructure);
                }
                if ('cost' in updatedField) updatedField.cost = parseFloat(updatedField.cost) || 0;
                if ('costYes' in updatedField) updatedField.costYes = parseFloat(updatedField.costYes) || 0;
                if ('costNo' in updatedField) updatedField.costNo = parseFloat(updatedField.costNo) || 0;

                if (updatedField.type === 'dropdown' && Array.isArray(updatedField.options)) {
                    updatedField.options = updatedField.options.map(opt => ({
                        ...opt,
                        cost: parseFloat(opt.cost) || 0,
                        label: opt.label ?? '', value: opt.value ?? ''
                    }));
                }
                return updatedField;
            }
            return f;
        }));
    };

    const handleFieldCustomTypeToggle = (fieldId, typeName) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId) {
                const currentlyAssociated = f.associatedFormTypes || [];
                const newAssociated = currentlyAssociated.includes(typeName)
                    ? currentlyAssociated.filter(t => t !== typeName)
                    : [...currentlyAssociated, typeName];
                return { ...f, associatedFormTypes: newAssociated };
            }
            return f;
        }));
    };

    const addDropdownOption = (fieldId) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId && f.type === 'dropdown') {
                return { ...f, options: [...(f.options || []), { label: '', value: '', cost: 0 }] };
            }
            return f;
        }));
    };
    const updateDropdownOption = (fieldId, optionIndex, optionUpdates) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId && f.type === 'dropdown' && f.options) {
                const newOptions = [...f.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], ...optionUpdates };
                if ('cost' in optionUpdates) newOptions[optionIndex].cost = parseFloat(newOptions[optionIndex].cost) || 0;
                return { ...f, options: newOptions };
            }
            return f;
        }));
    };
    const removeDropdownOption = (fieldId, optionIndex) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId && f.type === 'dropdown' && f.options) {
                return { ...f, options: f.options.filter((_, index) => index !== optionIndex) };
            }
            return f;
        }));
    };
    const deleteField = (id) => {
        setFields(prevFields => prevFields.filter(f => f.id !== id));
    };

    // --- Form Submission ---
    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = true;
        const fieldKeys = new Set();

        fields.forEach(field => { // Basic validation loop
            if (!field.label.trim() || !field.key.trim()) { alert(`Грешка: Поле ID ${field.id} трябва да има Етикет и Ключ.`); isValid = false; return; }
            if (!/^[a-zA-Z0-9_]+$/.test(field.key)) { alert(`Грешка: Ключ "${field.key}" може да съдържа само латиница, цифри и долна черта.`); isValid = false; return; }
            if (fieldKeys.has(field.key)) { alert(`Грешка: Ключ "${field.key}" трябва да е уникален.`); isValid = false; return; }
            fieldKeys.add(field.key);
            if (!['editingPoints', 'recordingPoints', 'designPoints'].includes(field.pointsType)) {
                alert(`Грешка: Поле "${field.label}" има невалиден тип точки: "${field.pointsType}".`); isValid = false; return;
            }
            if (field.type === 'dropdown') {
                if (!Array.isArray(field.options) || field.options.length === 0) { alert(`Грешка: Падащо меню "${field.label}" трябва да има поне една опция.`); isValid = false; return; }
                const optionValues = new Set();
                field.options.forEach((opt, index) => {
                    if (!opt.label.trim() || !opt.value.trim()) { alert(`Грешка: Опция ${index + 1} за "${field.label}" трябва да има Етикет и Стойност.`); isValid = false; }
                    if (optionValues.has(opt.value)) { alert(`Грешка: Стойностите на опциите в "${field.label}" трябва да са уникални. Дубликат: "${opt.value}"`); isValid = false; }
                    optionValues.add(opt.value);
                    if (typeof opt.cost !== 'number' || isNaN(opt.cost)) { alert(`Грешка: Опция "${opt.label}" за "${field.label}" има невалидна цена.`); isValid = false; }
                });
            } else if (field.type === 'yesno' || field.type === 'checkbox') {
                if (typeof field.costYes !== 'number' || isNaN(field.costYes) || typeof field.costNo !== 'number' || isNaN(field.costNo)) { alert(`Грешка: Поле "${field.label}" (Да/Не) има невалидни цени.`); isValid = false; }
            } else { // text, number, textarea
                if (typeof field.cost !== 'number' || isNaN(field.cost)) { alert(`Грешка: Поле "${field.label}" има невалидна цена.`); isValid = false; }
            }
            if(!isValid) return;
        });
        if (!isValid) { console.error("Formula validation failed during field iteration."); return; }
        if (!name.trim()) { alert("Грешка: Името на формулата е задължително."); return; }
        if ((parseFloat(basePrice) || 0) < 0) { alert("Грешка: Базовата цена не може да е отрицателна."); return; }


        const finalFields = fields.map(field => {
            const finalFieldData = {
                id: field.id, label: field.label, key: field.key, type: field.type,
                pointsType: field.pointsType,
                associatedFormTypes: field.associatedFormTypes || [], // Ensure it's an array
                // Optional properties
                ...(field.placeholder && { placeholder: field.placeholder }),
                ...(field.min !== undefined && field.min !== '' && { min: Number(field.min) }),
                ...(field.max !== undefined && field.max !== '' && { max: Number(field.max) }),
                ...(field.step !== undefined && field.step !== '' && { step: Number(field.step) }),
                ...(field.defaultValue !== undefined && { defaultValue: field.defaultValue }), // Could be boolean, number, or string
                ...(field.required !== undefined && { required: !!field.required }),
                ...(field.description && { description: field.description }),
            };
            switch (field.type) {
                case 'yesno': case 'checkbox':
                    finalFieldData.costYes = Number(field.costYes) || 0;
                    finalFieldData.costNo = Number(field.costNo) || 0;
                    break;
                case 'dropdown':
                    finalFieldData.options = (field.options || []).map(opt => ({
                        label: opt.label || '', value: opt.value || '', cost: Number(opt.cost) || 0,
                    }));
                    break;
                default: // text, number, textarea
                    finalFieldData.cost = Number(field.cost) || 0;
                    break;
            }
            return finalFieldData;
        });

        const formulaData = {
            name, formType, access,
            basePrice: parseFloat(basePrice) || 0,
            pointsType: pointsType, // This is the main pointsType for the formula's basePrice
            description,
            customFormTypes: [...new Set(customFormTypes)], // Unique list of defined tags for this formula
            fields: finalFields,
        };

        console.log("Submitting formula data:", JSON.stringify(formulaData, null, 2));
        if (formula?.id) {
            onSubmit({ ...formulaData, id: formula.id });
        } else {
            onSubmit(formulaData);
        }
    };

    // --- JSX ---
    return (
        <form onSubmit={handleSubmit} className="space-y-8 text-white p-4 sm:p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-4 mb-8 text-accentLighter">
                {formula?.id ? "Редактирай Формула" : "Създай Нова Формула"}
            </h2>

            {/* --- Top Level Formula Inputs --- */}
            <section className="space-y-6 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700/50 pb-2">Основни Настройки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <label className="label-xs">Име на Формула <span className="text-red-500">*</span></label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Напр. Влог - Пълен Пакет" className="dynamic-field-input"/>
                    </div>
                    <div>
                        <label className="label-xs">Основен Тип/Категория на Формулата</label>
                        <select value={formType} onChange={(e) => setFormType(e.target.value)} className="dynamic-field-input">
                            <option value="vlog">Vlog</option><option value="tiktok">TikTok</option>
                            <option value="thumbnail">Thumbnail</option><option value="recording">Recording</option>
                            {customFormTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-xs">Ниво на Достъп</label>
                        <select value={access} onChange={(e) => setAccess(e.target.value)} className="dynamic-field-input">
                            <option value="admin">Admin Only</option><option value="user">Logged-in Users</option><option value="public">Public</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-xs">Тип Точки за Базовата Цена</label>
                        <select value={pointsType} onChange={(e) => setPointsType(e.target.value)} className="dynamic-field-input">
                            <option value="editingPoints">Editing Points</option><option value="recordingPoints">Recording Points</option><option value="designPoints">Design Points</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-xs">Базова Цена (в <span className="text-accentLighter">{pointsType}</span>) <span className="text-red-500">*</span></label>
                        <input type="number" min="0" step="any" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0" required className="dynamic-field-input"/>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="label-xs">Описание на Формулата (за потребителя)</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="dynamic-field-input" rows={2} placeholder="Кратко описание на услугата..."></textarea>
                    </div>
                </div>
            </section>

            {/* Section for Managing Formula-Level Custom Types/Tags */}
            <section className="mt-6 pt-6 border-t border-gray-700 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                 <label className="block text-sm font-semibold mb-2 text-gray-200">Дефинирай Допълнителни Типове/Тагове за Тази Формула</label>
                 <p className="text-xs text-gray-400 mb-3">Тези тагове могат да бъдат асоциирани с отделни полета по-долу.</p>
                <div className="flex items-center space-x-2 mb-3">
                    <input
                        type="text"
                        placeholder="Напр. 'комбинирана услуга', 'видео_продукция'"
                        value={newFormTypeEntry}
                        onChange={(e) => setNewFormTypeEntry(e.target.value)}
                        className="dynamic-field-input flex-grow"
                    />
                    <button type="button" onClick={handleAddCustomFormTypeToList} className="btn-green text-sm whitespace-nowrap py-2">➕ Добави Тип</button>
                </div>
                {customFormTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-700/30 rounded-md border border-gray-600">
                        {customFormTypes.map(type => (
                            <span key={type} className="bg-gray-600 text-xs text-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
                                {type}
                                <button type="button" onClick={() => handleRemoveCustomFormTypeFromList(type)} className="text-red-400 hover:text-red-300 leading-none text-md font-bold" title={`Премахни таг "${type}"`}>×</button>
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* --- Dynamic Fields Section --- */}
            <section className="mt-10 pt-6 border-t border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-200">Полета на Формулата</h3>
                </div>

                {fields.length === 0 && <p className="text-gray-500 italic text-center py-4">Все още няма добавени полета.</p>}

                {fields.map((field, fieldIndex) => (
                    <div key={field.id} className="border border-gray-600 rounded-lg p-4 sm:p-5 mb-6 bg-gray-700/20 shadow-lg space-y-4 relative">
                        <button type="button" onClick={() => deleteField(field.id)} className="absolute top-3 right-3 btn-delete" aria-label="Изтрий Поле" title="Изтрий Поле"> × </button>
                        <p className="text-xs text-gray-500 absolute top-3 left-3">Поле #{fieldIndex + 1}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 pt-6">
                            <div>
                                <label htmlFor={`field-label-${field.id}`} className="label-xs">Етикет <span className="text-red-500">*</span></label>
                                <input id={`field-label-${field.id}`} placeholder="Напр. Озвучаване" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="dynamic-field-input" required />
                            </div>
                            <div>
                                <label htmlFor={`field-key-${field.id}`} className="label-xs">Ключ (a-z,0-9,_) <span className="text-red-500">*</span></label>
                                <input id={`field-key-${field.id}`} placeholder="Напр. voice_over" value={field.key} onChange={(e) => updateField(field.id, { key: e.target.value.trim().replace(/\s+/g, '_').toLowerCase() })} className="dynamic-field-input font-mono" required pattern="^[a-z0-9_]+$" title="Малки латински букви, цифри, долна черта" />
                            </div>
                            <div>
                                <label htmlFor={`field-type-${field.id}`} className="label-xs">Тип</label>
                                <select id={`field-type-${field.id}`} value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value })} className="dynamic-field-input" >
                                    <option value="text">Текст</option> <option value="number">Число</option> <option value="yesno">Да / Не</option>
                                    <option value="checkbox">Чекбокс</option> <option value="dropdown">Падащо Меню</option> <option value="textarea">Текстово Поле</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <label htmlFor={`field-pointsType-${field.id}`} className="label-xs">Тип Точки за Разход на Полето</label>
                                <select id={`field-pointsType-${field.id}`} value={field.pointsType || pointsType} onChange={(e) => updateField(field.id, { pointsType: e.target.value })} className="dynamic-field-input">
                                    <option value="editingPoints">Editing Points</option> <option value="recordingPoints">Recording Points</option> <option value="designPoints">Design Points</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`field-desc-${field.id}`} className="label-xs">Описание на Полето (показва се на потребителя)</label>
                                <input id={`field-desc-${field.id}`} type="text" placeholder="Напр. Добави музика към видеото" value={field.description || ''} onChange={(e) => updateField(field.id, { description: e.target.value })} className="dynamic-field-input" />
                            </div>
                        </div>

                        {/* Associated Custom Form Types for this Field */}
                        {customFormTypes.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-600/50">
                                <label className="label-xs block mb-2">Приложи Тагове към Това Поле (от дефинираните за формулата):</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 max-h-32 overflow-y-auto p-2 bg-gray-700/30 rounded border border-gray-600">
                                    {customFormTypes.map(typeKey => (
                                        <div key={typeKey} className="flex items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                id={`field-${field.id}-tag-${typeKey}`}
                                                checked={(field.associatedFormTypes || []).includes(typeKey)}
                                                onChange={() => handleFieldCustomTypeToggle(field.id, typeKey)}
                                                className="h-3.5 w-3.5 text-accent bg-gray-600 border-gray-500 rounded focus:ring-accent focus:ring-offset-gray-800 cursor-pointer"
                                            />
                                            <label htmlFor={`field-${field.id}-tag-${typeKey}`} className="text-xs text-gray-300 select-none cursor-pointer">
                                                {typeKey}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing Rules Section */}
                        <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-300">Ценообразуване (в <span className="text-accentLighter">{field.pointsType || 'избрания тип'}</span> точки)</h4>
                            {(field.type === 'text' || field.type === 'textarea') && (
                                <div><label className="label-xs">Цена (ако полето е попълнено)</label><input type="number" step="any" placeholder="Точки" value={field.cost ?? ''} onChange={(e) => updateField(field.id, { cost: e.target.value })} className="dynamic-field-input w-full sm:w-32" /></div>
                            )}
                            {field.type === 'number' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div><label className="label-xs">Цена за единица</label><input type="number" step="any" placeholder="Точки" value={field.cost ?? ''} onChange={(e) => updateField(field.id, { cost: e.target.value })} className="dynamic-field-input" /></div>
                                    <div><label className="label-xs">Цена ако е 0 (специална)</label><input type="number" step="any" placeholder="Точки (опц.)" value={field.costIfZero ?? ''} onChange={(e) => updateField(field.id, { costIfZero: e.target.value })} className="dynamic-field-input" title="Цена, ако потребителят въведе 0 в числовото поле." /></div>
                                </div>
                            )}
                            {(field.type === 'yesno' || field.type === 'checkbox') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="label-xs">Цена ако Да / Маркирано</label><input type="number" step="any" placeholder="Точки" value={field.costYes ?? ''} onChange={(e) => updateField(field.id, { costYes: e.target.value })} className="dynamic-field-input" /></div>
                                    <div><label className="label-xs">Цена ако Не / Немаркирано</label><input type="number" step="any" placeholder="Точки" value={field.costNo ?? ''} onChange={(e) => updateField(field.id, { costNo: e.target.value })} className="dynamic-field-input" /></div>
                                </div>
                            )}
                            {field.type === 'dropdown' && (
                                <div className="space-y-3 mt-2">
                                    <label className="label-xs block -mb-1">Опции и Цени за Падащо Меню</label>
                                    {(!field.options || field.options.length === 0) && <p className="text-xs text-gray-500 italic">Няма дефинирани опции.</p>}
                                    {field.options?.map((option, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border border-gray-600 p-2.5 rounded-md bg-gray-700/40">
                                            <input type="text" placeholder="Етикет на Опция" value={option.label} onChange={(e) => updateDropdownOption(field.id, index, { label: e.target.value })} className="dynamic-field-input flex-1 min-w-[100px]" required />
                                            <input type="text" placeholder="Стойност на Опция" value={option.value} onChange={(e) => updateDropdownOption(field.id, index, { value: e.target.value.trim() })} className="dynamic-field-input flex-1 min-w-[100px] font-mono" required />
                                            <input type="number" step="any" placeholder="Цена" value={option.cost ?? ''} onChange={(e) => updateDropdownOption(field.id, index, { cost: e.target.value })} className="dynamic-field-input w-full sm:w-24" title="Точки за тази опция" />
                                            <button type="button" onClick={() => removeDropdownOption(field.id, index)} className="btn-delete-xs self-center sm:self-auto mt-1 sm:mt-0" aria-label="Премахни Опция" title="Премахни Опция">×</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addDropdownOption(field.id)} className="btn-accent mt-2 text-xs">+ Добави Опция</button>
                                </div>
                            )}
                        </div>

                        {/* Optional: Required Checkbox and Number Attributes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-700/30 items-center">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id={`required-${field.id}`} checked={!!field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="h-4 w-4 text-accent bg-gray-600 border-gray-500 rounded focus:ring-accent focus:ring-offset-gray-800 cursor-pointer" />
                                <label htmlFor={`required-${field.id}`} className="label-xs !mb-0 text-gray-300 cursor-pointer">Задължително поле</label>
                            </div>
                            {field.type === 'number' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end col-span-full md:col-span-1 mt-3 md:mt-0"> {/* Spans full on small, part on md */}
                                    <div><label className="label-xs">Placeholder</label><input type="text" value={field.placeholder || ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} className="dynamic-field-input"/></div>
                                    <div><label className="label-xs">Мин.</label><input type="number" value={field.min ?? ''} onChange={(e) => updateField(field.id, { min: e.target.value })} className="dynamic-field-input"/></div>
                                    <div><label className="label-xs">Макс.</label><input type="number" value={field.max ?? ''} onChange={(e) => updateField(field.id, { max: e.target.value })} className="dynamic-field-input"/></div>
                                    <div><label className="label-xs">Стъпка</label><input type="number" step="any" value={field.step ?? ''} onChange={(e) => updateField(field.id, { step: e.target.value })} className="dynamic-field-input"/></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addField} className="btn-green text-sm font-semibold"> + Добави Поле </button>
            </section>
            {/* --- End Dynamic Fields Section --- */}

            <div className="pt-8 mt-10 border-t border-gray-700 text-right">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition text-base shadow-lg">
                    💾 {formula?.id ? "Обнови Формула" : "Запази Формула"}
                </button>
            </div>

            <style jsx>{`
                .dynamic-field-input {
                    @apply w-full bg-gray-700 border border-gray-600 px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent text-white text-sm placeholder-gray-400;
                }
                select.dynamic-field-input {
                    @apply appearance-none bg-no-repeat;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem; 
                }
                .label-xs { @apply block text-xs font-medium text-gray-400 mb-1; }
                .btn-green { @apply bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-150 text-sm; }
                .btn-delete { @apply text-red-500 hover:text-red-400 font-bold text-xl leading-none p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition; }
                .btn-delete-xs { @apply text-red-400 hover:text-red-600 text-lg leading-none px-1.5 py-0.5 rounded bg-gray-700 hover:bg-gray-600 transition; } /* Adjusted for better fit */
                .btn-accent { @apply text-xs bg-accent px-2 py-1 rounded text-white hover:bg-accentLighter transition; }
            `}</style>
        </form>
    );
};

export default FormulaBuilder;