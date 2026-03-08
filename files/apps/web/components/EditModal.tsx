import { useState } from 'react';

export default function EditModal({ visible, onClose, onSave, initial }) {
  const [fields, setFields] = useState(initial);

  function handleChange(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(fields);
    onClose();
  }

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg min-w-[350px] flex flex-col gap-2">
        {Object.keys(initial).map(key => (
          <div key={key}>
            <label className="block text-sm">{key}</label>
            <input
              name={key}
              value={fields[key]}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
        ))}
        <div className="flex flex-row-reverse gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-1">Save</button>
          <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}