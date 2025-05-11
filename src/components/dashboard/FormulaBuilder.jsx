// src/components/dashboard/FormulaBuilder.jsx
'use client';

import { useState, useEffect } from 'react';

// Helper to generate simple unique IDs
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// --- Helper Function to Get Default Cost Structure ---
// Ensures the correct cost fields exist when type changes
const getDefaultCostStructure = (type) => {
    switch (type) {
        case 'yesno':
        case 'checkbox':
            return { costYes: 0, costNo: 0 };
        case 'dropdown':
            return { options: [] }; // Costs are stored *within* options for dropdown
        case 'text':
        case 'number':
        case 'textarea':
        default:
            return { cost: 0 };
    }
};

const FormulaBuilder = ({ onSubmit, formula }) => {
    const [name, setName] = useState(formula?.name || '');
    const [formType, setFormType] = useState(formula?.formType || 'vlog');
    const [customFormTypes, setCustomFormTypes] = useState([]);
    const [newFormType, setNewFormType] = useState('');
    const [access, setAccess] = useState(formula?.access || 'admin');
    const [basePrice, setBasePrice] = useState(formula?.basePrice || 0);
    const [pointsType, setPointsType] = useState(formula?.pointsType || 'editingPoints');
    const [fields, setFields] = useState([]);
    const [description, setDescription] = useState(formula?.description || '');

    // Load formula when editing
  useEffect(() => {
    if (formula) {
      setName(formula.name || '');
      setFormType(formula.formType || 'vlog');
      setAccess(formula.access || 'admin');
      setBasePrice(formula.basePrice || 0);
      setPointsType(formula.pointsType || 'editingPoints');
      setDescription(formula.description || '');
      setFields(formula.fields || []); // Ensure fields are loaded
    } else {
      // Reset fields if no formula is provided (e.g., creating new)
      setName('');
      setFormType('vlog');
      setCustomFormTypes([]);
      setNewFormType('');
      setAccess('admin');
      setBasePrice(0);
      setPointsType('editingPoints');
      setFields([]);
      setDescription('');
    }
  }, [formula]);

    const addField = () => {
        const newFieldType = 'text'; // Default type for new fields
        setFields([
        ...fields,
        {
            id: generateId(),
            label: '',
            key: '',
            type: newFieldType,
            options: [], // Initialize options array, relevant for dropdown
            ...getDefaultCostStructure(newFieldType),
        },
        ]);
    };

    const updateField = (id, updates) => {
        setFields(fields.map(f => {
            if (f.id === id) {
                const updatedField = { ...f, ...updates };

                if ('type' in updates && updates.type !== f.type) {
                    const newStructure = getDefaultCostStructure(updates.type);
                    delete updatedField.cost;
                    delete updatedField.costYes;
                    delete updatedField.costNo;
                    if (updates.type === 'dropdown' && !Array.isArray(updatedField.options)) {
                         updatedField.options = [];
                    }
                    Object.assign(updatedField, newStructure);
                }

                 if ('cost' in updatedField && typeof updatedField.cost !== 'number') {
                    updatedField.cost = parseFloat(updatedField.cost) || 0;
                 }
                 if ('costYes' in updatedField && typeof updatedField.costYes !== 'number') {
                    updatedField.costYes = parseFloat(updatedField.costYes) || 0;
                 }
                  if ('costNo' in updatedField && typeof updatedField.costNo !== 'number') {
                    updatedField.costNo = parseFloat(updatedField.costNo) || 0;
                 }

                 if (updatedField.type === 'dropdown' && Array.isArray(updatedField.options)) {
                    updatedField.options = updatedField.options.map(opt => ({
                        ...opt,
                        cost: typeof opt.cost !== 'number' ? (parseFloat(opt.cost) || 0) : opt.cost,
                        label: opt.label ?? '',
                        value: opt.value ?? ''
                    }));
                 }
                return updatedField;
            }
            return f;
        }));
    };

    const addDropdownOption = (fieldId) => {
        updateField(fieldId, {
            options: [
                ...(fields.find(f => f.id === fieldId)?.options || []),
                { label: '', value: '', cost: 0 }
            ]
        });
    };

    const updateDropdownOption = (fieldId, optionIndex, optionUpdates) => {
         const field = fields.find(f => f.id === fieldId);
         if (!field || !field.options) return;

         const newOptions = [...field.options];
         newOptions[optionIndex] = { ...newOptions[optionIndex], ...optionUpdates };

          if ('cost' in optionUpdates) {
             newOptions[optionIndex].cost = parseFloat(newOptions[optionIndex].cost) || 0;
         }
         updateField(fieldId, { options: newOptions });
    };

     const removeDropdownOption = (fieldId, optionIndex) => {
        const field = fields.find(f => f.id === fieldId);
         if (!field || !field.options) return;
         const newOptions = field.options.filter((_, index) => index !== optionIndex);
         updateField(fieldId, { options: newOptions });
     };

    const deleteField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
         let isValid = true;
         const fieldKeys = new Set();

         fields.forEach(field => {
            if (!field.label.trim() || !field.key.trim()) {
                alert(`Error: Field "${field.label || field.key || `ID: ${field.id}`}" must have a Label and a Key.`);
                isValid = false; return;
            }
             if (!/^[a-zA-Z0-9_]+$/.test(field.key)) {
                 alert(`Error: Field Key "${field.key}" can only contain letters, numbers, and underscores.`);
                 isValid = false; return;
             }
            if (fieldKeys.has(field.key)) {
                alert(`Error: Field Key "${field.key}" must be unique.`);
                isValid = false; return;
            }
            fieldKeys.add(field.key);

            if (field.type === 'dropdown') {
                if (!Array.isArray(field.options) || field.options.length === 0) {
                    alert(`Error: Dropdown field "${field.label}" must have at least one option defined.`);
                     isValid = false; return;
                }
                const optionValues = new Set();
                field.options.forEach((opt, index) => {
                    if (!opt.label.trim() || !opt.value.trim()) {
                         alert(`Error: Dropdown option ${index + 1} for field "${field.label}" must have both a Label and a Value.`);
                         isValid = false;
                    }
                     if (optionValues.has(opt.value)) {
                         alert(`Error: Dropdown option values must be unique within the field "${field.label}". Duplicate value: "${opt.value}"`);
                         isValid = false;
                     }
                     optionValues.add(opt.value);
                     if (typeof opt.cost !== 'number' || isNaN(opt.cost)) {
                        alert(`Error: Dropdown option "${opt.label}" for field "${field.label}" has an invalid cost.`);
                         isValid = false;
                     }
                });
                if (!isValid) return;
            } else if (field.type === 'yesno' || field.type === 'checkbox') {
                 if (typeof field.costYes !== 'number' || isNaN(field.costYes) || typeof field.costNo !== 'number' || isNaN(field.costNo)) {
                     alert(`Error: Yes/No or Checkbox field "${field.label}" has invalid cost values.`);
                     isValid = false; return;
                 }
             } else {
                 if (typeof field.cost !== 'number' || isNaN(field.cost)) {
                     alert(`Error: Field "${field.label}" has an invalid cost value.`);
                     isValid = false; return;
                 }
             }
         });
         if (!isValid) return;


         if (!name.trim() || (parseFloat(basePrice) || 0) < 0) {
             if (!name.trim()) alert("Error: Formula Name is required.");
             if ((parseFloat(basePrice) || 0) < 0) alert("Error: Base Price cannot be negative.");
             console.error("Form validation failed.");
             return;
         }

        const finalFields = fields.map(field => {
            const finalField = {
                id: field.id,
                label: field.label,
                key: field.key,
                type: field.type,
            };
            switch (field.type) {
                case 'yesno':
                case 'checkbox':
                    finalField.costYes = Number(field.costYes) || 0;
                    finalField.costNo = Number(field.costNo) || 0;
                    break;
                case 'dropdown':
                    finalField.options = field.options.map(opt => ({
                        label: opt.label,
                        value: opt.value,
                        cost: Number(opt.cost) || 0,
                    }));
                    break;
                case 'text':
                case 'number':
                case 'textarea':
                default:
                    finalField.cost = Number(field.cost) || 0;
                    break;
            }
            return finalField;
        });

        const formulaData = {
            name,
            formType,
            access,
            basePrice: parseFloat(basePrice) || 0,
            pointsType,
            description,
            fields: finalFields,
        };

        if (formula?.id) {
            onSubmit({ ...formulaData, id: formula.id });
          } else {
            onSubmit(formulaData);
          }
    };

    return (
        <form
    onSubmit={handleSubmit}
    className="space-y-8 text-white p-6 bg-gray-800 rounded-lg shadow-xl"
>
    <h2 className="text-2xl font-bold border-b border-gray-700 pb-3 mb-6 text-accent">
        Formula Configuration
    </h2>

    {/* --- Top Level Form Inputs --- */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
                Formula Name
            </label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Vlog Basic Editing"
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
            />
        </div>

        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
                Form Type
            </label>
            <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white"
            >
                {['vlog', 'tiktok', 'thumbnail', 'recording', ...customFormTypes].map(
                    (type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    )
                )}
            </select>
            <div className="flex items-center mt-2 space-x-2">
                <input
                    type="text"
                    placeholder="Add new form type"
                    value={newFormType}
                    onChange={(e) => setNewFormType(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-sm text-white placeholder-gray-400"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (
                            newFormType &&
                            !customFormTypes.includes(newFormType) &&
                            !['vlog', 'tiktok', 'thumbnail', 'recording'].includes(
                                newFormType
                            )
                        ) {
                            setCustomFormTypes([...customFormTypes, newFormType]);
                            setFormType(newFormType);
                            setNewFormType('');
                        }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                >
                    ➕ Add
                </button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
                Access Level
            </label>
            <select
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white"
            >
                <option value="admin">Admin Only</option>
                <option value="user">Logged-in Users</option>
                <option value="public">Public</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
                Points Type
            </label>
            <select
                value={pointsType}
                onChange={(e) => setPointsType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white"
            >
                <option value="editingPoints">Editing Points</option>
                <option value="recordingPoints">Recording Points</option>
                <option value="designPoints">Design Points</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
                Base Price (Points)
            </label>
            <input
                type="number"
                min="0"
                step="any"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g., 10"
                required
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white placeholder-gray-400"
            />
        </div>
    </div>

    <div>
        <label className="block text-sm font-semibold mb-1 text-gray-300">
            Description
        </label>
        <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white placeholder-gray-400"
            rows={3}
            placeholder="Brief description..."
        />
    </div>

    {/* --- Dynamic Fields Section --- */}
    <div className="mt-10 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-200">Form Fields</h2>
            <button type="button" onClick={addField} className="btn-green text-sm font-semibold"> + Add Field </button>
        </div>

        {fields.length === 0 && <p className="text-gray-500 italic text-center py-4">No fields added yet.</p>}

        {fields.map((field) => (
            <div key={field.id} className="border border-gray-700 rounded p-5 mb-6 bg-gray-900/60 shadow-lg space-y-4 relative">
                <button type="button" onClick={() => deleteField(field.id)} className="absolute top-2 right-2 btn-delete" aria-label="Delete Field" title="Delete Field"> × </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                        <label className="label-xs">Field Label</label>
                        <input placeholder="e.g., Voice Over" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="dynamic-field-input" required />
                    </div>
                    <div>
                        <label className="label-xs">Field Key (unique)</label>
                        <input placeholder="e.g., voiceOver" value={field.key} onChange={(e) => updateField(field.id, { key: e.target.value.trim().replace(/\s+/g, '_') })} className="dynamic-field-input font-mono" required pattern="^[a-zA-Z0-9_]+$" title="Letters, numbers, underscores only" />
                    </div>
                    <div>
                        <label className="label-xs">Field Type</label>
                        <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value })} className="dynamic-field-input" >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="yesno">Yes / No</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="textarea">Text Area</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-700/50 pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-300">Pricing Rules</h4>
                    {(field.type === 'text' || field.type === 'number' || field.type === 'textarea') && (
                        <div>
                            <label className="label-xs">Cost (if field is used/filled)</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="Points"
                                value={field.cost ?? ''}
                                onChange={(e) => updateField(field.id, { cost: e.target.value })}
                                className="dynamic-field-input w-28"
                                title="Points added/subtracted if this field is used."
                            />
                        </div>
                    )}

                    {(field.type === 'yesno' || field.type === 'checkbox') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-xs">Cost if Yes / Checked</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Points"
                                    value={field.costYes ?? ''}
                                    onChange={(e) => updateField(field.id, { costYes: e.target.value })}
                                    className="dynamic-field-input"
                                />
                            </div>
                            <div>
                                <label className="label-xs">Cost if No / Unchecked</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Points"
                                    value={field.costNo ?? ''}
                                    onChange={(e) => updateField(field.id, { costNo: e.target.value })}
                                    className="dynamic-field-input"
                                />
                            </div>
                        </div>
                    )}

                    {field.type === 'dropdown' && (
                        <div className="space-y-3">
                            <label className="label-xs block mb-1">Options & Costs</label>
                            {(!field.options || field.options.length === 0) && <p className="text-xs text-gray-500 italic">No options defined yet.</p>}
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-2 border border-gray-700 p-2 rounded">
                                    <input
                                        type="text"
                                        placeholder="Option Label"
                                        value={option.label}
                                        onChange={(e) => updateDropdownOption(field.id, index, { label: e.target.value })}
                                        className="dynamic-field-input flex-1"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Option Value"
                                        value={option.value}
                                        onChange={(e) => updateDropdownOption(field.id, index, { value: e.target.value.trim() })}
                                        className="dynamic-field-input flex-1 font-mono"
                                        required
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Cost"
                                        value={option.cost ?? ''}
                                        onChange={(e) => updateDropdownOption(field.id, index, { cost: e.target.value })}
                                        className="dynamic-field-input w-20"
                                        title="Points for selecting this option"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDropdownOption(field.id, index)}
                                        className="btn-delete-xs"
                                        aria-label="Remove Option"
                                        title="Remove Option"
                                    >×</button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addDropdownOption(field.id)}
                                className="btn-accent mt-2"
                            >
                                + Add Option
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
    {/* --- End Dynamic Fields Section --- */}

    <div className="pt-8 mt-6 border-t border-gray-700 text-right">
        <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-semibold transition"
        >
            💾 Save Formula
        </button>
    </div>

    <style jsx>{`
        /* Unified style for all inputs within the dynamic "Form Fields" section */
        .dynamic-field-input {
            @apply w-full bg-gray-700 border border-gray-600 px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent text-white text-sm placeholder-gray-400;
        }
        /* Specific styling for native select elements within dynamic fields to ensure arrow visibility */
        select.dynamic-field-input {
            @apply appearance-none bg-no-repeat;
            /* Tailwind's default gray-400 for the arrow color: %239ca3af */
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-size: 1.5em 1.5em;
            padding-right: 2.5rem; /* Make space for the arrow */
        }

        /* Helper classes that are still used */
        .label-xs {
            @apply block text-xs font-medium text-gray-400 mb-1;
        }
        .btn-green {
            @apply bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-150;
        }
        .btn-delete {
            @apply text-red-500 hover:text-red-400 font-bold text-xl leading-none p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition;
        }
        .btn-delete-xs {
            @apply text-red-400 hover:text-red-600 text-lg leading-none px-1 rounded bg-gray-700 hover:bg-gray-600 transition;
        }
        .btn-accent {
            @apply text-xs bg-accent px-2 py-1 rounded text-white hover:bg-accentLighter transition;
        }
    `}</style>
</form>

    );
};

export default FormulaBuilder;