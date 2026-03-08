const defaultProfile = {
  name: '',
  studentName: '',
  studentId: '',
  department: '',
  section: '',
  isLocked: false,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new_student',
  status: 'NEW STUDENT',
  year: 'Freshman',
  phone: '',
  address: '',
  correctionRequested: false
};

const defaultAcademicData = {
  homework: [],
  schedule: [],
  competency: [
    { subject: 'Mathematics', value: 0 },
    { subject: 'Data Structures', value: 0 },
    { subject: 'Operating Systems', value: 0 },
    { subject: 'Database Management', value: 0 },
    { subject: 'Artificial Intelligence', value: 0 }
  ],
  gpaRecords: [],
  attendance: 0,
  notifications: [],
  calendarEvents: [],
  syncActivity: []
};

const storedProfile = JSON.parse(localStorage.getItem('srm_profile')) || {};
const storedAcademic = JSON.parse(localStorage.getItem('srm_academic')) || {};

export const Store = {
  state: {
    user: JSON.parse(localStorage.getItem('srm_user')) || null,
    role: localStorage.getItem('srm_role') || null,
    activeTab: localStorage.getItem('srm_active_tab') || 'dashboard',
    profile: { ...defaultProfile, ...storedProfile },
    academicData: { ...defaultAcademicData, ...storedAcademic }
  },

  update(key, value) {
    this.state[key] = value;
    if (key === 'activeTab') localStorage.setItem('srm_active_tab', value);
    this.save();
    this.notify();
  },

  updateAcademic(key, value) {
    this.state.academicData[key] = value;
    this.save();
    this.notify();
  },

  save() {
    localStorage.setItem('srm_user', JSON.stringify(this.state.user));
    localStorage.setItem('srm_role', this.state.role);
    localStorage.setItem('srm_profile', JSON.stringify(this.state.profile));
    localStorage.setItem('srm_academic', JSON.stringify(this.state.academicData));
  },

  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
  },
  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }
};
