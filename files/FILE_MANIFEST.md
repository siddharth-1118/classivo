classivo/
├── .env.example
├── deploy.sh
├── Procfile
├── README.md
├── packages/
│   ├── db/
│   │   └── schema.prisma
│   └── shared/
│       └── types.ts
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── seeder.ts
│   │   │   └── routes/
│   │   │       ├── auth.ts
│   │   │       ├── students.ts
│   │   │       ├── volunteers.ts
│   │   │       ├── files.ts
│   │   │       ├── attendance.ts
│   │   │       ├── messages.ts
│   │   │       ├── notifications.ts
│   │   │       ├── admin.ts
│   ├── web/
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── attendance.tsx
│   │   │   ├── files.tsx
│   │   │   ├── messages.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── emergency.tsx
│   │   │   └── admin/
│   │   │       ├── students.tsx
│   │   │       ├── volunteers.tsx
│   │   │       ├── files.tsx
│   │   │       ├── departments.tsx
│   │   │       ├── classes.tsx
│   │   │       ├── subjects.tsx
│   │   │       ├── analytics.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── DashboardCards.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── EditModal.tsx
│   │   │   ├── VolunteerActivityModal.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── useFetch.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── styles/
│   │   │   └── globals.css