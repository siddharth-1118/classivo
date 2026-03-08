'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSuccess: (updatedProfile: any) => void;
}

export default function EditProfileModal({ profile, onClose, onSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    rollNumber: profile.profile?.rollNumber || '',
    departmentId: profile.profile?.departmentId || '',
    classId: profile.profile?.classId || '',
    semester: profile.profile?.semester || '',
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, classesRes] = await Promise.all([
          api.get('/departments'),
          api.get('/classes')
        ]);
        setDepartments(deptsRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        toast.error('Failed to load departments/classes');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/students/me', formData);
      toast.success('Profile updated successfully!');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => c.departmentId === formData.departmentId);

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="btn-ghost p-1 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                className="input" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>
            
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input 
                  className="input" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Roll Number</label>
                <input 
                  className="input" 
                  value={formData.rollNumber} 
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Department</label>
              <select 
                className="select" 
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: e.target.value, classId: '' })}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Class</label>
                <select 
                  className="select" 
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  required
                  disabled={!formData.departmentId}
                >
                  <option value="">Select Class</option>
                  {filteredClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Semester</label>
                <select 
                  className="select" 
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <p className="text-xs text-amber-500 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
              Note: This is a one-time edit permission. After saving, you will need admin approval for further changes.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || fetchingData}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
