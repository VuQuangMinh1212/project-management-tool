# TaskFlow - Project Management Tool

A modern, full-featured project and task management application built with Next.js, TypeScript, and TailwindCSS.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Staff, Manager, Admin)
- Secure token management with refresh tokens
- Protected routes with middleware

### 📋 Task Management

- Kanban-style task board with drag & drop
- Task creation, editing, and deletion
- **Bulk task creation** - Create multiple tasks for the same week at once
- **Smart filtering** - Filter tasks by status with dynamic tab hiding and column hiding
- **Advanced filtering** - Multi-select status, priority, and other criteria with visual filter indicators
- Status tracking (Draft, Pending Approval, Todo, In Progress, Done, Blocked)
- Priority levels (Low, Medium, High, Urgent)
- **Start dates** and time tracking
- Comments and attachments
- Real-time updates via Socket.io
- **Week-based planning** - Plan tasks up to 8 weeks ahead
- **Draft workflow** - Save tasks as drafts and submit in batches

### 👥 Team Management

- Team member profiles and management
- Role assignment and permissions
- Performance tracking and analytics
- Team collaboration features

### 📊 Analytics & Reporting

- Task completion analytics
- Team performance metrics
- Project progress tracking
- Customizable reports and charts

### 🔄 Real-time Features

- Live task updates
- Real-time notifications
- Collaborative editing
- Socket.io integration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.io
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd project-management-tool
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

   # or

   yarn install

   # or

   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

   Update the environment variables in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   CUSTOM_KEY=your-custom-key-here
   \`\`\`

4. **Install shadcn/ui components**
   \`\`\`bash
   npx shadcn@latest init
   npx shadcn@latest add button card input label textarea
   npx shadcn@latest add dropdown-menu dialog sheet
   npx shadcn@latest add table badge avatar
   npx shadcn@latest add select checkbox radio-group
   npx shadcn@latest add toast tabs separator
   npx shadcn@latest add skeleton alert-dialog
   npx shadcn@latest add calendar popover progress
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev

   # or

   yarn dev

   # or

   pnpm dev

   # For network access (other devices on same network)

   pnpm run dev:network
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Network Access

To access the application from other devices on the same network:

1. **Start with network access:**
   \`\`\`bash
   pnpm run dev:network
   \`\`\`

2. **Find your IP address:**
   \`\`\`bash
   ipconfig
   \`\`\`

3. **Access from other devices:**
   Open `http://YOUR_IP_ADDRESS:3000` on any device connected to the same network

## Project Structure

\`\`\`
src/
├── app/ # Next.js App Router pages
│ ├── (auth)/ # Authentication pages
│ ├── (protected)/ # Protected routes
│ │ ├── staff/ # Staff-specific pages
│ │ └── manager/ # Manager-specific pages
│ ├── api/ # API routes
│ └── globals.css # Global styles
├── components/ # Reusable components
│ ├── auth/ # Authentication components
│ ├── staff/ # Staff-specific components
│ ├── manager/ # Manager-specific components
│ └── shared/ # Shared components
├── hooks/ # Custom React hooks
├── lib/ # Utility functions
├── services/ # API services
├── types/ # TypeScript definitions
├── constants/ # App constants
└── mock/ # Mock data for development
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Authentication

The app supports role-based authentication with three user types:

### Staff Users

- Access to personal dashboard
- Task management (create, edit, update status)
- Profile management
- Real-time notifications

### Manager Users

- All staff permissions
- Team management
- Analytics and reporting
- Approval workflows
- Team performance tracking

### Demo Accounts

For testing purposes, you can use these demo accounts:

**Staff Account:**

- Username: staff
- Password: 123

**Manager Account:**

- Username: manager
- Password: 123

## API Integration

The frontend is designed to work with a REST API backend. Key endpoints include:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/tasks` - Fetch tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `GET /api/users` - Fetch users
- `GET /api/reports` - Fetch reports

## Real-time Features

Socket.io is used for real-time features:

- Task updates
- Comments and notifications
- Team collaboration
- Live status changes

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourcompany.com or create an issue in the repository.
