import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';
import { Appointment } from '@/lib/models/Appointment';
import { ClinicalNote } from '@/lib/models/ClinicalNote';
import { Prescription } from '@/lib/models/Prescription';
import { ConsultationMessage } from '@/lib/models/ConsultationMessage';
import { Notification } from '@/lib/models/Notification';

// randomuser.me provides stable, professional portrait photos
const MALE = (n: number) => `https://randomuser.me/api/portraits/men/${n}.jpg`;
const FEMALE = (n: number) => `https://randomuser.me/api/portraits/women/${n}.jpg`;

export async function GET() {
  try {
    await connectDB();

    // Clear ALL existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await ClinicalNote.deleteMany({});
    await Prescription.deleteMany({});
    await ConsultationMessage.deleteMany({});
    await Notification.deleteMany({});

    const pw = await bcrypt.hash('admin', 10);

    // ── DOCTORS ────────────────────────────────────────────────────────────────
    const doctorsData = [
      {
        firstname: 'George', lastname: 'Clooney', email: 'george@doctor.com',
        phoneNumber: '+639171000001', role: 'doctor', password: pw,
        profileImage: MALE(32),
        licenseNumber: 'MD-01', specialty: 'Cardiology', experience: 25,
        bio: 'Veteran cardiologist with 25 years in interventional cardiology and heart failure management.',
        expertiseTags: ['heart', 'cardiovascular', 'hypertension', 'chest pain', 'arrhythmia'],
        location: { barangay: 'Pio del Pilar', city: 'Makati', coordinates: { lat: 14.5547, lng: 121.0244 } },
        availableSlots: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '13:00' },
        ],
        blockedDates: [],
      },
      {
        firstname: 'Halle', lastname: 'Berry', email: 'halle@doctor.com',
        phoneNumber: '+639171000002', role: 'doctor', password: pw,
        profileImage: FEMALE(44),
        licenseNumber: 'MD-02', specialty: 'Dermatology', experience: 18,
        bio: 'Board-certified dermatologist specialising in cosmetic and medical skin conditions.',
        expertiseTags: ['skin', 'acne', 'eczema', 'rash', 'psoriasis', 'allergy'],
        location: { barangay: 'Diliman', city: 'Quezon City', coordinates: { lat: 14.6537, lng: 121.0689 } },
        availableSlots: [{ dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '16:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Denzel', lastname: 'Washington', email: 'denzel@doctor.com',
        phoneNumber: '+639171000003', role: 'doctor', password: pw,
        profileImage: MALE(33),
        licenseNumber: 'MD-03', specialty: 'Neurology', experience: 30,
        bio: 'Neurologist with expertise in migraines, epilepsy, and stroke rehabilitation.',
        expertiseTags: ['headache', 'migraine', 'seizure', 'stroke', 'nervous system', 'dizziness'],
        location: { barangay: 'Ermita', city: 'Manila', coordinates: { lat: 14.5794, lng: 120.9842 } },
        availableSlots: [{ dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '14:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Lucy', lastname: 'Liu', email: 'lucy@doctor.com',
        phoneNumber: '+639171000004', role: 'doctor', password: pw,
        profileImage: FEMALE(45),
        licenseNumber: 'MD-04', specialty: 'Pediatrics', experience: 15,
        bio: 'Dedicated pediatrician focused on child development, vaccinations, and adolescent care.',
        expertiseTags: ['children', 'pediatric', 'fever', 'growth', 'vaccination', 'cold'],
        location: { barangay: 'Ortigas Center', city: 'Pasig', coordinates: { lat: 14.5860, lng: 121.0614 } },
        availableSlots: [{ dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Idris', lastname: 'Elba', email: 'idris@doctor.com',
        phoneNumber: '+639171000005', role: 'doctor', password: pw,
        profileImage: MALE(34),
        licenseNumber: 'MD-05', specialty: 'Orthopedics', experience: 22,
        bio: 'Sports medicine surgeon specialising in joint replacement and ACL reconstruction.',
        expertiseTags: ['bone', 'joint', 'fracture', 'knee', 'back pain', 'sports injury', 'shoulder'],
        location: { barangay: 'BGC', city: 'Taguig', coordinates: { lat: 14.5502, lng: 121.0492 } },
        availableSlots: [{ dayOfWeek: 'Friday', startTime: '07:00', endTime: '15:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Sandra', lastname: 'Oh', email: 'sandra@doctor.com',
        phoneNumber: '+639171000006', role: 'doctor', password: pw,
        profileImage: FEMALE(46),
        licenseNumber: 'MD-06', specialty: 'Psychiatry', experience: 19,
        bio: 'Psychiatrist specialising in anxiety, depression, and cognitive-behavioural therapy.',
        expertiseTags: ['anxiety', 'depression', 'mental health', 'stress', 'insomnia', 'mood'],
        location: { barangay: 'Wack-Wack', city: 'Mandaluyong', coordinates: { lat: 14.5832, lng: 121.0406 } },
        availableSlots: [{ dayOfWeek: 'Monday', startTime: '11:00', endTime: '19:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Oscar', lastname: 'Isaac', email: 'oscar@doctor.com',
        phoneNumber: '+639171000007', role: 'doctor', password: pw,
        profileImage: MALE(35),
        licenseNumber: 'MD-07', specialty: 'Gastroenterology', experience: 14,
        bio: 'Gastroenterologist treating IBS, GERD, inflammatory bowel disease, and gut microbiome disorders.',
        expertiseTags: ['stomach', 'IBS', 'digestion', 'gut health', 'acid reflux', 'bowel'],
        location: { barangay: 'BF Homes', city: 'Parañaque', coordinates: { lat: 14.4793, lng: 121.0198 } },
        availableSlots: [{ dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Viola', lastname: 'Davis', email: 'viola@doctor.com',
        phoneNumber: '+639171000008', role: 'doctor', password: pw,
        profileImage: FEMALE(47),
        licenseNumber: 'MD-08', specialty: 'Oncology', experience: 26,
        bio: 'Oncologist specialising in targeted immunotherapy and personalised cancer treatment plans.',
        expertiseTags: ['cancer', 'chemotherapy', 'tumor', 'immunotherapy', 'blood cancer', 'anemia'],
        location: { barangay: 'Concepcion', city: 'Marikina', coordinates: { lat: 14.6507, lng: 121.1029 } },
        availableSlots: [{ dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Ryan', lastname: 'Reynolds', email: 'ryan@doctor.com',
        phoneNumber: '+639171000009', role: 'doctor', password: pw,
        profileImage: MALE(36),
        licenseNumber: 'MD-09', specialty: 'General Practice', experience: 12,
        bio: 'General practitioner providing comprehensive annual check-ups, bloodwork, and preventive care.',
        expertiseTags: ['checkup', 'general', 'fever', 'cold', 'flu', 'cough', 'fatigue', 'diabetes'],
        location: { barangay: 'Pamplona', city: 'Las Piñas', coordinates: { lat: 14.4456, lng: 120.9834 } },
        availableSlots: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
        ],
        blockedDates: [],
      },
      {
        firstname: 'Margot', lastname: 'Robbie', email: 'margot@doctor.com',
        phoneNumber: '+639171000010', role: 'doctor', password: pw,
        profileImage: FEMALE(48),
        licenseNumber: 'MD-10', specialty: 'Endocrinology', experience: 10,
        bio: 'Endocrinologist managing diabetes, thyroid conditions, metabolic syndrome, and hormone therapy.',
        expertiseTags: ['diabetes', 'thyroid', 'hormones', 'weight', 'insulin', 'metabolic'],
        location: { barangay: 'Alabang', city: 'Muntinlupa', coordinates: { lat: 14.4082, lng: 121.0415 } },
        availableSlots: [{ dayOfWeek: 'Friday', startTime: '09:00', endTime: '15:00' }],
        blockedDates: [],
      },
      // ── REVIEWER ACCOUNTS (doctor role) ───────────────────────────────────────
      {
        firstname: 'Anne', lastname: 'Liangco', email: 'dr.anne.liangco@whitecloak.com',
        phoneNumber: '+639171000011', role: 'doctor', password: pw,
        profileImage: FEMALE(55),
        licenseNumber: 'MD-11', specialty: 'Internal Medicine', experience: 8,
        bio: 'Internal medicine specialist focused on comprehensive adult care and chronic disease management.',
        expertiseTags: ['general', 'checkup', 'chronic disease', 'hypertension', 'diabetes', 'fatigue'],
        location: { barangay: 'Poblacion', city: 'Makati', coordinates: { lat: 14.5595, lng: 121.0359 } },
        availableSlots: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Donn', lastname: 'Gamboa', email: 'dr.donn.gamboa@whitecloak.com',
        phoneNumber: '+639171000012', role: 'doctor', password: pw,
        profileImage: MALE(55),
        licenseNumber: 'MD-12', specialty: 'Pulmonology', experience: 11,
        bio: 'Pulmonologist with expertise in respiratory diseases, asthma management, and lung function testing.',
        expertiseTags: ['lungs', 'asthma', 'cough', 'breathing', 'COPD', 'respiratory'],
        location: { barangay: 'BGC', city: 'Taguig', coordinates: { lat: 14.5502, lng: 121.0492 } },
        availableSlots: [{ dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Miguel', lastname: 'Fermin', email: 'dr.miguel.fermin@whitecloak.com',
        phoneNumber: '+639171000013', role: 'doctor', password: pw,
        profileImage: MALE(56),
        licenseNumber: 'MD-13', specialty: 'Family Medicine', experience: 9,
        bio: 'Family medicine practitioner providing holistic care for patients of all ages.',
        expertiseTags: ['family', 'checkup', 'fever', 'cold', 'flu', 'preventive care'],
        location: { barangay: 'Ermita', city: 'Manila', coordinates: { lat: 14.5794, lng: 120.9842 } },
        availableSlots: [{ dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Thea', lastname: 'Juego', email: 'dr.thea.juego@whitecloak.com',
        phoneNumber: '+639171000014', role: 'doctor', password: pw,
        profileImage: FEMALE(56),
        licenseNumber: 'MD-14', specialty: 'Obstetrics & Gynecology', experience: 13,
        bio: 'OB-GYN specialising in prenatal care, reproductive health, and minimally invasive procedures.',
        expertiseTags: ['pregnancy', 'women', 'reproductive', 'prenatal', 'menstrual', 'gynecology'],
        location: { barangay: 'Quezon Avenue', city: 'Quezon City', coordinates: { lat: 14.6407, lng: 121.0222 } },
        availableSlots: [{ dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' }],
        blockedDates: [],
      },
      {
        firstname: 'Cherubim', lastname: 'Citco', email: 'dr.cherubim.citco@whitecloak.com',
        phoneNumber: '+639171000015', role: 'doctor', password: pw,
        profileImage: MALE(57),
        licenseNumber: 'MD-15', specialty: 'Emergency Medicine', experience: 7,
        bio: 'Emergency medicine physician experienced in acute care, trauma, and critical stabilisation.',
        expertiseTags: ['emergency', 'acute', 'trauma', 'urgent', 'chest pain', 'injury'],
        location: { barangay: 'Sampaloc', city: 'Manila', coordinates: { lat: 14.6042, lng: 120.9942 } },
        availableSlots: [{ dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00' }],
        blockedDates: [],
      },
    ];

    // ── PATIENTS ───────────────────────────────────────────────────────────────
    const patientsData = [
      {
        firstname: 'Tom', lastname: 'Hanks', email: 'tom@patient.com',
        phoneNumber: '+639172000001', role: 'patient', password: pw,
        profileImage: MALE(50),
        dateOfBirth: '1956-07-09T00:00:00Z', gender: 'male',
        bloodType: 'O+', height: 183, weight: 85,
        allergies: [], medicalHistory: ['Type 2 Diabetes', 'Hypertension'],
      },
      {
        firstname: 'Zendaya', lastname: 'Coleman', email: 'zendaya@patient.com',
        phoneNumber: '+639172000002', role: 'patient', password: pw,
        profileImage: FEMALE(50),
        dateOfBirth: '1996-09-01T00:00:00Z', gender: 'female',
        bloodType: 'A-', height: 178, weight: 59,
        allergies: ['Peanuts'], medicalHistory: ['Mild Asthma'],
      },
      {
        firstname: 'Keanu', lastname: 'Reeves', email: 'keanu@patient.com',
        phoneNumber: '+639172000003', role: 'patient', password: pw,
        profileImage: MALE(51),
        dateOfBirth: '1964-09-02T00:00:00Z', gender: 'male',
        bloodType: 'B+', height: 186, weight: 79,
        allergies: [], medicalHistory: ['Prior Shoulder Surgery', 'Lower Back Pain'],
      },
      {
        firstname: 'Florence', lastname: 'Pugh', email: 'florence@patient.com',
        phoneNumber: '+639172000004', role: 'patient', password: pw,
        profileImage: FEMALE(51),
        dateOfBirth: '1996-01-03T00:00:00Z', gender: 'female',
        bloodType: 'AB+', height: 162, weight: 57,
        allergies: ['Dust', 'Pollen'], medicalHistory: ['Asthma'],
      },
      {
        firstname: 'Timothee', lastname: 'Chalamet', email: 'timothee@patient.com',
        phoneNumber: '+639172000005', role: 'patient', password: pw,
        profileImage: MALE(52),
        dateOfBirth: '1995-12-27T00:00:00Z', gender: 'male',
        bloodType: 'O-', height: 178, weight: 68,
        allergies: [], medicalHistory: ['IBS'],
      },
      {
        firstname: 'Anya', lastname: 'Taylor-Joy', email: 'anya@patient.com',
        phoneNumber: '+639172000006', role: 'patient', password: pw,
        profileImage: FEMALE(52),
        dateOfBirth: '1996-04-16T00:00:00Z', gender: 'female',
        bloodType: 'A+', height: 173, weight: 55,
        allergies: ['Lactose'], medicalHistory: ['Iron-deficiency Anemia'],
      },
      {
        firstname: 'Ryan', lastname: 'Gosling', email: 'ryan@patient.com',
        phoneNumber: '+639172000007', role: 'patient', password: pw,
        profileImage: MALE(53),
        dateOfBirth: '1980-11-12T00:00:00Z', gender: 'male',
        bloodType: 'B-', height: 184, weight: 80,
        allergies: [], medicalHistory: ['Hypertension'],
      },
      {
        firstname: 'Scarlett', lastname: 'Johansson', email: 'scarlett@patient.com',
        phoneNumber: '+639172000008', role: 'patient', password: pw,
        profileImage: FEMALE(53),
        dateOfBirth: '1984-11-22T00:00:00Z', gender: 'female',
        bloodType: 'O+', height: 160, weight: 57,
        allergies: ['Pollen'], medicalHistory: ['Seasonal Allergies'],
      },
      {
        firstname: 'Chris', lastname: 'Evans', email: 'chris@patient.com',
        phoneNumber: '+639172000009', role: 'patient', password: pw,
        profileImage: MALE(54),
        dateOfBirth: '1981-06-13T00:00:00Z', gender: 'male',
        bloodType: 'B+', height: 183, weight: 88,
        allergies: [], medicalHistory: ['Torn ACL — recovered'],
      },
      {
        firstname: 'Emily', lastname: 'Blunt', email: 'emily@patient.com',
        phoneNumber: '+639172000010', role: 'patient', password: pw,
        profileImage: FEMALE(54),
        dateOfBirth: '1983-02-23T00:00:00Z', gender: 'female',
        bloodType: 'A-', height: 171, weight: 56,
        allergies: ['Penicillin'], medicalHistory: ['Chronic Migraines'],
      },
      // ── REVIEWER ACCOUNTS (patient role) ──────────────────────────────────────
      {
        firstname: 'Anne', lastname: 'Liangco', email: 'anne.liangco@whitecloak.com',
        phoneNumber: '+639172000011', role: 'patient', password: pw,
        profileImage: FEMALE(55),
        dateOfBirth: '1990-03-15T00:00:00Z', gender: 'female',
        bloodType: 'O+', height: 160, weight: 54,
        allergies: [], medicalHistory: [],
      },
      {
        firstname: 'Donn', lastname: 'Gamboa', email: 'donn.gamboa@whitecloak.com',
        phoneNumber: '+639172000012', role: 'patient', password: pw,
        profileImage: MALE(55),
        dateOfBirth: '1988-07-22T00:00:00Z', gender: 'male',
        bloodType: 'A+', height: 172, weight: 70,
        allergies: [], medicalHistory: [],
      },
      {
        firstname: 'Miguel', lastname: 'Fermin', email: 'miguel.fermin@whitecloak.com',
        phoneNumber: '+639172000013', role: 'patient', password: pw,
        profileImage: MALE(56),
        dateOfBirth: '1992-11-05T00:00:00Z', gender: 'male',
        bloodType: 'B+', height: 175, weight: 72,
        allergies: [], medicalHistory: [],
      },
      {
        firstname: 'Thea', lastname: 'Juego', email: 'thea.juego@whitecloak.com',
        phoneNumber: '+639172000014', role: 'patient', password: pw,
        profileImage: FEMALE(56),
        dateOfBirth: '1994-06-18T00:00:00Z', gender: 'female',
        bloodType: 'AB+', height: 163, weight: 52,
        allergies: [], medicalHistory: [],
      },
      {
        firstname: 'Cherubim', lastname: 'Citco', email: 'cherubim.citco@whitecloak.com',
        phoneNumber: '+639172000015', role: 'patient', password: pw,
        profileImage: MALE(57),
        dateOfBirth: '1991-09-30T00:00:00Z', gender: 'male',
        bloodType: 'O-', height: 170, weight: 68,
        allergies: [], medicalHistory: [],
      },
    ];

    const doctors = await Doctor.insertMany(doctorsData);
    const patients = await Patient.insertMany(patientsData);

    // Shorthand refs
    const [dClooney, dBerry, dWashington, , dElba, , dIsaac, dDavis, dReynolds, dRobbie] = doctors;
    const [pHanks, pZendaya, pReeves, pPugh, pChalamet, pAnya, pGosling, pJohansson, pEvans, pBlunt] = patients;

    // ── APPOINTMENTS ───────────────────────────────────────────────────────────
    const pastDate = (daysAgo: number, time: string) => {
      const d = new Date('2026-05-29');
      d.setDate(d.getDate() - daysAgo);
      return { date: d.toISOString(), time };
    };

    const futureDate = (daysAhead: number, time: string) => {
      const d = new Date('2026-05-29');
      d.setDate(d.getDate() + daysAhead);
      return { date: d.toISOString(), time };
    };

    const appointments = await Appointment.insertMany([
      // ── COMPLETED ────────────────────────────
      {
        doctor: dClooney._id, patient: pHanks._id,
        scheduledDate: pastDate(28, '10:00').date, startTime: '10:00', endTime: '10:30',
        status: 'completed', type: 'live_chat', reason: 'Routine cardiac check-up and BP review',
      },
      {
        doctor: dElba._id, patient: pReeves._id,
        scheduledDate: pastDate(21, '09:00').date, startTime: '09:00', endTime: '09:30',
        status: 'completed', type: 'live_chat', reason: 'Follow-up on shoulder rehabilitation',
      },
      {
        doctor: dReynolds._id, patient: pPugh._id,
        scheduledDate: pastDate(14, '14:00').date, startTime: '14:00', endTime: '14:30',
        status: 'completed', type: 'live_chat', reason: 'Asthma management and inhaler review',
      },
      {
        doctor: dIsaac._id, patient: pChalamet._id,
        scheduledDate: pastDate(10, '11:00').date, startTime: '11:00', endTime: '11:30',
        status: 'completed', type: 'live_chat', reason: 'IBS flare-up and dietary consultation',
      },
      {
        doctor: dDavis._id, patient: pAnya._id,
        scheduledDate: pastDate(7, '15:00').date, startTime: '15:00', endTime: '15:30',
        status: 'completed', type: 'live_chat', reason: 'Anaemia management and iron panel review',
      },
      // ── SCHEDULED ────────────────────────────
      {
        doctor: dRobbie._id, patient: pHanks._id,
        scheduledDate: futureDate(10, '09:00').date, startTime: '09:00', endTime: '09:30',
        status: 'scheduled', type: 'live_chat', reason: 'HbA1c follow-up and insulin dose adjustment',
      },
      {
        doctor: dElba._id, patient: pEvans._id,
        scheduledDate: futureDate(17, '10:00').date, startTime: '10:00', endTime: '10:30',
        status: 'scheduled', type: 'live_chat', reason: 'Post-ACL recovery assessment',
      },
      {
        doctor: dBerry._id, patient: pJohansson._id,
        scheduledDate: futureDate(24, '11:00').date, startTime: '11:00', endTime: '11:30',
        status: 'scheduled', type: 'live_chat', reason: 'Skin rash and seasonal allergy consultation',
      },
      {
        doctor: dWashington._id, patient: pBlunt._id,
        scheduledDate: futureDate(31, '14:00').date, startTime: '14:00', endTime: '14:30',
        status: 'scheduled', type: 'live_chat', reason: 'Chronic migraine management and medication review',
      },
      // ── IN-PROGRESS (live right now) ──────────
      {
        doctor: dClooney._id, patient: pGosling._id,
        scheduledDate: new Date('2026-05-29').toISOString(), startTime: '15:00', endTime: '15:30',
        status: 'in_progress', type: 'live_chat', reason: 'Hypertension management and lifestyle changes',
      },
    ]);

    const [aptHanks1, aptReeves, aptPugh, aptChalamet, aptAnya, , , , , aptGoslingLive] = appointments;

    // ── CLINICAL NOTES (for completed appointments) ────────────────────────────
    await ClinicalNote.insertMany([
      {
        appointment: aptHanks1._id, doctor: dClooney._id, patient: pHanks._id,
        chiefComplaint: 'Chest discomfort and occasional shortness of breath',
        clinicalFindings: 'BP 145/90 mmHg, HR 78 bpm. Mild cardiomegaly on echo. ECG shows occasional PVCs.',
        diagnosis: 'Hypertensive heart disease with early-stage cardiomegaly and ectopic beats.',
        recommendations: 'Initiate ACE inhibitor therapy. Reduce dietary sodium to <2g/day. Daily 30-min low-impact exercise. Follow-up in 6 weeks.',
        followUpDate: new Date('2026-07-01'),
      },
      {
        appointment: aptReeves._id, doctor: dElba._id, patient: pReeves._id,
        chiefComplaint: 'Residual shoulder stiffness and limited range of motion',
        clinicalFindings: 'Abduction ROM 140° (normal 180°). Mild crepitus on external rotation. Strength 4/5.',
        diagnosis: 'Post-operative adhesive capsulitis following rotator cuff repair.',
        recommendations: 'Continue physiotherapy 3×/week. Add hydrotherapy sessions. Avoid overhead lifting. MRI review in 3 months.',
        followUpDate: new Date('2026-08-15'),
      },
      {
        appointment: aptPugh._id, doctor: dReynolds._id, patient: pPugh._id,
        chiefComplaint: 'Increased frequency of nocturnal asthma attacks',
        clinicalFindings: 'Peak flow 68% predicted. SpO2 96% at rest. Bilateral wheeze on auscultation.',
        diagnosis: 'Mild persistent asthma — sub-optimal control.',
        recommendations: 'Step up to medium-dose ICS/LABA combination. Add LTRA as adjunct. Provide written asthma action plan.',
      },
      {
        appointment: aptChalamet._id, doctor: dIsaac._id, patient: pChalamet._id,
        chiefComplaint: 'Intermittent bloating, cramping, and altered bowel habits',
        clinicalFindings: 'Abdomen soft, mild tenderness in LIF. No organomegaly. FODMAP diary reviewed.',
        diagnosis: 'Irritable bowel syndrome — mixed type (IBS-M). Possible lactose intolerance.',
        recommendations: 'Low-FODMAP diet for 8 weeks. Introduce probiotics. Refer to dietitian. Colonoscopy if symptoms persist.',
      },
      {
        appointment: aptAnya._id, doctor: dDavis._id, patient: pAnya._id,
        chiefComplaint: 'Fatigue, pallor, and exertional dyspnoea',
        clinicalFindings: 'Hb 9.2 g/dL, Ferritin 6 ng/mL, MCV 71 fL. Conjunctival pallor noted.',
        diagnosis: 'Severe iron-deficiency anaemia.',
        recommendations: 'Oral ferrous sulphate 200 mg TID for 3 months. Dietary counselling for iron-rich foods. Repeat CBC in 6 weeks.',
        followUpDate: new Date('2026-07-10'),
      },
    ]);

    // ── PRESCRIPTIONS (for completed appointments) ────────────────────────────
    await Prescription.insertMany([
      {
        appointment: aptHanks1._id, doctor: dClooney._id, patient: pHanks._id,
        medications: [
          { name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning with water.' },
          { name: 'Aspirin', dosage: '81 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take with food to reduce stomach irritation.' },
        ],
        status: 'active',
      },
      {
        appointment: aptPugh._id, doctor: dReynolds._id, patient: pPugh._id,
        medications: [
          { name: 'Fluticasone/Salmeterol', dosage: '250/25 mcg', frequency: 'Twice daily (inhaler)', duration: '30 days', instructions: 'Rinse mouth after each use. Carry reliever inhaler at all times.' },
          { name: 'Montelukast', dosage: '10 mg', frequency: 'Once daily at bedtime', duration: '30 days', instructions: 'Take at the same time each night.' },
        ],
        status: 'active',
      },
      {
        appointment: aptAnya._id, doctor: dDavis._id, patient: pAnya._id,
        medications: [
          { name: 'Ferrous Sulphate', dosage: '200 mg', frequency: 'Three times daily with meals', duration: '90 days', instructions: 'Avoid antacids within 2 hours. Stools may darken — this is normal.' },
          { name: 'Vitamin C', dosage: '500 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take alongside iron tablet to improve absorption.' },
        ],
        status: 'active',
      },
    ]);

    // ── CONSULTATION MESSAGES (in-progress live session) ──────────────────────
    await ConsultationMessage.insertMany([
      {
        appointment: aptGoslingLive._id, sender: dClooney._id, senderRole: 'doctor',
        message: 'Good afternoon Mr. Gosling. I\'ve reviewed your recent blood pressure readings. Your average over the past two weeks is 158/95 — that\'s still quite elevated.',
        createdAt: new Date('2026-05-29T15:01:00Z'),
      },
      {
        appointment: aptGoslingLive._id, sender: pGosling._id, senderRole: 'patient',
        message: 'Yes, I\'ve been feeling dizzy in the mornings and getting headaches after work. It\'s been stressful lately.',
        createdAt: new Date('2026-05-29T15:02:00Z'),
      },
      {
        appointment: aptGoslingLive._id, sender: dClooney._id, senderRole: 'doctor',
        message: 'Stress is a major contributor. Have you been taking the Amlodipine I prescribed last time consistently?',
        createdAt: new Date('2026-05-29T15:03:00Z'),
      },
      {
        appointment: aptGoslingLive._id, sender: pGosling._id, senderRole: 'patient',
        message: 'Mostly yes, but I\'ve missed a couple of days this week.',
        createdAt: new Date('2026-05-29T15:04:00Z'),
      },
      {
        appointment: aptGoslingLive._id, sender: dClooney._id, senderRole: 'doctor',
        message: 'Consistency is critical with antihypertensives — skipping doses causes rebound spikes. I\'m going to increase your dose slightly. I\'ll also prescribe a low-dose diuretic to help. Any swelling in your ankles?',
        createdAt: new Date('2026-05-29T15:05:00Z'),
      },
    ]);

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    await Notification.insertMany([
      {
        user: pHanks._id,
        title: 'Appointment Confirmed',
        message: `Your consultation with Dr. Robbie is scheduled for ${futureDate(10, '09:00').date.slice(0, 10)} at 09:00.`,
        type: 'appointment', isRead: false,
      },
      {
        user: pEvans._id,
        title: 'Appointment Confirmed',
        message: `Your consultation with Dr. Elba is scheduled for ${futureDate(17, '10:00').date.slice(0, 10)} at 10:00.`,
        type: 'appointment', isRead: false,
      },
      {
        user: pBlunt._id,
        title: 'Appointment Confirmed',
        message: 'Your consultation with Dr. Washington has been booked. See you soon!',
        type: 'appointment', isRead: false,
      },
      {
        user: pGosling._id,
        title: '🔴 Consultation is Live',
        message: 'Dr. Clooney has started your consultation session. Join now!',
        type: 'appointment', isRead: false,
      },
      {
        user: dClooney._id,
        title: 'New Appointment Booked',
        message: `${pHanks.firstname} ${pHanks.lastname} has booked a consultation on ${futureDate(10, '09:00').date.slice(0, 10)}.`,
        type: 'appointment', isRead: false,
      },
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully',
      summary: {
        doctors: doctors.length,
        patients: patients.length,
        appointments: appointments.length,
        clinicalNotes: 5,
        prescriptions: 3,
        consultationMessages: 5,
        notifications: 5,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
