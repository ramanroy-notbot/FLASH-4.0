import { MbbsSubject } from '../types';

export interface MbbsSubjectInfo {
  name: MbbsSubject;
  phase: '1st Prof' | '2nd Prof' | '3rd Prof (Part 1)' | 'Final Prof' | 'General';
  code: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
  description: string;
}

export const MBBS_SUBJECTS: MbbsSubjectInfo[] = [
  // 1st Prof
  {
    name: 'Anatomy',
    phase: '1st Prof',
    code: 'ANAT',
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800'
    },
    description: 'Gross anatomy, neuroanatomy, embryology, histology, osteology'
  },
  {
    name: 'Physiology',
    phase: '1st Prof',
    code: 'PHYS',
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800'
    },
    description: 'CVS, neurophysiology, respiration, renal, endocrine mechanisms'
  },
  {
    name: 'Biochemistry',
    phase: '1st Prof',
    code: 'BIOCH',
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    description: 'Metabolism, molecular genetics, enzymology, clinical biomarkers'
  },

  // 2nd Prof
  {
    name: 'Pathology',
    phase: '2nd Prof',
    code: 'PATH',
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800'
    },
    description: 'General pathology, hematology, systemic pathology, histopathology'
  },
  {
    name: 'Pharmacology',
    phase: '2nd Prof',
    code: 'PHARM',
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800'
    },
    description: 'ANS, CNS, antimicrobials, cardiovascular drugs, toxicology, MoA'
  },
  {
    name: 'Microbiology',
    phase: '2nd Prof',
    code: 'MICRO',
    color: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-800'
    },
    description: 'Bacteriology, virology, mycology, parasitology, immunology'
  },
  {
    name: 'Forensic Medicine (FMT)',
    phase: '2nd Prof',
    code: 'FMT',
    color: {
      bg: 'bg-stone-50',
      text: 'text-stone-700',
      border: 'border-stone-200',
      badge: 'bg-stone-100 text-stone-800'
    },
    description: 'Thanatology, post-mortem, forensic toxicology, legal medicine'
  },

  // 3rd Prof Part 1
  {
    name: 'Community Medicine (PSM)',
    phase: '3rd Prof (Part 1)',
    code: 'PSM',
    color: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      badge: 'bg-cyan-100 text-cyan-800'
    },
    description: 'Epidemiology, biostatistics, maternal-child health, national health programs'
  },
  {
    name: 'Ophthalmology',
    phase: '3rd Prof (Part 1)',
    code: 'OPHTH',
    color: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      badge: 'bg-sky-100 text-sky-800'
    },
    description: 'Cataract, glaucoma, corneal diseases, retina, refraction'
  },
  {
    name: 'ENT',
    phase: '3rd Prof (Part 1)',
    code: 'ENT',
    color: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800'
    },
    description: 'Otology, rhinology, laryngology, neck masses, audiometry'
  },

  // Final Prof
  {
    name: 'General Medicine',
    phase: 'Final Prof',
    code: 'MED',
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800'
    },
    description: 'Cardiology, nephrology, neurology, pulmonology, endocrinology, infectious diseases'
  },
  {
    name: 'General Surgery',
    phase: 'Final Prof',
    code: 'SURG',
    color: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800'
    },
    description: 'Acute abdomen, trauma, GI surgery, thyroid, breast, vascular surgery'
  },
  {
    name: 'OBGYN',
    phase: 'Final Prof',
    code: 'OBGYN',
    color: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      badge: 'bg-pink-100 text-pink-800'
    },
    description: 'Obstetrics, antenatal care, labor management, gynecology, contraception'
  },
  {
    name: 'Pediatrics',
    phase: 'Final Prof',
    code: 'PEDS',
    color: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    description: 'Developmental milestones, neonatology, pediatric infections, malnutrition'
  },
  {
    name: 'Orthopedics',
    phase: 'Final Prof',
    code: 'ORTHO',
    color: {
      bg: 'bg-lime-50',
      text: 'text-lime-700',
      border: 'border-lime-200',
      badge: 'bg-lime-100 text-lime-800'
    },
    description: 'Fractures, joint dislocations, bone tumors, pediatric orthopedics'
  },
  {
    name: 'Dermatology',
    phase: 'Final Prof',
    code: 'DERM',
    color: {
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
      badge: 'bg-fuchsia-100 text-fuchsia-800'
    },
    description: 'Skin lesions, infectious dermatoses, bullous disorders, STIs'
  },
  {
    name: 'Psychiatry',
    phase: 'Final Prof',
    code: 'PSYCH',
    color: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      badge: 'bg-violet-100 text-violet-800'
    },
    description: 'Schizophrenia, bipolar disorder, depression, anxiety disorders, psychopharmacology'
  },
  {
    name: 'Radiology',
    phase: 'Final Prof',
    code: 'RAD',
    color: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-300',
      badge: 'bg-slate-200 text-slate-800'
    },
    description: 'X-rays, CT scan interpretation, MRI sequences, ultrasound imaging signs'
  },
  {
    name: 'Anesthesiology',
    phase: 'Final Prof',
    code: 'ANESTH',
    color: {
      bg: 'bg-zinc-50',
      text: 'text-zinc-700',
      border: 'border-zinc-200',
      badge: 'bg-zinc-100 text-zinc-800'
    },
    description: 'General anesthesia, airway management, spinal/epidural, ICU resuscitation'
  }
];

export const MBBS_PHASES = [
  'All Subjects',
  '1st Prof',
  '2nd Prof',
  '3rd Prof (Part 1)',
  'Final Prof'
] as const;

export function getMbbsSubjectInfo(subject?: MbbsSubject): MbbsSubjectInfo {
  const found = MBBS_SUBJECTS.find((s) => s.name === subject);
  if (found) return found;
  return {
    name: 'General Medicine',
    phase: 'Final Prof',
    code: 'MED',
    color: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-800'
    },
    description: 'General clinical medicine and allied subjects'
  };
}
