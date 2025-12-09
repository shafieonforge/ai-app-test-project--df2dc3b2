# Next.js + Supabase Template

This is a [Next.js](https://nextjs.org) project with [Supabase](https://supabase.com) integration, created by AI App Builder.

## Features

- 🔐 **Authentication** - Email/password auth with Supabase Auth
- 📦 **Database** - PostgreSQL database via Supabase
- ⚡ **Realtime** - Real-time subscriptions enabled
- 📁 **Storage** - File storage via Supabase Storage
- 🎨 **Styling** - Tailwind CSS for styling

## Getting Started

### Prerequisites

Make sure the local Supabase instance is running. From the AI App Builder root directory:

```bash
# Start local Supabase
docker-compose -f docker-compose.supabase.yml up -d
```

### Development

1. Install dependencies:

```bash
npm install
```

2. The environment variables are already configured for local development in `.env.local`.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Local Supabase URLs

- **API**: http://localhost:8000
- **Studio (Dashboard)**: http://localhost:3100
- **Inbucket (Email testing)**: http://localhost:9000

## Supabase Client Usage

### Client-side (React Components)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*')

// Auth
const { data: { user } } = await supabase.auth.getUser()
```

### Server-side (Server Components, Route Handlers)

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

// Fetch data (runs on server)
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

## Database Schema

Access Supabase Studio at http://localhost:3100 to:
- Create tables
- Define relationships
- Set up Row Level Security (RLS)
- Manage users

## Production Deployment

For production, update `.env.local` with your Supabase Cloud credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
