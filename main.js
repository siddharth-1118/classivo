import './src/styles/professional.css';
import './src/styles/features.css';
import { Store } from './src/store/store.js';
import { AuthService, AcademicService } from './src/services/index.js';

const app = document.querySelector('#app');

const UI = {
  Icon: (name) => {
    const icons = {
      dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
      timetable: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      assignments: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      resources: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
      analytics: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
      profile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      studio: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.5 1.5"></path><path d="M7.6 7.6L2 2"></path></svg>',
      console: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
    };
    return icons[name] || '';
  },

  Sidebar: (state) => {
    const tabsByRole = {
      student: ['dashboard', 'timetable', 'assignments', 'resources', 'analytics', 'profile'],
      volunteer: ['studio', 'broadcasts', 'resources', 'performance', 'profile'],
      admin: ['console', 'studio', 'users', 'calendar', 'settings', 'profile']
    };
    const currentTabs = tabsByRole[state.role] || tabsByRole.student;

    return `
      <div class="sidebar">
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0 1rem 3rem;">
          <div style="width: 32px; height: 32px; background: var(--p-accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">🎓</div>
          <span style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.04em; color: white;">CLASSIVO</span>
        </div>
        
        <div style="flex: 1;">
          ${currentTabs.map(tab => `
            <div class="p-nav-item ${state.activeTab === tab ? 'active' : ''}" data-tab="${tab}">
              ${UI.Icon(tab in UI.Icon ? tab : 'dashboard')} ${tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          `).join('')}
        </div>

        <div class="p-glass" style="padding: 0.75rem 1rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; margin-top: auto;">
          <img src="${state.profile.avatar}" style="width: 36px; height: 36px; border-radius: 8px; background: white;">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white;">
              ${state.profile.name}${state.profile.studentName ? ` (${state.profile.studentName})` : ''}
            </div>
            <div style="font-size: 0.65rem; color: rgba(255, 255, 255, 0.6); font-weight: 800;">ID: ${state.profile.studentId || 'N/A'}</div>
          </div>
          <button id="logout-btn" style="background: none; border: none; color: var(--p-text-muted); padding: 5px; cursor: pointer;">⚙️</button>
        </div>
      </div>
    `;
  },

  Header: (state, title, subtitle) => `
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
      <div>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: white;">${title}</h1>
        <p style="color: var(--p-text-muted); margin-top: 0.35rem; font-size: 1.05rem;">${subtitle}</p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div style="width: 44px; height: 44px; background: var(--p-surface); border: 1px solid var(--p-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
          🔔
          <span style="position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: var(--p-error); border-radius: 50%; border: 2px solid var(--p-surface);"></span>
        </div>
        <button class="p-btn p-btn-primary" style="display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem 1.5rem;">
          <span style="font-size: 1.2rem; font-weight: 400;">+</span> Quick Action
        </button>
      </div>
    </header>
  `,

  Badge: (status) => {
    const cls = status.toLowerCase().replace(' ', '-');
    return `<span class="badge badge-${cls}">${status}</span>`;
  },

  RadarChart: (data, size = 300) => {
    const points = data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / data.length;
      const r = (d.value / 100) * (size / 2 - 40);
      return {
        x: size / 2 + r * Math.sin(angle),
        y: size / 2 - r * Math.cos(angle)
      };
    });

    const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
    
    return `
      <svg width="${size}" height="${size}" style="overflow: visible;">
        ${[20, 40, 60, 80, 100].map(r => `
          <circle cx="${size/2}" cy="${size/2}" r="${(r/100)*(size/2-40)}" fill="none" stroke="var(--p-border)" stroke-dasharray="4 4" />
        `).join('')}
        ${data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length;
          const x = size / 2 + (size / 2 - 20) * Math.sin(angle);
          const y = size / 2 - (size / 2 - 20) * Math.cos(angle);
          return `<text x="${x}" y="${y}" fill="var(--p-text-muted)" font-size="10" text-anchor="middle" alignment-baseline="middle">${d.subject}</text>`;
        }).join('')}
        <polygon points="${polygon}" fill="rgba(99, 102, 241, 0.2)" stroke="var(--p-accent)" stroke-width="2" />
        ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--p-accent)" />`).join('')}
      </svg>
    `;
  }
};

const Views = {
  Login: () => `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top right, #3B82F630, transparent);">
      <div class="p-card" style="width: 100%; max-width: 440px; padding: 3.5rem 3rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 2rem;">🎓</div>
        <h1 style="font-size: 2.5rem; margin-bottom: 0.75rem; font-weight: 900; color: white;">Classivo</h1>
        <p style="color: var(--p-text-muted); margin-bottom: 3rem; font-size: 1.1rem;">Empowering Campus Collaboration</p>
        
        <div class="p-grid" style="gap: 1.5rem; text-align: left;">
          <div>
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--p-text-muted); margin-bottom: 0.5rem; display: block;">SELECT PORTAL</label>
            <select class="p-card" id="auth-role" style="width: 100%; background: #00000040; margin-bottom: 1.5rem;">
              <option value="student">Student Hub</option>
              <option value="volunteer">Volunteer Studio</option>
              <option value="admin">Admin Console</option>
            </select>
          </div>
          <div style="text-align: center; margin-bottom: 1rem;">
            <p style="font-size: 0.9rem; color: var(--p-text-muted); margin-bottom: 1.5rem;">Please sign in with your official account.</p>
            <div id="google-login-btn" style="display: flex; justify-content: center;"></div>
          </div>
          
          <div class="login-footer" style="text-align: center;">
            <p>Admin access restricted to authorized accounts.</p>
          </div>
        </div>
      </div>
    </div>
  `,

  Dashboard: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, `Welcome back, ${(state.profile.name || 'Student').split(' ')[0]}!`, `You have ${state.academicData.homework.length} deadlines approaching this week.`)}
        
        <!-- Alerts -->
        ${state.academicData.notifications.length > 0 ? `
        <div id="test-alert" class="p-card" style="border: 1px solid #7C3AED80; background: linear-gradient(90deg, #7C3AED10, transparent); margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;">
          <div style="display: flex; gap: 1.25rem; align-items: center;">
             <div style="background: #7C3AED; color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em;">${state.academicData.notifications[0].type || 'UPDATE'}</div>
             <p style="font-size: 0.95rem; font-weight: 500; color: white;">${state.academicData.notifications[0].title}: <span style="font-weight: 400; color: var(--p-text-muted);">${state.academicData.notifications[0].message}</span></p>
          </div>
          <span style="color: var(--p-text-muted); font-size: 0.85rem; cursor: pointer;" id="dismiss-alert">Dismiss</span>
        </div>
        ` : ''}

        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr 2fr; gap: 1.5rem; margin-bottom: 2.5rem;">
           <!-- CGPA -->
           <div class="p-card" style="display: flex; flex-direction: column; gap: 1.5rem; height: 100%;">
              <span style="color: var(--p-text-muted); font-size: 0.9rem; font-weight: 600;">Current CGPA</span>
              <div style="flex: 1; display: flex; align-items: flex-end; gap: 0.5rem;">
                <span style="font-size: 3.5rem; font-weight: 800; line-height: 1; color: white;">
                  ${state.academicData.gpaRecords.length > 0 ? state.academicData.gpaRecords[state.academicData.gpaRecords.length - 1].gpa.toFixed(2) : '0.00'}
                </span>
                <span style="color: var(--p-text-muted); font-size: 1.25rem; margin-bottom: 0.5rem;">/4.0</span>
              </div>
              <div style="color: var(--p-success); font-size: 0.85rem; font-weight: 700;">↗ Tracked</div>
           </div>
           <!-- Attendance -->
           <div class="p-card" style="display: flex; flex-direction: column; gap: 1.5rem; height: 100%;">
              <span style="color: var(--p-text-muted); font-size: 0.9rem; font-weight: 600;">Attendance</span>
              <div style="flex: 1; display: flex; align-items: flex-end; gap: 0.5rem;">
                <span style="font-size: 3.5rem; font-weight: 800; line-height: 1; color: var(--p-success);">${state.academicData.attendance}%</span>
              </div>
              <div style="color: var(--p-success); font-size: 0.85rem; font-weight: 700;">↗ Verified</div>
           </div>
           <!-- Activity Heatmap -->
           <div class="p-card" style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
              <span style="color: var(--p-text-muted); font-size: 0.9rem; font-weight: 600;">Engagement Heatmap</span>
              <div style="display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; flex: 1; align-content: center;">
                ${Array(56).fill(0).map(() => {
                  const level = Math.floor(Math.random() * 4);
                  const colors = ['rgba(255,255,255,0.05)', 'rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.5)', 'var(--p-accent)'];
                  return `<div style="aspect-ratio: 1; background: ${colors[level]}; border-radius: 2px;"></div>`;
                }).join('')}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--p-text-muted); font-weight: 700;">
                <span>Low</span>
                <span>Peak</span>
              </div>
           </div>
           <!-- Homework -->
           <div class="p-card" style="height: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: white;">Homework & Deadlines</h3>
                <a href="#" style="color: var(--p-accent); font-size: 0.8rem; text-decoration: none; font-weight: 700;">View All</a>
              </div>
              <div class="p-grid" style="gap: 1rem;">
                ${state.academicData.homework.length > 0 ? state.academicData.homework.map(h => `
                  <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #ffffff03; border: 1px solid #ffffff05; border-radius: 12px;">
                    <div style="width: 40px; height: 40px; background: ${h.status === 'LOCKED' ? '#3b82f615' : '#7c3aed15'}; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">${h.status === 'LOCKED' ? '📋' : '🎨'}</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 700; font-size: 0.95rem; color: white;">${h.title}</div>
                      <div style="font-size: 0.75rem; color: var(--p-text-muted); margin-top: 0.2rem;">${h.subject} • ${h.deadline}</div>
                    </div>
                    ${UI.Badge(h.status)}
                  </div>
                `).join('') : '<p style="color: var(--p-text-muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No pending homework.</p>'}
              </div>
           </div>
        </div>

        <div class="p-card" style="padding: 0; overflow: hidden;">
          <div style="padding: 1.75rem 2rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 800; color: white;">Today's Schedule</h2>
            <div style="background: var(--p-sidebar); border: 1px solid var(--p-border); padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600; color: var(--p-text-muted); display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--p-success);">🔄</span> Synced with Google Calendar
            </div>
          </div>
          <table class="p-table" style="margin: 0; border: none;">
            <thead>
              <tr style="background: transparent;">
                <th style="padding-left: 2rem;">Time</th>
                <th>Course & Module</th>
                <th>Location</th>
                <th>Lecturer</th>
                <th style="padding-right: 2rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.academicData.schedule.length > 0 ? state.academicData.schedule.map(s => `
                <tr>
                  <td style="padding-left: 2rem; font-weight: 800; font-size: 1rem; color: ${s.status === 'ON-GOING' ? 'var(--p-ongoing)' : 'white'};">${s.time}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <div style="width: 32px; height: 32px; background: var(--p-accent-soft); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem;">${s.course.includes('Data') ? '⌨️' : s.course.includes('Web') ? '🌐' : '🤝'}</div>
                      <span style="font-weight: 700; font-size: 0.95rem; color: white;">${s.course}</span>
                    </div>
                  </td>
                  <td><span style="background: #1e293b; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: white;">${s.location}</span></td>
                  <td style="font-size: 0.95rem; color: var(--p-text-muted);">${s.lecturer}</td>
                  <td style="padding-right: 2rem;">${UI.Badge(s.status)}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--p-text-muted);">No classes scheduled for today.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,

  Timetable: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'University Timetable', 'Your weekly academic schedule synced with campus events.')}
        <div class="p-card" style="padding: 0; overflow: hidden;">
          <div style="padding: 1.5rem 2rem; border-bottom: 1px solid var(--p-border); display: flex; justify-content: space-between; align-items: center;">
             <div style="display: flex; gap: 1rem;">
                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => `
                  <button class="p-btn ${day === 'Mon' ? 'p-btn-primary' : 'p-btn-secondary'}" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">${day}</button>
                `).join('')}
             </div>
             <span style="font-size: 0.85rem; color: var(--p-text-muted);">Current Week: 04 March - 08 March</span>
          </div>
          <table class="p-table" style="margin: 0;">
            <thead>
              <tr>
                <th style="padding-left: 2rem;">Time</th>
                <th>Subject</th>
                <th>Room</th>
                <th>Type</th>
                <th style="padding-right: 2rem;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.academicData.schedule.length > 0 ? state.academicData.schedule.map(s => `
                <tr>
                  <td style="padding-left: 2rem; font-weight: 700; color: white;">${s.time}</td>
                  <td style="font-weight: 600; color: white;">${s.course}</td>
                  <td><span class="badge" style="background: var(--p-sidebar);">${s.location}</span></td>
                  <td><span class="badge badge-ongoing">Lecture</span></td>
                  <td style="padding-right: 2rem;"><button class="p-btn p-btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border: 1px solid var(--p-border);">Join Sync</button></td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--p-text-muted);">No classes found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,

  Assignments: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Assignments & Tasks', 'Track your upcoming deadlines and project submissions.')}
        <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
          <div class="p-grid" style="gap: 1.5rem;">
            ${state.academicData.homework.length > 0 ? state.academicData.homework.map(h => `
              <div class="p-card" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                  <div style="width: 48px; height: 48px; background: var(--p-accent-soft); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📄</div>
                  <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem; color: white;">${h.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--p-text-muted);">${h.subject} • Priority: <span style="color: var(--p-error);">High</span></p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; color: var(--p-error); margin-bottom: 0.5rem; font-size: 0.85rem;">${h.deadline}</div>
                  <button class="p-btn p-btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Submit Now</button>
                </div>
              </div>
            `).join('') : '<div class="p-card" style="text-align: center; padding: 3rem; color: var(--p-text-muted);">No assignments found.</div>'}
          </div>
          <div class="p-card">
            <h3 style="color: white;">Resources Hub</h3>
            <p style="font-size: 0.8rem; color: var(--p-text-muted); margin-top: 0.5rem; margin-bottom: 1.5rem;">Quick access to study materials and notes.</p>
            <div class="p-grid" style="gap: 1rem;">
              ${['Lecture Notes', 'Reference Books', 'PyQ Papers'].map(type => `
                <div style="padding: 1rem; background: var(--p-sidebar); border-radius: 12px; border: 1px solid var(--p-border); display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                  <div style="font-size: 1.2rem;">📂</div>
                  <span style="font-weight: 600; font-size: 0.9rem; color: white;">${type}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  Analytics: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Performance Analytics', 'Track your academic journey and plan your next milestones.')}
        
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">Current CGPA</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: white;">
              ${state.academicData.gpaRecords.length > 0 ? state.academicData.gpaRecords[state.academicData.gpaRecords.length - 1].gpa.toFixed(2) : '0.00'}
            </div>
          </div>
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">Attendance</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: var(--p-success);">${state.academicData.attendance}%</div>
          </div>
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">Credits Earned</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: white;">0</div>
            <div style="font-size: 0.7rem; color: var(--p-text-muted); margin-top: 0.25rem;">0% of degree completed</div>
          </div>
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">Study Hours</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: white;">0h</div>
            <div style="font-size: 0.7rem; color: var(--p-warning);">🎯 Goal: 40h</div>
          </div>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: 3fr 2fr; gap: 1.5rem;">
          <div class="p-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <h2 style="color: white; font-size: 1.25rem;">GPA Trend over Semesters</h2>
              <span class="badge" style="background: var(--p-sidebar);">Academic Year 2023-24</span>
            </div>
            <div style="height: 240px; display: flex; align-items: flex-end; gap: 2rem; padding: 1rem 0; border-bottom: 1px solid var(--p-border);">
              ${state.academicData.gpaRecords.length > 0 ? state.academicData.gpaRecords.map((r, i) => `
                <div style="flex: 1; position: relative; height: 100%; display: flex; align-items: flex-end;">
                  <div style="width: 100%; background: linear-gradient(to top, var(--p-accent), var(--p-ongoing)); height: ${r.gpa * 20}%; border-radius: 8px 8px 0 0; transition: height 1s;">
                    <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-weight: 800; color: white; font-size: 0.8rem;">${r.gpa}</div>
                  </div>
                  <div style="position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: var(--p-text-muted); white-space: nowrap;">${r.sem}</div>
                </div>
              `).join('') : '<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--p-text-muted); font-size: 0.85rem;">No data recorded yet.</div>'}
            </div>
          </div>
          <div class="p-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h2 style="color: white; font-size: 1.25rem; align-self: flex-start; margin-bottom: 2rem;">Subject-wise Competency</h2>
            ${UI.RadarChart(state.academicData.competency, 240)}
          </div>
        </div>
      </div>
    </div>
  `,

  Profile: (state) => {
    const isLocked = state.profile.isLocked;
    
    return `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Profile & Settings', 'Manage your account and preferences.')}
        
        <div class="p-card" style="display: flex; gap: 2rem; align-items: center; margin-bottom: 2.5rem;">
          <div style="width: 140px; height: 140px; background: white; border-radius: 50%; padding: 4px; border: 4px solid var(--p-accent-soft);">
            <img src="${state.profile.avatar}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%;">
          </div>
          <div style="flex: 1;">
            <h1 style="font-size: 2.5rem; color: white;">${state.profile.name} ${state.profile.studentName ? `(${state.profile.studentName})` : ''}</h1>
            <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem;">
              <span class="badge" style="background: #10B98120; color: var(--p-success); font-weight: 800;">ACTIVE STUDENT</span>
              <span class="badge" style="background: #2563EB20; color: var(--p-accent); font-weight: 800;">${state.profile.year}</span>
              ${isLocked ? '<span class="badge" style="background: var(--p-error); color: white; font-weight: 800;">🔒 LOCKED</span>' : ''}
            </div>
            <p style="font-size: 0.95rem; color: var(--p-text-muted); margin-top: 1rem; font-weight: 600;">Student ID: <span style="color: white;">${state.profile.studentId || 'Not set'}</span></p>
            <p style="font-size: 0.95rem; color: var(--p-text-muted); margin-top: 0.35rem; font-weight: 600;">Department: <span style="color: white;">${state.profile.department || 'Not set'}</span></p>
          </div>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
          <div class="p-card">
            <h3 style="color: white; margin-bottom: 1.5rem;">${isLocked ? 'Student Details (Locked)' : 'Enter Student Details'}</h3>
            <div class="p-grid" style="gap: 1.5rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Full Name (Official)</label>
                  <input type="text" id="prof-student-name" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.studentName}" ${isLocked ? 'disabled' : ''} placeholder="e.g. John Doe">
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Student ID</label>
                  <input type="text" id="prof-student-id" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.studentId}" ${isLocked ? 'disabled' : ''} placeholder="e.g. STU-2024-001">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Department</label>
                  <input type="text" id="prof-dept" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.department}" ${isLocked ? 'disabled' : ''} placeholder="e.g. Computer Science">
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Section / Batch</label>
                  <input type="text" id="prof-section" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.section}" ${isLocked ? 'disabled' : ''} placeholder="e.g. Batch 2024 - B">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Phone Number</label>
                  <input type="text" id="prof-phone" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.phone || ''}" ${isLocked ? 'disabled' : ''}>
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Academic Year</label>
                  <select id="prof-year" class="p-card" style="width: 100%; background: #00000040;" ${isLocked ? 'disabled' : ''}>
                    <option ${state.profile.year === 'Freshman' ? 'selected' : ''}>Freshman</option>
                    <option ${state.profile.year === 'Sophomore' ? 'selected' : ''}>Sophomore</option>
                    <option ${state.profile.year === 'Junior' ? 'selected' : ''}>Junior</option>
                    <option ${state.profile.year === 'CS Senior' ? 'selected' : ''}>CS Senior</option>
                  </select>
                </div>
              </div>
              ${!isLocked ? `
                <div style="text-align: right; margin-top: 1rem;">
                  <button id="save-profile-btn" class="p-btn p-btn-primary">Save and Lock Profile</button>
                  <p style="font-size: 0.75rem; color: var(--p-error); margin-top: 0.5rem;">⚠️ Details will be locked after saving.</p>
                </div>
              ` : `
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                  <p style="font-size: 0.85rem; color: var(--p-ongoing); font-weight: 600;">Found a mistake? Submit a correction request to the admin for unlocking.</p>
                  <button id="request-correction-btn" class="p-btn p-btn-secondary" style="margin-top: 1rem; width: 100%;">🚀 Request Unlock / Correction</button>
                </div>
              `}
            </div>
          </div>
          
          <div class="p-card">
            <h3 style="color: white; margin-bottom: 1.5rem;">System Overrides</h3>
            <p style="font-size: 0.8rem; color: var(--p-text-muted); line-height: 1.6;">Contact support if you encounter persistent issues with your student credentials.</p>
            <div style="margin-top: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 0.85rem;">2FA Session</span>
                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--p-success);">Verified</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 0.85rem;">OAuth Token</span>
                <span style="font-size: 0.75rem; color: var(--p-text-muted);">Expires in 12h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  },

  CorrectionRequest: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Request Admin Authorization', 'Submit a formal query for system overrides.')}
        
        <div class="dashboard-grid" style="grid-template-columns: 1fr 2fr; gap: 2rem;">
           <div class="p-card">
              <h3 style="color: white; margin-bottom: 1.5rem;">Status of Previous Queries</h3>
              <div class="p-grid" style="gap: 1rem;">
                <div style="padding: 1rem; background: var(--p-sidebar); border-radius: 12px; border-left: 4px solid var(--p-warning);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--p-warning);">PENDING</span>
                    <span style="font-size: 0.65rem; color: var(--p-text-muted);">2h ago</span>
                  </div>
                  <div style="margin-top: 0.5rem; font-weight: 700; font-size: 0.85rem; color: white;">Profile Unlock Request</div>
                  <div style="font-size: 0.7rem; color: var(--p-text-muted); margin-top: 0.2rem;">Ref ID: #AQ-9082</div>
                </div>
              </div>
              <button class="p-btn p-btn-secondary" style="width: 100%; margin-top: 1.5rem; font-size: 0.8rem;">View Full History</button>
           </div>

           <div class="p-card">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Subject of Query</label>
                  <select class="p-card" style="width: 100%; background: #00000040;">
                    <option>Profile Data Correction</option>
                    <option>Section Transfer</option>
                    <option>System Override</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Student ID / Name</label>
                  <input type="text" class="p-card" style="width: 100%; background: #00000040;" value="${state.profile.studentId}" readonly>
                </div>
              </div>
              
              <div>
                <label style="font-size: 0.8rem; color: var(--p-text-muted); display: block; margin-bottom: 0.5rem;">Detailed Justification</label>
                <textarea class="p-card" style="width: 100%; height: 150px; background: #00000040; color: white; margin-bottom: 1rem;" placeholder="Explain the reason for this administrative request in detail..."></textarea>
              </div>

              <div style="border: 2px dashed var(--p-border); border-radius: 12px; padding: 2.5rem; text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📄</div>
                <p style="font-weight: 700; color: white;">Click to upload or drag and drop</p>
                <p style="font-size: 0.75rem; color: var(--p-text-muted); margin-top: 0.4rem;">PDF, PNG, JPG (Max 5MB)</p>
              </div>

              <button class="p-btn p-btn-primary" style="width: 100%; height: 54px; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 1rem;" id="submit-query-btn">
                <span>✈️</span> Send to Admin
              </button>
              <p style="font-size: 0.7rem; color: var(--p-text-muted); text-align: center; margin-top: 1rem;">By clicking send, you acknowledge that all information provided is accurate and verifiable.</p>
           </div>
        </div>
      </div>
    </div>
  `,

  Volunteer: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Volunteer Studio', 'Manage class broadcasts and academic resources.')}
        <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
           <div class="p-card">
              <h3 style="color: white; margin-bottom: 1.5rem;">Quick Broadcast</h3>
              <textarea class="p-card" style="width: 100%; height: 120px; background: rgba(0,0,0,0.2); margin-bottom: 1rem; color: white;" placeholder="Type your class-wide notification here..."></textarea>
              <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                 <button class="p-btn p-btn-secondary">Add Attachment</button>
                 <button class="p-btn p-btn-primary">Send to Class</button>
              </div>
           </div>
           <div class="p-card">
              <h3 style="color: white; margin-bottom: 1.5rem;">Class Health</h3>
              <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; font-weight: 800; color: var(--p-success);">88%</div>
                <div style="color: var(--p-text-muted); font-size: 0.85rem;">Avg. Attendance</div>
              </div>
              <div style="color: var(--p-success); font-size: 0.8rem; text-align: center; font-weight: 600;">Stable across all sections</div>
           </div>
        </div>
      </div>
    </div>
  `,

  Admin: (state) => `
    <div class="main-layout">
      ${UI.Sidebar(state)}
      <div class="content-area">
        ${UI.Header(state, 'Admin Console', 'High-level system management and user oversight.')}
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">University Users</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: white;">12,402</div>
          </div>
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">Active Volunteers</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: var(--p-accent);">340</div>
          </div>
          <div class="p-card">
            <div style="font-size: 0.8rem; color: var(--p-text-muted); font-weight: 600;">System Uptime</div>
            <div style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: var(--p-success);">99.9%</div>
          </div>
        </div>
        <div class="p-card" style="border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05);">
          <h3 style="color: #ef4444; margin-bottom: 1rem;">Danger Zone</h3>
          <p style="color: var(--p-text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">Resetting system data will clear all academic records, attendance logs, and volunteer broadcasts for all users.</p>
          <button class="p-btn" style="background: #ef4444; color: white;" id="purge-all-btn">Factory Reset System Data</button>
        </div>
      </div>
    </div>
  `
};

function render() {
  if (!AuthService.isAuthenticated()) {
    app.innerHTML = Views.Login();
    // Use setTimeout to ensure the DOM element exists before GSI tries to render
    setTimeout(() => setupAuthHandlers(), 0);
    return;
  }

  const state = Store.state;
  const tab = state.activeTab;
  
  // High-level role routing
  if (state.role === 'admin' && tab === 'console') {
    app.innerHTML = Views.Admin(state);
  } else if (state.role === 'volunteer' && tab === 'studio') {
    app.innerHTML = Views.Volunteer(state);
  } else {
    // Default to student views for student role or generic profile
    if (tab === 'dashboard') app.innerHTML = Views.Dashboard(state);
    else if (tab === 'timetable') app.innerHTML = Views.Timetable(state);
    else if (tab === 'assignments' || tab === 'resources') app.innerHTML = Views.Assignments(state);
    else if (tab === 'analytics') app.innerHTML = Views.Analytics(state);
    else if (tab === 'profile') app.innerHTML = Views.Profile(state);
    else if (tab === 'correction') app.innerHTML = Views.CorrectionRequest(state);
    else if (tab === 'studio') app.innerHTML = Views.Volunteer(state);
    else if (tab === 'console') app.innerHTML = Views.Admin(state);
    else app.innerHTML = Views.Dashboard(state);
  }

  setupPortalHandlers();
}

function setupAuthHandlers() {
  const googleBtn = document.querySelector('#google-login-btn');
  if (!googleBtn) return;

  if (window.google) {
    google.accounts.id.initialize({
      client_id: '261438512391-nohfkshpfahg7erl67v9v3fhldm699s2.apps.googleusercontent.com',
      callback: (response) => {
        const requestedRole = document.querySelector('#auth-role')?.value || 'student';
        const result = AuthService.login(response.credential, requestedRole);
        if (result.success) {
          const targetTab = result.role === 'admin' ? 'console' : result.role === 'volunteer' ? 'studio' : 'dashboard';
          Store.update('activeTab', targetTab);
          render();
        } else {
          alert(result.message);
        }
      }
    });
    google.accounts.id.renderButton(googleBtn, { 
      theme: 'outline', 
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280
    });
  } else {
    // Retry if script not loaded yet
    setTimeout(setupAuthHandlers, 100);
  }
}

function setupPortalHandlers() {
  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    AuthService.logout();
    render();
  });

  document.querySelectorAll('.p-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      Store.update('activeTab', tab);
      render();
    });
  });

  document.querySelector('#purge-all-btn')?.addEventListener('click', () => {
    if (confirm("CRITICAL: This will wipe ALL system data. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  });

  setupProfileHandlers();
  setupCorrectionHandlers();

  // Notification Bell Handler
  document.querySelector('header .p-card:has(span)')?.addEventListener('click', () => {
    AcademicService.sendNotification("Smart Campus Reminder", "Welcome to Classivo! Your schedule is synced.");
  });
}

function setupProfileHandlers() {
  document.querySelector('#save-profile-btn')?.addEventListener('click', () => {
    const profile = {
      ...Store.state.profile,
      studentName: document.querySelector('#prof-student-name').value,
      studentId: document.querySelector('#prof-student-id').value,
      department: document.querySelector('#prof-dept').value,
      section: document.querySelector('#prof-section').value,
      phone: document.querySelector('#prof-phone').value,
      year: document.querySelector('#prof-year').value,
      isLocked: true
    };

    if (!profile.studentName || !profile.studentId) {
      alert("Please enter at least your Name and Student ID.");
      return;
    }

    Store.update('profile', profile);
    alert("Profile locked successfully!");
    render();
  });

  document.querySelector('#request-correction-btn')?.addEventListener('click', () => {
    Store.update('activeTab', 'correction');
    render();
  });
}

function setupCorrectionHandlers() {
  document.querySelector('#submit-query-btn')?.addEventListener('click', () => {
    alert("Correction request submitted successfully! Admin will review it within 24-48 hours.");
    Store.update('activeTab', 'profile');
    render();
  });
}

AcademicService.init();
render();
