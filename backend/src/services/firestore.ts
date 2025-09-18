import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  assessmentCount: number;
  currentSkills: string[];
  careerGoals: string[];
}

// Assessment Interface
export interface Assessment {
  id: string;
  userId: string;
  answers: AssessmentAnswer[];
  results: AssessmentResults;
  createdAt: string;
  completedAt: string;
}

export interface AssessmentAnswer {
  questionId: number;
  question: string;
  answer: string;
}

export interface AssessmentResults {
  skillLevels: SkillLevel[];
  recommendedCareers: CareerRecommendation[];
  learningRecommendations: string[];
  overallScore: number;
}

export interface SkillLevel {
  skill: string;
  level: number;
  category: string;
  confidence: number;
}

export interface CareerRecommendation {
  title: string;
  match: number;
  description: string;
  skills: string[];
  averageSalary?: string;
  jobDemand?: 'Low' | 'Medium' | 'High' | 'Very High';
  requirements?: string[];
}

// User Profile Operations
export class UserService {
  static async createUser(userProfile: UserProfile): Promise<void> {
    await db.collection('users').doc(userProfile.uid).set(userProfile);
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? (doc.data() as UserProfile) : null;
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await db.collection('users').doc(uid).update(updates);
  }

  static async updateLastLogin(uid: string): Promise<void> {
    await db.collection('users').doc(uid).update({
      lastLoginAt: new Date().toISOString()
    });
  }
}

// Assessment Operations
export class AssessmentService {
  static async createAssessment(assessment: Assessment): Promise<string> {
    const docRef = await db.collection('assessments').add(assessment);
    return docRef.id;
  }

  static async getAssessment(id: string): Promise<Assessment | null> {
    const doc = await db.collection('assessments').doc(id).get();
    return doc.exists ? ({ ...doc.data(), id: doc.id } as Assessment) : null;
  }

  static async getUserAssessments(userId: string): Promise<Assessment[]> {
    const snapshot = await db.collection('assessments')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Assessment));
  }

  static async getLatestAssessment(userId: string): Promise<Assessment | null> {
    const snapshot = await db.collection('assessments')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as Assessment;
  }

  static async updateAssessment(id: string, updates: Partial<Assessment>): Promise<void> {
    await db.collection('assessments').doc(id).update(updates);
  }
}

// Skills Catalog Operations
export class SkillsService {
  static async getAllSkills(): Promise<any[]> {
    const snapshot = await db.collection('skills').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }

  static async getSkill(id: string): Promise<any | null> {
    const doc = await db.collection('skills').doc(id).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  }

  static async getTrendingSkills(): Promise<any[]> {
    const snapshot = await db.collection('skills')
      .where('trending', '==', true)
      .orderBy('demandGrowth', 'desc')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }
}

// Career Information Operations
export class CareerService {
  static async getAllCareers(): Promise<any[]> {
    const snapshot = await db.collection('careers').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }

  static async getCareer(id: string): Promise<any | null> {
    const doc = await db.collection('careers').doc(id).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  }

  static async getRecommendedCareers(skills: string[]): Promise<any[]> {
    // This would typically use more complex matching logic
    const snapshot = await db.collection('careers')
      .where('requiredSkills', 'array-contains-any', skills)
      .limit(10)
      .get();

    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }
}

export default db;