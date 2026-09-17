/**
 * doctorAccounts.js
 * Mock authentication accounts for doctor login.
 * Each account maps to a doctor in doctors.js by ID.
 * Replace with real API auth in production.
 */

export const DOCTOR_ACCOUNTS = [
  {
    id: 'doc-001', email: 'priya.sharma@arogyabodhini.com', password: 'Doctor@123',
    name: 'Dr. Priya Sharma', spec: 'Cardiologist', regNo: 'MCI-KA-2013-45672',
    hospital: 'Apollo Hospital, Bangalore', initials: 'PS', bgColor: '#1565c0',
  },
  {
    id: 'doc-rajesh-kumar', email: 'rajesh.kumar@arogyabodhini.com', password: 'Doctor@123',
    name: 'Dr. Rajesh Kumar', spec: 'Neurologist', regNo: 'MCI-TN-2011-38821',
    hospital: 'Manipal Hospital, Chennai', initials: 'RK', bgColor: '#6a1b9a',
  },
  {
    id: 'doc-ananya-reddy', email: 'ananya.reddy@arogyabodhini.com', password: 'Doctor@123',
    name: 'Dr. Ananya Reddy', spec: 'General Physician', regNo: 'MCI-AP-2016-22109',
    hospital: 'Fortis Hospital, Hyderabad', initials: 'AR', bgColor: '#2e7d32',
  },
  {
    id: 'doc-meena-iyer', email: 'meena.iyer@arogyabodhini.com', password: 'Doctor@123',
    name: 'Dr. Meena Iyer', spec: 'General Physician', regNo: 'MCI-TN-2014-19876',
    hospital: 'Kauvery Hospital, Chennai', initials: 'MI', bgColor: '#00838f',
  },
  {
    id: 'doc-suresh-nair', email: 'suresh.nair@arogyabodhini.com', password: 'Doctor@123',
    name: 'Dr. Suresh Nair', spec: 'Dermatologist', regNo: 'MCI-KA-2013-51234',
    hospital: 'Aster CMI, Bangalore', initials: 'SN', bgColor: '#ad1457',
  },
]

export function getDemoCredentials() {
  return { email: DOCTOR_ACCOUNTS[0].email, password: DOCTOR_ACCOUNTS[0].password }
}

export default DOCTOR_ACCOUNTS
