import { storage } from "./storage";

interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  from: {
    name: string;
    id: string;
  };
}

interface FacebookResponse {
  data: FacebookPost[];
  paging?: {
    next?: string;
  };
}

const ORGANIZATION_PAGES = {
  'De La Salle University': 'DLSU.Manila.100',
  'Archers Network': 'ArchersNetwork',
  'DLSU USG': 'dlsu.usg',
  'Englicom': 'dlsu.englicom',
  'Investor\'s Society': 'InvestorsSocietyDLSU'
};

const INTEREST_KEYWORDS = {
  'technology': ['tech', 'programming', 'coding', 'computer', 'software', 'digital', 'AI', 'data', 'cyber'],
  'business': ['business', 'entrepreneurship', 'startup', 'finance', 'marketing', 'economics', 'trade'],
  'arts': ['art', 'creative', 'design', 'culture', 'music', 'theater', 'literature', 'gallery'],
  'science': ['science', 'research', 'laboratory', 'experiment', 'biology', 'chemistry', 'physics'],
  'sports': ['sports', 'athletic', 'tournament', 'competition', 'game', 'fitness', 'training'],
  'social-events': ['event', 'party', 'gathering', 'celebration', 'festival', 'meeting', 'seminar', 'workshop']
};

const DEPARTMENT_KEYWORDS = {
  'rvrcob': ['business', 'management', 'finance', 'marketing', 'accounting', 'economics'],
  'gcoe': ['engineering', 'civil', 'mechanical', 'electrical', 'chemical', 'industrial'],
  'cla': ['liberal arts', 'literature', 'philosophy', 'history', 'languages', 'communication'],
  'ccs': ['computer', 'programming', 'software', 'IT', 'technology', 'coding', 'data'],
  'cos': ['science', 'biology', 'chemistry', 'physics', 'mathematics', 'research'],
  'bagced': ['education', 'teaching', 'pedagogy', 'curriculum', 'learning'],
  'soe': ['economics', 'economic', 'policy', 'market', 'trade'],
  'tdsol': ['law', 'legal', 'justice', 'court', 'legislation', 'rights']
};

class FacebookScraper {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v23.0';

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
    console.log('Facebook Token exists:', !!this.accessToken);
    console.log('Token first 10 chars:', this.accessToken?.substring(0, 10));
    if (!this.accessToken) {
      throw new Error('Facebook Access Token not configured');
    }
  }

  async fetchPagePosts(pageId: string, limit = 10): Promise<FacebookPost[]> {
    try {
      const url = `${this.baseUrl}/${pageId}/posts?fields=id,message,story,created_time,permalink_url,from&limit=${limit}&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      const data: FacebookResponse = await response.json();
      
      if (!response.ok) {
        console.error(`Error fetching posts for ${pageId}:`, data);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch posts for ${pageId}:`, error);
      return [];
    }
  }

  determineCategory(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('academic') || lowerContent.includes('class') || lowerContent.includes('exam')) {
      return 'academics';
    }
    if (lowerContent.includes('event') || lowerContent.includes('activity') || lowerContent.includes('program')) {
      return 'campus-events';
    }
    if (lowerContent.includes('career') || lowerContent.includes('job') || lowerContent.includes('internship')) {
      return 'career-services';
    }
    if (lowerContent.includes('student') || lowerContent.includes('organization') || lowerContent.includes('club')) {
      return 'student-life';
    }
    
    return 'general-announcements';
  }

  determineRelevantInterests(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const relevantInterests: string[] = [];

    for (const [interest, keywords] of Object.entries(INTEREST_KEYWORDS)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        relevantInterests.push(interest);
      }
    }

    return relevantInterests;
  }

  determineRelevantDepartments(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const relevantDepartments: string[] = [];

    for (const [department, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        relevantDepartments.push(department);
      }
    }

    // If no specific department keywords found, make it relevant to all departments
    return relevantDepartments.length > 0 ? relevantDepartments : Object.keys(DEPARTMENT_KEYWORDS);
  }

  async scrapeAndStoreAnnouncements(): Promise<number> {
    let totalAnnouncements = 0;

    for (const [orgName, pageId] of Object.entries(ORGANIZATION_PAGES)) {
      try {
        console.log(`Fetching posts from ${orgName} (${pageId})...`);
        const posts = await this.fetchPagePosts(pageId, 5);

        for (const post of posts) {
          const content = post.message || post.story || '';
          if (!content) continue;

          // Create announcement from Facebook post
          const announcement = {
            title: `${orgName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
            content: content,
            date: new Date(post.created_time),
            category: this.determineCategory(content),
            relevantInterests: this.determineRelevantInterests(content),
            relevantMajors: this.determineRelevantDepartments(content)
          };

          await storage.createAnnouncement(announcement);
          totalAnnouncements++;
          console.log(`Created announcement from ${orgName}: ${announcement.title}`);
        }
      } catch (error) {
        console.error(`Error processing ${orgName}:`, error);
      }
    }

    console.log(`Total announcements created: ${totalAnnouncements}`);
    return totalAnnouncements;
  }
}

export { FacebookScraper };