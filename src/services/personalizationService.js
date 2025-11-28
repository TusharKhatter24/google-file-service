/**
 * Personalization Service
 * Tracks user preferences, learns from interactions, and provides personalized recommendations
 */

const STORAGE_KEY = "ai_concierge_personalization";
const MAX_HISTORY = 1000; // Maximum items to store in history

/**
 * Get user preferences
 * @returns {Object} User preferences
 */
export const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading user preferences:", error);
  }
  
  return {
    writingStyle: {},
    topicPreferences: {},
    workPatterns: {},
    interactionHistory: [],
    customRecommendations: [],
    preferences: {
      notificationFrequency: "medium",
      suggestionLevel: "medium",
      autoAnalysis: true,
    },
  };
};

/**
 * Save user preferences
 * @param {Object} preferences - Preferences to save
 */
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
};

/**
 * Track user interaction
 * @param {string} type - Type of interaction (e.g., "summarize", "rewrite", "view_document")
 * @param {Object} data - Interaction data
 */
export const trackInteraction = (type, data = {}) => {
  const preferences = getUserPreferences();
  
  const interaction = {
    type,
    timestamp: Date.now(),
    data,
  };
  
  preferences.interactionHistory.push(interaction);
  
  // Limit history size
  if (preferences.interactionHistory.length > MAX_HISTORY) {
    preferences.interactionHistory = preferences.interactionHistory.slice(-MAX_HISTORY);
  }
  
  // Update patterns based on interaction
  updatePatternsFromInteraction(preferences, interaction);
  
  saveUserPreferences(preferences);
};

/**
 * Update patterns based on interaction
 * @param {Object} preferences - Current preferences
 * @param {Object} interaction - Interaction to learn from
 */
function updatePatternsFromInteraction(preferences, interaction) {
  const { type, data } = interaction;
  
  // Track writing style preferences
  if (type === "writing" && data.style) {
    if (!preferences.writingStyle[data.style]) {
      preferences.writingStyle[data.style] = 0;
    }
    preferences.writingStyle[data.style]++;
  }
  
  // Track topic preferences
  if (data.topics && Array.isArray(data.topics)) {
    data.topics.forEach(topic => {
      if (!preferences.topicPreferences[topic]) {
        preferences.topicPreferences[topic] = 0;
      }
      preferences.topicPreferences[topic]++;
    });
  }
  
  // Track work patterns
  const hour = new Date(interaction.timestamp).getHours();
  const dayOfWeek = new Date(interaction.timestamp).getDay();
  
  if (!preferences.workPatterns.activeHours) {
    preferences.workPatterns.activeHours = {};
  }
  if (!preferences.workPatterns.activeDays) {
    preferences.workPatterns.activeDays = {};
  }
  
  preferences.workPatterns.activeHours[hour] = (preferences.workPatterns.activeHours[hour] || 0) + 1;
  preferences.workPatterns.activeDays[dayOfWeek] = (preferences.workPatterns.activeDays[dayOfWeek] || 0) + 1;
}

/**
 * Get writing style profile
 * @returns {Object} Writing style profile
 */
export const getWritingStyleProfile = () => {
  const preferences = getUserPreferences();
  
  // Analyze writing style from history
  const styleCounts = preferences.writingStyle || {};
  const total = Object.values(styleCounts).reduce((sum, count) => sum + count, 0);
  
  const profile = {
    preferredStyles: Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([style]) => style),
    styleDistribution: Object.fromEntries(
      Object.entries(styleCounts).map(([style, count]) => [
        style,
        total > 0 ? (count / total) * 100 : 0,
      ])
    ),
    consistency: calculateConsistency(styleCounts),
  };
  
  return profile;
};

/**
 * Calculate writing style consistency
 * @param {Object} styleCounts - Style usage counts
 * @returns {string} Consistency level
 */
function calculateConsistency(styleCounts) {
  const counts = Object.values(styleCounts);
  if (counts.length === 0) return "unknown";
  
  const total = counts.reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...counts);
  const consistency = (maxCount / total) * 100;
  
  if (consistency >= 70) return "high";
  if (consistency >= 40) return "medium";
  return "low";
}

/**
 * Get topic preferences
 * @returns {Array} Top preferred topics
 */
export const getTopicPreferences = () => {
  const preferences = getUserPreferences();
  
  return Object.entries(preferences.topicPreferences || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));
};

/**
 * Get work patterns
 * @returns {Object} Work pattern analysis
 */
export const getWorkPatterns = () => {
  const preferences = getUserPreferences();
  
  const activeHours = preferences.workPatterns.activeHours || {};
  const activeDays = preferences.workPatterns.activeDays || {};
  
  // Find peak hours
  const peakHour = Object.entries(activeHours).reduce(
    (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour), count } : max),
    { hour: 9, count: 0 }
  );
  
  // Find most active day
  const peakDay = Object.entries(activeDays).reduce(
    (max, [day, count]) => (count > max.count ? { day: parseInt(day), count } : max),
    { day: 1, count: 0 }
  );
  
  return {
    peakHour: peakHour.hour,
    peakDay: peakDay.day,
    activeHours,
    activeDays,
    pattern: analyzeWorkPattern(activeHours, activeDays),
  };
};

