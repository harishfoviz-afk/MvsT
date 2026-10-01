export type AgeGroup = '4-6' | '7-9' | '10+';

export type ActivityType = 'maze' | 'wordsearch' | 'dottodot' | 'coloring' | 'sudoku';

export type BookTheme = 'animals' | 'space' | 'dinosaurs' | 'fantasy' | 'underwater' | 'jungle';

export interface ActivityDistribution {
  maze: number;       // percentage
  wordsearch: number; // percentage
  dottodot: number;   // percentage
  coloring: number;   // percentage
  sudoku: number;     // percentage
}

export interface BookConfig {
  title: string;
  subtitle: string;
  authorName: string;
  childName?: string; // Optional personalization for "This Book Belongs To" page
  ageGroup: AgeGroup;
  theme: BookTheme;
  pageCount: number; // KDP minimum 24 for paperback, typical 40, 60, 80, 100
  singleSided: boolean; // Leave blank page behind activity to avoid marker bleed
  activityDistribution: ActivityDistribution;
  seed: number;
}

export interface QCResult {
  passed: boolean;
  score: number; // 0 to 100
  checks: {
    solvable: boolean;
    hasDuplicates: boolean;
    ageAppropriate: boolean;
    marginsSafe: boolean;
  };
  messages: string[];
}

export interface ActivityPage {
  id: string;
  pageNumber: number;
  type: ActivityType;
  title: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: BookTheme;
  data: any; // specific generator payload
  solutionData: any; // data used to render the solution
  qc: QCResult;
  challengeNumber?: number;
  svgContent?: string;
  solutionSvgContent?: string;
}

export interface BookProject {
  config: BookConfig;
  pages: ActivityPage[];
  frontMatter: {
    titlePage: boolean;
    belongsToPage: boolean;
    instructionsPage: boolean;
    stampPassportPage: boolean;
    childName?: string;
  };
  backMatter: {
    solutionsPage: boolean;
    pictureDictionaryPage?: boolean;
    congratulationsPage: boolean;
  };
  cover: CoverConfig;
}

export interface CoverConfig {
  templateId: string;
  theme: BookTheme;
  title: string;
  subtitle: string;
  authorName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  spineText: string;
  backCoverBlurb: string;
  features: string[];
  showBarcodePlaceholder: boolean;
  coverMode?: 'template' | 'uploaded-front' | 'uploaded-full';
  uploadedFrontCoverUrl?: string;
  uploadedFullWrapUrl?: string;
  showPublisherLogo?: boolean; // Tag official Kunta Publications logo on cover
  logoPlacement?: 'back' | 'front' | 'both';
}

export interface BookRecord {
  id: string;
  sku: string; // e.g. KP-SPACE-AGE4-6-24P-v8A3F
  title: string;
  subtitle: string;
  theme: BookTheme;
  ageGroup: AgeGroup;
  pageCount: number;
  puzzleCount: number;
  createdAt: string;
  isPublishedOnAmazon: boolean;
  amazonAsin?: string;
  project: BookProject;
  tier?: 'free' | 'premium';
  isFeatured?: boolean;
}

