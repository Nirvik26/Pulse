import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const systemPrompt = `You are Pulse AI, a helpful and friendly assistant for the Pulse project management platform.

Your capabilities:
- Help users create and manage projects
- Assist with task organization and prioritization
- Answer questions about platform features
- Provide productivity tips and best practices
- Help with project management workflows

Platform features:
- Projects: Create, edit, delete projects with custom colors
- Tasks: Kanban board with drag-and-drop (To Do, In Progress, Done)
- Task priorities: Low, Medium, High
- Due dates and calendar view
- Activity tracking and notifications
- Dark/light mode
- Settings and profile management

Key pages:
- Dashboard: Overview with charts and stats
- Projects: /dashboard/projects - View all projects
- Calendar: /dashboard/calendar - Calendar view of tasks
- Activity: /dashboard/activity - Activity feed
- Settings: /dashboard/settings - User preferences

Keyboard tips:
- Tasks can be dragged between columns in the kanban board
- Click on project cards to view details

Be concise, helpful, and friendly. Use emojis occasionally to be engaging.`;

const responses: Record<string, string> = {
  "how do i create a project":
    "Creating a project is easy! 🚀\n\n1. Click the **+ New Project** button on the dashboard\n2. Enter a project name and description\n3. Choose a color to identify your project\n4. Click **Create Project**\n\nYour new project will appear in the sidebar and on the dashboard!",
  
  "what features are available":
    "Pulse offers powerful project management features! ✨\n\n• **Projects** - Organize work into separate projects\n• **Kanban Board** - Drag & drop tasks between columns\n• **Task Priorities** - Set Low, Medium, or High priority\n• **Due Dates** - Track deadlines with calendar view\n• **Activity Log** - See all changes in real-time\n• **Notifications** - Stay updated on important events\n• **Dark Mode** - Easy on the eyes\n• **Settings** - Customize your experience",
  
  "help me organize my tasks":
    "Here are some tips for organizing tasks effectively! 📋\n\n1. **Use the Kanban Board** - Drag tasks from To Do → In Progress → Done\n2. **Set Priorities** - Mark urgent tasks as High priority\n3. **Add Due Dates** - See deadlines in the Calendar view\n4. **Break Down Work** - Create smaller, manageable tasks\n5. **Review Regularly** - Check your Activity feed for updates",
  
  "show me keyboard shortcuts":
    "Here are some helpful tips! ⌨️\n\n• **Drag & Drop** - Move tasks between columns by dragging\n• **Click Projects** - Click any project card to open it\n• **Search** - Use the search bar in the header\n• **Theme Toggle** - Click the sun/moon icon for dark mode\n• **Notifications** - Bell icon shows unread count",
  
  hello: "Hello! 👋 I'm Pulse AI, your project management assistant. How can I help you today?",
  
  hi: "Hi there! 👋 Great to see you! What can I help you with today?",
  
  thanks: "You're welcome! 😊 Let me know if you need anything else!",
  
  "thank you": "Happy to help! 🌟 Feel free to ask more questions anytime!",
};

