import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
}

export interface Counselor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  image: string;
  experience: number;
  rating: number;
}

export interface Booking {
  id: string;
  companyId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  bookedAt: string;
}

interface BookingStore {
  companies: Company[];
  counselors: Counselor[];
  bookings: Booking[];
  
  // Company actions
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Counselor actions
  addCounselor: (counselor: Omit<Counselor, 'id'>) => void;
  updateCounselor: (id: string, counselor: Partial<Counselor>) => void;
  deleteCounselor: (id: string) => void;
  
  // Booking actions
  bookSlot: (booking: Omit<Booking, 'id' | 'bookedAt'>) => boolean;
}

const initialCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    logo: '💻',
    industry: 'Technology',
    description: 'Leading software development company specializing in enterprise solutions and cloud infrastructure.',
    location: 'San Francisco, CA',
    totalSlots: 10,
    availableSlots: 6,
  },
  {
    id: '2',
    name: 'Green Energy Labs',
    logo: '🌱',
    industry: 'Energy',
    description: 'Innovative renewable energy research and development company focused on sustainable solutions.',
    location: 'Austin, TX',
    totalSlots: 8,
    availableSlots: 4,
  },
  {
    id: '3',
    name: 'FinanceHub',
    logo: '💰',
    industry: 'Finance',
    description: 'Modern fintech company providing cutting-edge banking and investment solutions.',
    location: 'New York, NY',
    totalSlots: 12,
    availableSlots: 8,
  },
  {
    id: '4',
    name: 'HealthFirst Medical',
    logo: '🏥',
    industry: 'Healthcare',
    description: 'Healthcare technology company improving patient care through innovative digital solutions.',
    location: 'Boston, MA',
    totalSlots: 6,
    availableSlots: 3,
  },
  {
    id: '5',
    name: 'Creative Studio X',
    logo: '🎨',
    industry: 'Design',
    description: 'Award-winning design agency creating stunning digital experiences and brand identities.',
    location: 'Los Angeles, CA',
    totalSlots: 5,
    availableSlots: 2,
  },
  {
    id: '6',
    name: 'DataDriven Analytics',
    logo: '📊',
    industry: 'Technology',
    description: 'Data science and analytics company helping businesses make smarter decisions.',
    location: 'Seattle, WA',
    totalSlots: 8,
    availableSlots: 5,
  },
];

const initialCounselors: Counselor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Senior Career Counselor',
    specialization: 'Tech & Engineering Careers',
    bio: 'With over 15 years of experience in career counseling, Dr. Johnson has helped thousands of students find their dream tech careers.',
    image: '👩‍💼',
    experience: 15,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Industry Relations Expert',
    specialization: 'Business & Finance',
    bio: 'Former investment banker turned career counselor, Michael brings real-world financial industry insights to students.',
    image: '👨‍💼',
    experience: 12,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'Student Success Coach',
    specialization: 'Healthcare & Life Sciences',
    bio: 'Emily specializes in guiding students toward fulfilling careers in healthcare and medical research.',
    image: '👩‍⚕️',
    experience: 8,
    rating: 4.7,
  },
];

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      companies: initialCompanies,
      counselors: initialCounselors,
      bookings: [],

      addCompany: (company) => {
        const newCompany: Company = {
          ...company,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          companies: [...state.companies, newCompany],
        }));
      },

      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        }));
      },

      addCounselor: (counselor) => {
        const newCounselor: Counselor = {
          ...counselor,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          counselors: [...state.counselors, newCounselor],
        }));
      },

      updateCounselor: (id, updates) => {
        set((state) => ({
          counselors: state.counselors.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCounselor: (id) => {
        set((state) => ({
          counselors: state.counselors.filter((c) => c.id !== id),
        }));
      },

      bookSlot: (bookingData) => {
        const { companies } = get();
        const company = companies.find((c) => c.id === bookingData.companyId);
        
        if (!company || company.availableSlots <= 0) {
          return false;
        }

        const newBooking: Booking = {
          ...bookingData,
          id: crypto.randomUUID(),
          bookedAt: new Date().toISOString(),
        };

        set((state) => ({
          bookings: [...state.bookings, newBooking],
          companies: state.companies.map((c) =>
            c.id === bookingData.companyId
              ? { ...c, availableSlots: c.availableSlots - 1 }
              : c
          ),
        }));

        return true;
      },
    }),
    {
      name: 'booking-storage',
    }
  )
);
