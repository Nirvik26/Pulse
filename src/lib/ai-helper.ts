export interface TaskPrediction {
  suggestedPriority: "high" | "medium" | "low";
  suggestedTags: string[];
  estimatedHours: number;
  urgencyReason: string;
}

export function predictTaskAttributes(title: string, description: string = ""): TaskPrediction {
  const text = `${title} ${description}`.toLowerCase();

  // High priority keywords
  const isHighPriority =
    text.includes("urgent") ||
    text.includes("critical") ||
    text.includes("security") ||
    text.includes("leak") ||
    text.includes("vulnerability") ||
    text.includes("crash") ||
    text.includes("blocker") ||
    text.includes("payment") ||
    text.includes("auth") ||
    text.includes("deploy");

  // Low priority keywords
  const isLowPriority =
    text.includes("nice to have") ||
    text.includes("cleanup") ||
    text.includes("typo") ||
    text.includes("docs") ||
    text.includes("comment") ||
    text.includes("minor");

  let suggestedPriority: "high" | "medium" | "low" = "medium";
  let urgencyReason = "Standard sprint objective";

  if (isHighPriority) {
    suggestedPriority = "high";
    urgencyReason = "High impact on system reliability or security";
  } else if (isLowPriority) {
    suggestedPriority = "low";
    urgencyReason = "Maintenance / backlog refinement";
  }

  // Tags prediction
  const tags: string[] = [];
  if (text.includes("api") || text.includes("db") || text.includes("backend") || text.includes("prisma") || text.includes("sql") || text.includes("auth")) {
    tags.push("Backend");
  }
  if (text.includes("ui") || text.includes("css") || text.includes("modal") || text.includes("component") || text.includes("frontend") || text.includes("react")) {
    tags.push("Frontend");
  }
  if (text.includes("fix") || text.includes("bug") || text.includes("error") || text.includes("issue")) {
    tags.push("Bugfix");
  }
  if (text.includes("docker") || text.includes("ci") || text.includes("cd") || text.includes("aws") || text.includes("deploy") || text.includes("infra")) {
    tags.push("DevOps");
  }
  if (text.includes("design") || text.includes("theme") || text.includes("icon") || text.includes("layout")) {
    tags.push("Design");
  }
  if (text.includes("ai") || text.includes("copilot") || text.includes("prompt") || text.includes("model")) {
    tags.push("AI / ML");
  }

  if (tags.length === 0) {
    tags.push("Feature");
  }

  // Estimated hours calculation
  let estimatedHours = 3;
  if (suggestedPriority === "high") estimatedHours = 5;
  if (suggestedPriority === "low") estimatedHours = 1.5;
  if (text.length > 80) estimatedHours += 2;

  return {
    suggestedPriority,
    suggestedTags: tags.slice(0, 3),
    estimatedHours,
    urgencyReason,
  };
}