function findBestMatch(input: string): string {
  const lowerInput = input.toLowerCase().trim();
  
  // Direct match
  for (const [key, value] of Object.entries(responses)) {
    if (lowerInput.includes(key)) {
      return value;
    }
  }
  
  // Keyword matching
  if (lowerInput.includes("create") || lowerInput.includes("new") || lowerInput.includes("add")) {
    if (lowerInput.includes("project")) {
      return responses["how do i create a project"];
    }
    if (lowerInput.includes("task")) {
      return "To add a task:\n\n1. Open a project by clicking on it\n2. Click **+ New Task** button\n3. Enter title, description, priority, and due date\n4. Click **Create Task**\n\nThe task will appear in the 'To Do' column. You can then drag it to 'In Progress' or 'Done' as you work! 📝";
    }
  }
  
  if (lowerInput.includes("feature") || lowerInput.includes("what can") || lowerInput.includes("capabilities")) {
    return responses["what features are available"];
  }
  
  if (lowerInput.includes("organize") || lowerInput.includes("manage") || lowerInput.includes("help")) {
    return responses["help me organize my tasks"];
  }
  
  if (lowerInput.includes("delete") || lowerInput.includes("remove")) {
    return "To delete items:\n\n• **Projects**: Click the ⋮ menu on a project card → Delete\n• **Tasks**: Click the trash icon on any task\n\n⚠️ Note: Deleting a project will also delete all its tasks. Be careful!";
  }
  
  if (lowerInput.includes("dark") || lowerInput.includes("theme") || lowerInput.includes("mode")) {
    return "To toggle dark mode:\n\n1. Look for the 🌙/☀️ icon in the header\n2. Click it to switch between light and dark themes\n\nYou can also change it in Settings → Appearance! 🌙";
  }
  
  if (lowerInput.includes("calendar") || lowerInput.includes("date") || lowerInput.includes("deadline")) {
    return "The Calendar view shows all your tasks by due date! 📅\n\n• Navigate to **Calendar** in the sidebar\n• See tasks scheduled for each day\n• Click on tasks to navigate to their project\n• Upcoming tasks are listed below the calendar";
  }
  
  if (lowerInput.includes("notification") || lowerInput.includes("alert")) {
    return "Notifications keep you updated! 🔔\n\n• Click the bell icon in the header\n• Unread count shows on the icon\n• Mark notifications as read\n• View all in the Notifications page\n\nYou'll get notifications when projects are created and other important events!";
  }
  
  if (lowerInput.includes("priority") || lowerInput.includes("important")) {
    return "Task priorities help you focus! 🎯\n\n• **High** - Urgent, needs immediate attention (red)\n• **Medium** - Important but not urgent (yellow)\n• **Low** - Nice to have (green)\n\nSet priority when creating or editing a task. Filter tasks by priority in the kanban board!";
  }
  
  if (lowerInput.includes("setting") || lowerInput.includes("profile") || lowerInput.includes("account")) {
    return "Manage your account in Settings! ⚙️\n\n• **Profile** - Update name and email\n• **Appearance** - Toggle dark mode\n• **Notifications** - Configure alerts\n• **Security** - Change password, 2FA\n\nGo to Settings in the sidebar to access these options!";
  }
  
  if (lowerInput.includes("drag") || lowerInput.includes("move") || lowerInput.includes("kanban")) {
    return "The Kanban board supports drag & drop! 🎯\n\n• Grab a task by its grip icon (⋮⋮)\n• Drag it to another column\n• Drop to change status:\n  - To Do → In Progress → Done\n\nChanges save automatically!";
  }
  
  if (lowerInput.includes("chart") || lowerInput.includes("analytics") || lowerInput.includes("stats")) {
    return "The Dashboard shows your analytics! 📊\n\n• **Task Status** - Pie chart of task distribution\n• **Priority Distribution** - Bar chart by priority\n• **Project Progress** - Completion percentage\n• **Stats Cards** - Quick metrics overview\n\nThese update in real-time as you work!";
  }
  
  // Default responses
  const defaults = [
    "I'd be happy to help! Could you tell me more about what you're trying to do? 🤔",
    "Interesting question! I can help with projects, tasks, and platform features. What specifically would you like to know? 💡",
    "I'm here to help you get the most out of Pulse! Try asking about creating projects, managing tasks, or platform features. 🚀",
    "Let me help you with that! Can you provide more details about what you need? 😊",
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const body = await req.json();
    const { messages } = body;
    
    const userMessage = messages[messages.length - 1];
    
    if (userMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Get user's projects for context-aware responses
    let projectContext = "";
    if (session?.user?.id) {
      try {
        const projects = await prisma.project.findMany({
          where: { userId: session.user.id },
          select: { name: true, _count: { select: { tasks: true } } },
          take: 5,
        });
        
        if (projects.length > 0) {
          projectContext = `\nUser's projects: ${projects.map(p => `${p.name} (${p._count.tasks} tasks)`).join(", ")}`;
        }
      } catch (e) {
        // Ignore database errors
      }
    }

    // Generate response
    let response = findBestMatch(userMessage.content);
    
    // Add project context if relevant
    if (projectContext && (userMessage.content.toLowerCase().includes("my project") || 
        userMessage.content.toLowerCase().includes("projects"))) {
      response += `\n\n📊 Your current projects:${projectContext.replace("\nUser's projects:", "")}`;
    }

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { message: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
