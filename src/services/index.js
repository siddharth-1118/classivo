import { Store } from '../store/store.js';

export const AuthService = {
  login(token, requestedRole) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const user = JSON.parse(jsonPayload);

      if (user.email) {
        let finalRole = requestedRole || 'student';
        const isAdmin = user.email.toLowerCase() === 'saisiddharthvooka@gmail.com';

        // Admin Security Check
        if (requestedRole === 'admin' && !isAdmin) {
          return { success: false, message: 'Access Denied: You are not authorized as an Administrator.' };
        }

        // Auto-assign admin status for the specific email if requested
        if (isAdmin && requestedRole === 'admin') {
          finalRole = 'admin';
        } else if (isAdmin) {
          // Admin can access any portal they select
          finalRole = requestedRole;
        }

        // Identity Lock check
        if (Store.state.profile.isLocked && Store.state.user.email && Store.state.user.email !== user.email) {
          return { 
            success: false, 
            message: 'This application is locked to another user account. Please contact the administrator for assistance.' 
          };
        }

        Store.update('user', { 
          email: user.email, 
          name: user.name,
          avatar: user.picture,
          id: user.sub 
        });
        
        if (!Store.state.profile.name || Store.state.profile.name === 'Alex Rivers') {
          const profile = { ...Store.state.profile, name: user.name, avatar: user.picture };
          Store.update('profile', profile);
        }
        
        Store.update('role', finalRole);
        return { success: true, role: finalRole };
      }
      return { success: false, message: 'Invalid Google account data.' };
    } catch (e) {
      console.error('Auth Error:', e);
      return { success: false, message: 'Authentication failed.' };
    }
  },

  logout() {
    localStorage.clear();
    location.reload();
  },

  isAuthenticated() {
    return !!Store.state.user;
  }
};

export const AcademicService = {
  init() {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  },

  sendNotification(title, message) {
    this.addNotification(title, message);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message, icon: '/vite.svg' });
    }
  },

  postHomework(subject, description) {
    const homework = [...Store.state.academicData.homework];
    homework.unshift({ id: Date.now(), subject, description, time: new Date().toLocaleTimeString(), status: 'ACTIVE' });
    Store.updateAcademic('homework', homework);
    this.sendNotification('New Homework', `${subject}: ${description}`);
  },

  addGpaRecord(val) {
    const gpaRecords = [...Store.state.academicData.gpaRecords];
    gpaRecords.push({ id: Date.now(), gpa: parseFloat(val), sem: `Sem ${gpaRecords.length + 1}` });
    Store.updateAcademic('gpaRecords', gpaRecords);
  },

  addNotification(title, message) {
    const notifications = [...Store.state.academicData.notifications];
    notifications.unshift({ id: Date.now(), title, message, time: 'Just now' });
    Store.updateAcademic('notifications', notifications.slice(0, 5));
  }
};
