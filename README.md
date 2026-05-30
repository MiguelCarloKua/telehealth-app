# LinKod — Telehealth Platform

A modern telehealth platform connecting patients with doctors for remote healthcare.

## Features

- **Authentication** — Secure registration and login with role-based access (patient / doctor)
- **Appointment Booking** — Patients can search, book, and manage appointments with available doctors
- **Video Consultations** — Live video conferencing for real-time doctor-patient consultations
- **Messaging** — In-appointment chat between doctors and patients
- **Medical Records** — Secure storage and access to patient health history
- **Clinical Notes** — Doctors can document notes per appointment
- **Prescriptions** — Doctors can issue and manage prescriptions
- **Doctor Directory** — Searchable and filterable list of available doctors
- **Ratings & Reviews** — Patients can rate and review doctors after consultations
- **AI Health Assistant** — AI-powered health recommendations for patients
- **Notifications** — Real-time alerts for appointments and messages

## Tech Stack

- **Frontend**: Next.js, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Express
- **Database**: MongoDB / Mongoose
- **Auth**: bcrypt
- **Theming**: Dark mode support via next-themes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- For testing of doctor view, you may use george@doctor.com or lucy@doctor.com with admin as password.
- As for patient view, you may use tom@patient.com or keanu@patient.com with admin as password.

### Reviewer Accounts

All reviewer accounts use **admin** as the password.

| Reviewer | Patient login | Doctor login |
|---|---|---|
| Anne Liangco | anne.liangco@whitecloak.com | dr.anne.liangco@whitecloak.com |
| Donn Gamboa | donn.gamboa@whitecloak.com | dr.donn.gamboa@whitecloak.com |
| Miguel Fermin | miguel.fermin@whitecloak.com | dr.miguel.fermin@whitecloak.com |
| Thea Juego | thea.juego@whitecloak.com | dr.thea.juego@whitecloak.com |
| Cherubim Citco | cherubim.citco@whitecloak.com | dr.cherubim.citco@whitecloak.com |
