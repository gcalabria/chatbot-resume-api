interface Language {
  name: string;
  proficiency:
    | "PROFESSIONAL_WORKING"
    | "FULL_PROFESSIONAL"
    | "NATIVE_OR_BILINGUAL"
    | "ELEMENTARY"
    | "LIMITED_WORKING";
}

interface Date {
  year: number;
  month: Month;
  day: number;
}

interface Education {
  start: Date;
  end: Date;
  fieldOfStudy: string;
  degree: string;
  grade: string;
  schoolName: string;
  description: string;
  activities: string;
  url: string;
  schoolId: string;
}

interface Position {
  companyName: string;
  companyUsername: string;
  companyURL: string;
  companyLogo: string;
  companyIndustry: string;
  companyStaffCountRange: string;
  title: string;
  multiLocaleTitle: MultiLocaleProp;
  multiLocaleCompanyName: MultiLocaleProp;
  location: string;
  description: string;
  employmentType: string;
  start: Date;
  end: Date;
}

interface Skill {
  name: string;
}

interface Certification {
  name: "Neural Networks and Deep Learning";
  start: Date;
  end: Date;
  authority: string;
  company: {
    name: string;
    universalName: string;
    logo: string;
    staffCountRange: unknown;
    headquarter: unknown;
  };
  timePeriod: {
    start: Date;
    end: Date;
  };
}

interface Locale {
  country: string;
  language: string;
}

interface MultiLocaleProp {
  [key: string]: string;
}

interface LinkedInProfile {
  firstName: string;
  lastName: string;
  isOpenToWork: boolean;
  isHiring: boolean;
  profilePicture: string;
  summary: string;
  headline: string;
  geo: {
    country: string;
    city: string;
    full: string;
  };
  languages: Language[];
  educations: Education[];
  position: Position[];
  fullPositions: Position[];
  skills: Skill[];
  givenRecommendation: null;
  receivedRecommendation: null;
  courses: null;
  certifications: Certification[];
  honors: null;
  volunteering: null;
  supportedLocales: Locale[];
  multiLocaleFirstName: MultiLocaleProp;
  multiLocaleLastName: MultiLocaleProp;
  multiLocaleHeadline: MultiLocaleProp;
}

interface Message {
  id: string;
  author: "HUMAN" | "BOT";
  text: string;
}

enum Month {
  January = 0,
  February = 1,
  March = 2,
  April = 3,
  May = 4,
  June = 5,
  July = 6,
  August = 7,
  September = 8,
  October = 9,
  November = 10,
  Dezember = 11,
}

export type {
  LinkedInProfile,
  Message,
  Language,
  Position,
  Education,
  Date,
  Skill,
};

export { Month };