/**
 * Analyze work pattern
 * @param {Object} activeHours - Hour activity data
 * @param {Object} activeDays - Day activity data
 * @returns {string} Pattern description
 */
function analyzeWorkPattern(activeHours, activeDays) {
  const hours = Object.keys(activeHours).map(Number);
  const avgHour = hours.length > 0 
    ? hours.reduce((sum, h) => sum + h, 0) / hours.length 
    : 12;
  
  if (avgHour >= 6 && avgHour < 12) return "morning_person";
  if (avgHour >= 12 && avgHour < 18) return "afternoon_person";
  if (avgHour >= 18 && avgHour < 22) return "evening_person";
  return "flexible";
}

/**
 * Get personalized recommendations
 * @param {string|Array<string>} storeNames - Store name(s) to analyze
 * @returns {Promise<Array>} Personalized recommendations
 */
export const getPersonalizedRecommendations = async (storeNames) => {
  const preferences = getUserPreferences();
  const styleProfile = getWritingStyleProfile();
  const topicPrefs = getTopicPreferences();
  const workPatterns = getWorkPatterns();
  
  // Build context from personalization data
  const context = {
    preferredStyles: styleProfile.preferredStyles,
    favoriteTopics: topicPrefs.map(t => t.topic),
    workPattern: workPatterns.pattern,
    peakHour: workPatterns.peakHour,
    recentInteractions: preferences.interactionHistory.slice(-10),
  };
  
  // This would integrate with concierge service
  // For now, return basic recommendations based on preferences
  const recommendations = [];
  
  // Style-based recommendations
  if (styleProfile.preferredStyles.length > 0) {
    recommendations.push({
      type: "writing_style",
      title: "Maintain Your Writing Style",
      description: `Based on your preferences, continue using ${styleProfile.preferredStyles[0]} style for consistency.`,
      priority: "medium",
      actionItems: [],
    });
  }
  
  // Topic-based recommendations
  if (topicPrefs.length > 0) {
    recommendations.push({
      type: "content",
      title: "Explore Related Topics",
      description: `You frequently work with topics like ${topicPrefs.slice(0, 3).map(t => t.topic).join(", ")}. Consider exploring related areas.`,
      priority: "low",
      actionItems: [],
    });
  }
  
  // Work pattern recommendations
  if (workPatterns.pattern !== "flexible") {
    const timeOfDay = workPatterns.pattern.replace("_person", "");
    recommendations.push({
      type: "workflow",
      title: "Optimize Your Schedule",
      description: `You're most active in the ${timeOfDay}. Schedule important writing tasks during this time.`,
      priority: "low",
      actionItems: [],
    });
  }
  
  return recommendations;
};

/**
 * Update user preferences
 * @param {Object} updates - Preference updates
 */
export const updatePreferences = (updates) => {
  const preferences = getUserPreferences();
  const updated = {
    ...preferences,
    preferences: {
      ...preferences.preferences,
      ...updates,
    },
  };
  saveUserPreferences(updated);
};

/**
 * Add custom recommendation
 * @param {Object} recommendation - Recommendation to add
 */
export const addCustomRecommendation = (recommendation) => {
  const preferences = getUserPreferences();
  if (!preferences.customRecommendations) {
    preferences.customRecommendations = [];
  }
  preferences.customRecommendations.push({
    ...recommendation,
    timestamp: Date.now(),
  });
  saveUserPreferences(preferences);
};

/**
 * Clear interaction history
 */
export const clearHistory = () => {
  const preferences = getUserPreferences();
  preferences.interactionHistory = [];
  saveUserPreferences(preferences);
};

/**
 * Get interaction statistics
 * @returns {Object} Interaction statistics
 */
export const getInteractionStats = () => {
  const preferences = getUserPreferences();
  const history = preferences.interactionHistory || [];
  
  const stats = {
    totalInteractions: history.length,
    interactionTypes: {},
    recentActivity: history.slice(-20),
    activityByDay: {},
    activityByHour: {},
  };
  
  // Count by type
  history.forEach(interaction => {
    const type = interaction.type;
    stats.interactionTypes[type] = (stats.interactionTypes[type] || 0) + 1;
    
    // Count by day
    const date = new Date(interaction.timestamp);
    const dayKey = date.toISOString().split('T')[0];
    stats.activityByDay[dayKey] = (stats.activityByDay[dayKey] || 0) + 1;
    
    // Count by hour
    const hour = date.getHours();
    stats.activityByHour[hour] = (stats.activityByHour[hour] || 0) + 1;
  });
  
  return stats;
};

