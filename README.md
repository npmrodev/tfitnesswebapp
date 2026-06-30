# T-FITNESS Gym Management System

A professional, production-ready gym management web application built with Next.js 16, PostgreSQL (Neon), Better Auth, and Drizzle ORM.

## Features

- **User Roles**: Owner, Staff, and Member with role-based access control
- **Member Management**: Create, update, and manage member profiles
- **Membership System**: Multiple membership types (Monthly, Quarterly, Semi-Annual, Annual, Per-Session, Guest Pass)
- **Payment Tracking**: Cash-based payment system with admin approval workflow
- **Check-in System**: QR code and manual check-in options for members
- **Dashboard**: Real-time statistics and activity tracking
- **Reports**: Export transaction and attendance reports to PDF
- **Audit Logs**: Complete activity logging for compliance and security
- **Settings**: Manage gym information and pricing configurations
- **Responsive Design**: Fully responsive UI that works on all devices
- **Premium UI**: Clean, professional design with sharp-edged elements (no rounded corners)

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS v4
- **Backend**: Next.js Server Actions, Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Additional Libraries**:
  - lucide-react: Icons
  - jsPDF & html2canvas: PDF export
  - qrcode.react: QR code generation
  - react-simple-maps: Map visualization

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database
- Better Auth secret key

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`:
```
DATABASE_URL=your_neon_connection_string
BETTER_AUTH_SECRET=your_generated_secret
BETTER_AUTH_URL=http://localhost:3000
```

Generate BETTER_AUTH_SECRET using:
```bash
openssl rand -base64 32
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Application Structure

```
app/
├── api/auth/[...all]/       # Better Auth handler
├── sign-in/                  # Login page
├── sign-up/                  # Sign-up page (disabled for production)
├── dashboard/                # Main dashboard
├── members/                  # Member management
├── memberships/              # Membership management
├── checkin/                  # Check-in interface
├── reports/                  # Reports and exports
├── settings/                 # Gym settings
└── audit-logs/               # Activity logs (owner only)

components/
├── sidebar.tsx              # Navigation sidebar
├── auth-form.tsx            # Authentication form
├── dashboard-metrics.tsx    # Dashboard metrics
├── members-management.tsx   # Member management UI
├── member-dialog.tsx        # Member edit/create dialog
└── recent-activity.tsx      # Activity display

lib/
├── auth.ts                  # Better Auth config
├── auth-client.ts           # Better Auth client
├── db/
│   ├── index.ts            # Drizzle client setup
│   └── schema.ts           # Database schema

app/actions/
├── members.ts              # Member operations
├── memberships.ts          # Membership operations
├── checkins.ts             # Check-in operations
├── payments.ts             # Payment operations
├── audits.ts               # Audit log operations
└── setup.ts                # System setup
```

## Database Schema

### Core Tables
- **user**: Better Auth users
- **session**: User sessions
- **account**: Account information
- **verification**: Email verification

### Gym Tables
- **user_roles**: User role assignments (owner, staff, member)
- **members**: Member profiles
- **memberships**: Member memberships with pricing and dates
- **check_ins**: Daily check-in records
- **payments**: Payment records with status tracking
- **gym_settings**: Gym information and pricing
- **audit_logs**: Complete activity audit trail

## Key Features

### 1. Member Management
- Add new members with detailed profiles
- Update member information
- Track membership status
- View member check-in history
- Monitor payment status

### 2. Membership System
- Monthly subscriptions ($50)
- Quarterly packages ($130)
- Semi-annual plans ($240)
- Annual memberships ($450)
- Per-session passes ($15)
- Guest passes ($20)
- 1-week and 2-week pass options

### 3. Payment Processing
- Record cash payments
- Approve/reject payments
- Track payment status
- Payment approval workflow
- Payment history tracking

### 4. Check-In System
- QR code generation for members
- Manual check-in option
- Check-in history tracking
- Today's check-in statistics
- Attendance reports

### 5. Reporting & Analytics
- Daily transactions report
- Weekly transactions report
- Monthly transactions report
- Member payment history
- Attendance history
- Custom date range reports
- PDF export functionality

### 6. Audit Logs
- Login/logout tracking
- Account creation logs
- Member updates
- Membership changes
- Payment records
- Check-in logs
- Settings changes
- PDF export tracking

### 7. Settings
- Gym name and contact info
- Address management
- Membership pricing configuration
- Operating hours
- Policies and settings

## Security Features

- Email + password authentication via Better Auth
- Role-based access control (RBAC)
- Session management with automatic timeout
- Protected API routes and server actions
- Activity audit logging
- SQL injection prevention via Drizzle ORM
- Password validation requirements

## Design System

### Color Palette
- **Primary**: Black (#1a1a1a)
- **Secondary**: Light Gray (#f0f0f0)
- **Background**: Off-White (#f8f8f8)
- **Border**: Light Gray (#e0e0e0)
- **Text**: Dark Gray (#1a1a1a)

### Typography
- **Sans Font**: Geist (system font)
- **Mono Font**: Geist Mono (for code)

### Components
- Sharp-edged buttons (no rounded corners)
- Clean card layouts
- Professional spacing
- Accessible form controls
- Responsive grid system

## Performance Optimizations

- Next.js 16 with Turbopack (3x faster builds)
- Server-side rendering for optimal performance
- Automatic code splitting
- Image optimization
- CSS-in-JS with Tailwind v4
- Minimal external dependencies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with one click

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Heroku / Other Platforms
1. Set NODE_ENV=production
2. Set DATABASE_URL and BETTER_AUTH_SECRET
3. Run `pnpm build && pnpm start`

## API Routes

### Authentication
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/sign-in` - Sign in user
- `POST /api/auth/sign-out` - Sign out user
- `GET /api/auth/session` - Get current session

### Protected Routes
All other routes require authentication and appropriate role permissions.

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check firewall/network settings
- Ensure Neon project is active

### Authentication Issues
- Verify BETTER_AUTH_SECRET is set
- Check session cookie settings
- Clear browser cache and cookies

### 404 Errors
- Ensure you're logged in for protected routes
- Check role-based access permissions
- Verify route names match exactly

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved to T-FITNESS

## Support

For issues and support, please contact: support@tfitness.com

## Changelog

### v1.0.0 (Initial Release)
- Core gym management features
- User authentication and authorization
- Member management system
- Membership tracking
- Payment processing
- Check-in system
- Reporting and exports
- Audit logging
- Settings management
- Responsive design
- Professional UI/UX

---

**Last Updated**: June 30, 2026
**Version**: 1.0.0
**Status**: Production Ready
