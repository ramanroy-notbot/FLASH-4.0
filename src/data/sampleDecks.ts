import { DeckData } from '../types';

export const SAMPLE_DECKS: DeckData[] = [
  {
    id: 'mbbs-pharm-ans',
    title: 'Pharmacology - Autonomic Nervous System Drugs',
    description: 'High-yield ANS receptor pharmacology, agonists, antagonists, and clinical antidotes formatted for AnkiDroid Cloze recall.',
    subject: 'Pharmacology',
    sourceType: 'sample',
    sourceName: 'KD Tripathi & Rang Dale Review',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['Adrenergic Receptors', 'Anticholinergics', 'Organophosphate Poisoning', 'Beta Blockers'],
    extractedTextSummary: 'Autonomic nervous system pharmacology covering muscarinic, nicotinic, alpha, and beta receptors, clinical uses, and toxicities.',
    cards: [
      {
        id: 'pharm-1',
        front: '{{c1::Atropine}} is a competitive antagonist of {{c2::muscarinic}} acetylcholine receptors, used to treat severe {{c3::bradycardia}}.',
        back: 'Mydriasis, cycloplegia, tachycardia, dry mouth, and urinary retention are classic antimuscarinic side effects.',
        type: 'cloze',
        tags: ['pharmacology', 'anticholinergic', 'cloze']
      },
      {
        id: 'pharm-2',
        front: 'Stimulation of {{c1::Alpha-1 (α₁)}} adrenergic receptors activates the {{c2::Gq / IP3 / DAG}} pathway, causing {{c3::vasoconstriction}}.',
        back: 'Found on vascular smooth muscle, pupillary dilator muscle (mydriasis), and intestinal/bladder sphincters.',
        type: 'cloze',
        tags: ['pharmacology', 'adrenergic', 'ans']
      },
      {
        id: 'pharm-3',
        front: 'The specific antidote used to reactivate acetylcholinesterase in organophosphate poisoning is {{c1::Pralidoxime (2-PAM)}}.',
        back: 'Atropine controls muscarinic excess; Pralidoxime regenerates phosphorylated AChE at the neuromuscular junction.',
        type: 'cloze',
        tags: ['pharmacology', 'toxicology', 'antidotes']
      },
      {
        id: 'pharm-4',
        front: '{{c1::Propranolol}} is a {{c2::non-selective}} beta blocker and is contraindicated in patients with {{c3::bronchial asthma / COPD}}.',
        back: 'Blocks both β₁ (cardiac) and β₂ (bronchial smooth muscle relaxation) receptors, risking fatal bronchospasm.',
        type: 'cloze',
        tags: ['pharmacology', 'cardiovascular', 'beta_blocker']
      },
      {
        id: 'pharm-5',
        front: '{{c1::Neostigmine}} does not cross the blood-brain barrier because of its {{c2::quaternary amine}} structure, making it ideal for {{c3::Myasthenia Gravis}}.',
        back: 'Physostigmine is a tertiary amine and crosses the BBB (used for central anticholinergic toxicity).',
        type: 'cloze',
        tags: ['pharmacology', 'cholinergic', 'myasthenia']
      }
    ]
  },
  {
    id: 'mbbs-anat-brachial',
    title: 'Anatomy - Brachial Plexus & Upper Limb Nerve Lesions',
    description: 'Roots, trunks, cords, branches, clinical signs (Erb palsy, Klumpke palsy, Wrist drop, Claw hand).',
    subject: 'Anatomy',
    sourceType: 'sample',
    sourceName: 'BD Chaurasia & Grey Anatomy Clinical Notes',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['Brachial Plexus', 'Radial Nerve', 'Ulnar Nerve', 'Median Nerve', 'Erb Palsy'],
    extractedTextSummary: 'Upper limb motor and sensory nerve innervations, root values, sensory testing points, and classic deformity presentations.',
    cards: [
      {
        id: 'anat-1',
        front: 'Erb-Duchenne palsy results from injury to the {{c1::upper trunk (C5-C6)}} of the brachial plexus, producing the classic {{c2::"waiter\'s tip" / policeman\'s tip}} deformity.',
        back: 'Loss of abductors (supraspinatus, deltoid) and lateral rotators (infraspinatus); arm hangs by side, medially rotated and pronated.',
        type: 'cloze',
        tags: ['anatomy', 'brachial_plexus', 'clinical']
      },
      {
        id: 'anat-2',
        front: 'A fracture of the mid-shaft of the humerus typically damages the {{c1::Radial nerve}} in the spiral groove, leading to {{c2::wrist drop}}.',
        back: 'Paralysis of wrist extensors, finger extensors, and loss of sensation over dorsal first web space.',
        type: 'cloze',
        tags: ['anatomy', 'radial_nerve', 'orthopedics']
      },
      {
        id: 'anat-3',
        front: 'Injury to the Ulnar nerve at the wrist causes a {{c1::severe claw hand}}, whereas injury at the elbow causes a milder deformity known as the {{c2::Ulnar Paradox}}.',
        back: 'At the elbow, flexor digitorum profundus (FDP) medial half is also paralyzed, causing less flexion of DIP joints.',
        type: 'cloze',
        tags: ['anatomy', 'ulnar_nerve', 'hand_anatomy']
      },
      {
        id: 'anat-4',
        front: 'Which nerve provides sensation to the palmar aspect of the lateral 3.5 digits and is compressed in Carpal Tunnel Syndrome?',
        back: 'Median Nerve (enters palm through carpal tunnel deep to flexor retinaculum).',
        type: 'basic',
        tags: ['anatomy', 'median_nerve', 'carpal_tunnel']
      }
    ]
  },
  {
    id: 'mbbs-path-neoplasia',
    title: 'Pathology - Neoplasia & Diagnostic Tumor Markers',
    description: 'Robbins Pathology high-yield oncogenes, tumor suppressor genes, paraneoplastic syndromes, and serum tumor markers.',
    subject: 'Pathology',
    sourceType: 'sample',
    sourceName: 'Robbins Basic Pathology 10th Ed',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['Li-Fraumeni', 'p53', 'Tumor Markers', 'Carcinogenesis'],
    extractedTextSummary: 'Cell cycle regulation, TP53 and RB pathway, oncogene activations, chromosomal translocations, and clinical tumor markers.',
    cards: [
      {
        id: 'path-1',
        front: '{{c1::TP53}} (chromosome 17p) encodes protein p53, which arrests the cell cycle at the {{c2::G1/S checkpoint}} by inducing {{c3::p21 (CDKN1A)}}.',
        back: 'Germline mutation in TP53 causes Li-Fraumeni syndrome (multiple sarcomas, breast cancer, brain tumors, adrenocortical carcinoma).',
        type: 'cloze',
        tags: ['pathology', 'neoplasia', 'genetics']
      },
      {
        id: 'path-2',
        front: 'The serum tumor marker {{c1::CA-125}} is primarily used to monitor response and recurrence in {{c2::epithelial ovarian cancer}}.',
        back: 'Elevated also in endometriosis, PID, cirrhosis, and pregnancy (not diagnostic alone, best for recurrence monitoring).',
        type: 'cloze',
        tags: ['pathology', 'tumor_markers', 'gynecology']
      },
      {
        id: 'path-3',
        front: 'What diagnostic pathognomonic cell with "owl-eyed" binucleated appearance is characteristic of Hodgkin Lymphoma?',
        back: 'Reed-Sternberg (RS) cell (typically CD15+ and CD30+ on immunohistochemistry).',
        type: 'basic',
        tags: ['pathology', 'hematology', 'lymphoma']
      },
      {
        id: 'path-4',
        front: 'The translocation {{c1::t(9;22)(q34;q11)}} forms the Philadelphia chromosome, creating the constitutively active {{c2::BCR-ABL}} tyrosine kinase in {{c3::CML}}.',
        back: 'Targeted therapy with Tyrosine Kinase Inhibitors like Imatinib achieves high remission rates.',
        type: 'cloze',
        tags: ['pathology', 'hematology', 'genetics']
      }
    ]
  },
  {
    id: 'mbbs-phys-cvs',
    title: 'Physiology - Cardiovascular & Cardiac Cycle',
    description: 'Guyton & Hall high-yield cardiac electrophysiology, pressure-volume loops, pacemaker prepotential, and heart sounds.',
    subject: 'Physiology',
    sourceType: 'sample',
    sourceName: 'Guyton & Hall Medical Physiology',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Basic',
    detectedTopics: ['SA Node', 'Cardiac Output', 'Frank-Starling', 'Heart Sounds'],
    extractedTextSummary: 'Electrical conduction system, phases of ventricular action potential, mechanical cardiac cycle phases, and preload/afterload dynamics.',
    cards: [
      {
        id: 'phys-1',
        front: 'What ionic current produces the spontaneous phase 4 diastolic depolarization (pacemaker prepotential) in the SA node?',
        back: 'Funny current (I_f) carried predominantly by slow Na⁺ influx through hyperpolarization-activated cyclic nucleotide-gated (HCN) channels.',
        type: 'basic',
        tags: ['physiology', 'cvs', 'electrophysiology']
      },
      {
        id: 'phys-2',
        front: 'State the Frank-Starling law of the heart.',
        back: 'The stroke volume of the heart increases in response to an increase in the end-diastolic volume (EDV / preload), due to optimal overlap of actin and myosin filaments in myocardial sarcomeres.',
        type: 'basic',
        tags: ['physiology', 'cvs', 'mechanics']
      },
      {
        id: 'phys-3',
        front: 'What mechanical event in the cardiac cycle causes the first heart sound (S1)?',
        back: 'Closure of the atrioventricular valves (Mitral and Tricuspid) at the onset of isovolumetric ventricular contraction.',
        type: 'basic',
        tags: ['physiology', 'cardiac_cycle', 'clinical']
      },
      {
        id: 'phys-4',
        front: 'During which phase of the ventricular cardiac cycle are all 4 heart valves closed while ventricular pressure rises steeply?',
        back: 'Isovolumetric Contraction phase (between mitral closure and aortic opening).',
        type: 'basic',
        tags: ['physiology', 'cardiac_cycle']
      }
    ]
  },
  {
    id: 'mbbs-biochem-inborn',
    title: 'Biochemistry - Inborn Errors of Metabolism & Glycogen Storage',
    description: 'Harper & Satyanarayana enzymopathies: Von Gierke, Pompe, McArdle, Phenylketonuria, Galactosemia.',
    subject: 'Biochemistry',
    sourceType: 'sample',
    sourceName: 'Harper Illustrated Biochemistry',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['Glycogen Storage Diseases', 'Enzyme Deficiencies', 'PKU', 'Metabolism'],
    extractedTextSummary: 'Metabolic pathways of carbohydrate, amino acid, and lipid degradation with genetic enzyme blocks and clinical manifestations.',
    cards: [
      {
        id: 'biochem-1',
        front: 'Von Gierke disease (Type I GSD) is caused by deficiency of {{c1::Glucose-6-phosphatase}}, presenting with severe fasting {{c2::hypoglycemia}}, lactic acidosis, and {{c3::hepatomegaly}}.',
        back: 'Free glucose cannot be released into the blood from either glycogenolysis or gluconeogenesis.',
        type: 'cloze',
        tags: ['biochemistry', 'metabolism', 'gsd']
      },
      {
        id: 'biochem-2',
        front: 'Pompe disease (Type II GSD) is due to deficiency of lysosomal {{c1::acid alpha-glucosidase (acid maltase)}}, leading to massive {{c2::cardiomegaly}} and early infantile death.',
        back: '"Pompe trashes the Pump" (heart, liver, muscle accumulation of lysosomal glycogen).',
        type: 'cloze',
        tags: ['biochemistry', 'lysosomal', 'pompe']
      },
      {
        id: 'biochem-3',
        front: 'Phenylketonuria (PKU) is an autosomal recessive deficiency of {{c1::Phenylalanine Hydroxylase}}, resulting in accumulation of phenylalanine and a classic {{c2::mousy / musty odor}} in urine.',
        back: 'Requires lifelong restriction of dietary phenylalanine and tyrosine supplementation (which becomes essential).',
        type: 'cloze',
        tags: ['biochemistry', 'amino_acids', 'pku']
      },
      {
        id: 'biochem-4',
        front: 'In McArdle disease (Type V GSD), deficiency of {{c1::skeletal muscle glycogen phosphorylase (myophosphorylase)}} causes painful {{c2::muscle cramps and myoglobinuria}} following strenuous exercise.',
        back: 'Blood lactate levels fail to rise after ischemic forearm exercise test.',
        type: 'cloze',
        tags: ['biochemistry', 'gsd', 'muscle']
      }
    ]
  },
  {
    id: 'mbbs-med-cardio',
    title: 'General Medicine - Acute Coronary Syndrome & Cardiology',
    description: 'Harrison Medicine emergency protocols: STEMI diagnostic criteria, reciprocal ECG changes, and immediate pharmacotherapy.',
    subject: 'General Medicine',
    sourceType: 'sample',
    sourceName: 'Harrison Principles of Internal Medicine',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['STEMI', 'ECG Criteria', 'Troponin', 'MONA Protocol'],
    extractedTextSummary: 'Myocardial infarction diagnostic criteria, lead localizations, coronary anatomy mapping, and anti-ischemic drug regimens.',
    cards: [
      {
        id: 'med-1',
        front: 'ST elevation in leads {{c1::II, III, and aVF}} indicates an {{c2::Inferior wall}} myocardial infarction, most commonly due to occlusion of the {{c3::Right Coronary Artery (RCA)}}.',
        back: 'Watch for AV blocks and right ventricular infarction (hypotension, clear lung fields, elevated JVP). Avoid nitrates if RV involvement.',
        type: 'cloze',
        tags: ['medicine', 'cardiology', 'ecg', 'stemi']
      },
      {
        id: 'med-2',
        front: 'What is the most sensitive and cardiac-specific biochemical biomarker for diagnosing acute myocardial infarction within 3 to 6 hours of onset?',
        back: 'Cardiac Troponin I or T (cTnI / cTnT). Levels remain elevated for 7 to 10 days.',
        type: 'basic',
        tags: ['medicine', 'biomarkers', 'cardiology']
      },
      {
        id: 'med-3',
        front: 'In acute STEMI, primary percutaneous coronary intervention (PCI) is the gold standard revascularization strategy if door-to-balloon time is under {{c1::90 minutes}} (or {{c2::120 minutes}} if transferred).',
        back: 'If PCI unavailable within 120 minutes, administer fibrinolytic therapy (e.g., Tenecteplase) within 30 minutes of medical contact (door-to-needle < 30 min).',
        type: 'cloze',
        tags: ['medicine', 'emergency', 'pci']
      },
      {
        id: 'med-4',
        front: 'What classic physical exam triad characterizes Beck\'s Triad in Acute Cardiac Tamponade?',
        back: '1. Hypotension\n2. Distended neck veins (elevated JVP)\n3. Muffled / distant heart sounds\n(Often accompanied by pulsus paradoxus).',
        type: 'basic',
        tags: ['medicine', 'cardiology', 'emergency']
      }
    ]
  },
  {
    id: 'mbbs-obgyn-labor',
    title: 'OBGYN - Stages of Labor & Obstetric Complications',
    description: 'Williams Obstetrics core guidelines: 3 stages of labor, Bishop score for cervical ripening, PPH 4 Ts, and pre-eclampsia.',
    subject: 'OBGYN',
    sourceType: 'sample',
    sourceName: 'Williams Obstetrics 26th Ed',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Cloze',
    detectedTopics: ['Stages of Labor', 'Postpartum Hemorrhage', 'Eclampsia', 'Bishop Score'],
    extractedTextSummary: 'Obstetric mechanics, monitoring fetal distress, active management of 3rd stage of labor (AMTSL), and hypertensive disorders of pregnancy.',
    cards: [
      {
        id: 'obgyn-1',
        front: 'The second stage of labor is defined as the interval between {{c1::full cervical dilation (10 cm)}} and {{c2::delivery of the baby}}.',
        back: 'Stage 1: Onset of true labor to full cervical dilation (latent + active phase). Stage 3: Delivery of baby to delivery of placenta.',
        type: 'cloze',
        tags: ['obgyn', 'labor', 'obstetrics']
      },
      {
        id: 'obgyn-2',
        front: 'The drug of choice for the prevention and treatment of seizures in severe pre-eclampsia and eclampsia is {{c1::Magnesium Sulfate (MgSO₄)}}.',
        back: 'Antidote for magnesium toxicity (loss of patellar reflexes, respiratory depression) is 10% Calcium Gluconate IV.',
        type: 'cloze',
        tags: ['obgyn', 'eclampsia', 'pharmacotherapy']
      },
      {
        id: 'obgyn-3',
        front: 'What are the 4 "T" etiologies of primary Postpartum Hemorrhage (PPH)?',
        back: '1. Tone (Uterine Atony - >70% of cases)\n2. Trauma (Cervical / vaginal tears)\n3. Tissue (Retained placental fragments)\n4. Thrombin (Coagulopathies / DIC)',
        type: 'basic',
        tags: ['obgyn', 'pph', 'obstetrics']
      }
    ]
  },
  {
    id: 'mbbs-peds-milestones',
    title: 'Pediatrics - Developmental Milestones & Neonatology',
    description: 'Nelson Textbook of Pediatrics core gross motor, fine motor, social, and language milestones for board exams.',
    subject: 'Pediatrics',
    sourceType: 'sample',
    sourceName: 'Nelson Textbook of Pediatrics',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    recommendedDelimiter: 'tab',
    recommendedNoteType: 'Basic',
    detectedTopics: ['Milestones', 'APGAR Score', 'Reflexes', 'Neonatology'],
    extractedTextSummary: 'Normal pediatric developmental timeline, neonatal primitive reflexes (Moro, ATNR), and critical developmental delay red flags.',
    cards: [
      {
        id: 'peds-1',
        front: 'At what age does a normal infant develop a responsive social smile?',
        back: '2 months of age (spontaneous smile earlier; intentional social smile at 6-8 weeks).',
        type: 'basic',
        tags: ['pediatrics', 'milestones', 'social']
      },
      {
        id: 'peds-2',
        front: 'At what age does an infant achieve sitting without support?',
        back: '6 to 7 months of age (tri-pod sitting at 6 mo; unassisted steady sitting by 7-8 mo).',
        type: 'basic',
        tags: ['pediatrics', 'gross_motor', 'milestones']
      },
      {
        id: 'peds-3',
        front: 'At what age does a child typically develop mature pincer grasp (thumb and index finger tip-to-tip)?',
        back: '9 to 10 months (immature/pad-to-pad at 9 mo; fine neat pincer grasp at 10-12 mo).',
        type: 'basic',
        tags: ['pediatrics', 'fine_motor', 'milestones']
      },
      {
        id: 'peds-4',
        front: 'What 5 parameters are assessed in the APGAR score at 1 and 5 minutes after birth?',
        back: 'A: Appearance (Skin color: pink vs blue/pale)\nP: Pulse (Heart rate: >100, <100, absent)\nG: Grimace (Reflex irritability)\nA: Activity (Muscle tone / flexion)\nR: Respiration (Effort / strong cry)\nScore out of 10.',
        type: 'basic',
        tags: ['pediatrics', 'neonatology', 'apgar']
      }
    ]
  }
];
