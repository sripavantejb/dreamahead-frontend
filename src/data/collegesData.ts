// Colleges Master Dataset
// In production, this would be loaded from Excel/Google Sheets

export interface CollegeMaster {
  college_id: string;
  name: string;
  state: string;
  city: string;
  streams: string[];
  type: 'Government' | 'Private' | 'Autonomous';
  nirf_rank?: number;
  website?: string;
}

export const collegesMaster: CollegeMaster[] = [
  {
    college_id: 'COL001',
    name: 'IIT Delhi',
    state: 'Delhi',
    city: 'New Delhi',
    streams: ['CSE', 'ECE', 'Mechanical', 'Civil'],
    type: 'Government',
    nirf_rank: 2,
    website: 'https://home.iitd.ac.in',
  },
  {
    college_id: 'COL002',
    name: 'IIT Bombay',
    state: 'Maharashtra',
    city: 'Mumbai',
    streams: ['CSE', 'ECE', 'Mechanical', 'Chemical'],
    type: 'Government',
    nirf_rank: 1,
    website: 'https://www.iitb.ac.in',
  },
  {
    college_id: 'COL003',
    name: 'BITS Pilani',
    state: 'Rajasthan',
    city: 'Pilani',
    streams: ['CSE', 'ECE', 'Mechanical', 'Chemical'],
    type: 'Private',
    nirf_rank: 25,
    website: 'https://www.bits-pilani.ac.in',
  },
  {
    college_id: 'COL004',
    name: 'NIT Trichy',
    state: 'Tamil Nadu',
    city: 'Tiruchirappalli',
    streams: ['CSE', 'ECE', 'Mechanical', 'Civil'],
    type: 'Government',
    nirf_rank: 10,
    website: 'https://www.nitt.edu',
  },
  {
    college_id: 'COL005',
    name: 'IIIT Hyderabad',
    state: 'Telangana',
    city: 'Hyderabad',
    streams: ['CSE', 'ECE'],
    type: 'Autonomous',
    nirf_rank: 45,
    website: 'https://www.iiit.ac.in',
  },
  {
    college_id: 'COL006',
    name: 'VIT Vellore',
    state: 'Tamil Nadu',
    city: 'Vellore',
    streams: ['CSE', 'ECE', 'Mechanical', 'Civil', 'BioTech'],
    type: 'Private',
    nirf_rank: 15,
    website: 'https://vit.ac.in',
  },
  {
    college_id: 'COL007',
    name: 'Manipal Institute of Technology',
    state: 'Karnataka',
    city: 'Manipal',
    streams: ['CSE', 'ECE', 'Mechanical', 'Civil'],
    type: 'Private',
    nirf_rank: 47,
    website: 'https://manipal.edu',
  },
  {
    college_id: 'COL008',
    name: 'SRM Institute of Science and Technology',
    state: 'Tamil Nadu',
    city: 'Chennai',
    streams: ['CSE', 'ECE', 'Mechanical', 'Civil'],
    type: 'Private',
    nirf_rank: 32,
    website: 'https://www.srmist.edu.in',
  },
];

export const states = [
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Tamil Nadu',
  'Telangana',
  'Delhi',
  'Maharashtra',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
];

export const streams = [
  { stream_code: 'CSE', label: 'Computer Science & Engineering' },
  { stream_code: 'ECE', label: 'Electronics & Communication' },
  { stream_code: 'ME', label: 'Mechanical Engineering' },
  { stream_code: 'CE', label: 'Civil Engineering' },
  { stream_code: 'EE', label: 'Electrical Engineering' },
  { stream_code: 'BT', label: 'Biotechnology' },
];
