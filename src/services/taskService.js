import { extractActionItems } from "./documentAnalysisService";
import { generateContentWithStore } from "./fileStoreService";

/**
 * Task Service
 * Extracts, manages, and prioritizes tasks from documents
 */

/**
 * Extract tasks from store documents
 * @param {string} storeName - Store name
 * @returns {Promise<Array>} Extracted tasks
 */
export const extractTasks = async (storeName) => {
  try {
    const actionItems = await extractActionItems(storeName);
    
    // Convert action items to tasks
    return actionItems.map((item, idx) => ({
      id: `task_${Date.now()}_${idx}`,
      description: typeof item === 'string' ? item : item.description || item,
      priority: typeof item === 'object' && item.priority ? item.priority : 'medium',
      dueDate: typeof item === 'object' && item.dueDate ? item.dueDate : null,
      assignee: typeof item === 'object' && item.assignee ? item.assignee : null,
      source: typeof item === 'object' && item.document ? item.document : null,
      status: typeof item === 'object' && item.status ? item.status : 'pending',
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    throw new Error(error.message || "Failed to extract tasks");
  }
};

/**
 * Calculate task priority using AI
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {Array} tasks - Tasks to prioritize
 * @returns {Promise<Array>} Tasks with calculated priorities
 */
export const calculateTaskPriorities = async (storeNames, tasks) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const tasksDescription = tasks.map(t => t.description).join('\n');
    
    const prompt = `Analyze the following tasks and assign priorities (high, medium, low) based on:
1. Urgency (due dates, deadlines)
2. Importance (impact on goals)
3. Dependencies (tasks that block others)
4. Context from the knowledge base

Tasks:
${tasksDescription}

Return a JSON array with: [{description, priority, reasoning}]`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const prioritiesText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let priorities;
    try {
      priorities = JSON.parse(prioritiesText);
      if (!Array.isArray(priorities)) {
        priorities = [priorities];
      }
    } catch {
      // Fallback: use existing priorities
      return tasks;
    }

    // Update tasks with new priorities
    return tasks.map(task => {
      const priorityData = priorities.find(p => 
        p.description && task.description.includes(p.description.substring(0, 20))
      );
      if (priorityData) {
        return {
          ...task,
          priority: priorityData.priority || task.priority,
          priorityReasoning: priorityData.reasoning,
        };
      }
      return task;
    });
  } catch (error) {
    console.error("Error calculating priorities:", error);
    return tasks; // Return original tasks on error
  }
};

/**
 * Generate workflow template based on document patterns
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {string} workflowType - Type of workflow (e.g., "meeting", "project", "document")
 * @returns {Promise<Object>} Workflow template
 */
export const generateWorkflowTemplate = async (storeNames, workflowType = "general") => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Based on documents in the knowledge base, generate a workflow template for: ${workflowType}

The template should include:
1. Steps/phases
2. Required resources or documents
3. Typical timeline
4. Key milestones
5. Common pitfalls to avoid

Format as JSON: {name, description, steps: [{name, description, order, estimatedTime}], resources, timeline, milestones, tips}`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const templateText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let template;
    try {
      template = JSON.parse(templateText);
    } catch {
      template = {
        name: `${workflowType} Workflow`,
        description: templateText,
        steps: [],
        resources: [],
        timeline: "Variable",
        milestones: [],
        tips: [],
      };
    }

    return template;
  } catch (error) {
    throw new Error(error.message || "Failed to generate workflow template");
  }
};

/**
 * Estimate time for tasks based on similar past work
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {Array} tasks - Tasks to estimate
 * @returns {Promise<Array>} Tasks with time estimates
 */
export const estimateTaskTime = async (storeNames, tasks) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const tasksDescription = tasks.map(t => t.description).join('\n');
    
    const prompt = `Based on similar work in the knowledge base, estimate time for these tasks:

Tasks:
${tasksDescription}

For each task, provide:
- Estimated hours
- Complexity level (simple, moderate, complex)
- Factors affecting time

Return JSON array: [{description, estimatedHours, complexity, factors}]`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const estimatesText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let estimates;
    try {
      estimates = JSON.parse(estimatesText);
      if (!Array.isArray(estimates)) {
        estimates = [estimates];
      }
    } catch {
      return tasks; // Return original tasks
    }

    // Add estimates to tasks
    return tasks.map(task => {
      const estimate = estimates.find(e => 
        e.description && task.description.includes(e.description.substring(0, 20))
      );
      if (estimate) {
        return {
          ...task,
          estimatedHours: estimate.estimatedHours,
          complexity: estimate.complexity,
          timeFactors: estimate.factors,
        };
      }
      return task;
    });
  } catch (error) {
    console.error("Error estimating time:", error);
    return tasks;
  }
};

/**
 * Recommend relevant documents for a task
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {string} taskDescription - Task description
 * @returns {Promise<Array>} Recommended documents
 */
export const recommendDocumentsForTask = async (storeNames, taskDescription) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Based on the knowledge base, recommend relevant documents for this task:

Task: ${taskDescription}

Provide:
- Document names/titles
- Why they're relevant
- Key information from each

Return JSON array: [{documentName, relevance, keyInfo}]`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const recommendationsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
      if (!Array.isArray(recommendations)) {
        recommendations = [recommendations];
      }
    } catch {
      recommendations = [];
    }

    return recommendations;
  } catch (error) {
    throw new Error(error.message || "Failed to recommend documents");
  }
};

