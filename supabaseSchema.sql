-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- --------------------------------------------------
-- Table Definitions
-- --------------------------------------------------

-- USERS TABLE
create table public."users" (
  "uid" uuid primary key,
  "email" text not null,
  "role" text not null default 'student' check ("role" in ('student', 'alumni', 'admin')),
  "displayName" text,
  "photoURL" text,
  "accountStatus" text not null default 'active',
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- STUDENT PROFILES
create table public."studentProfiles" (
  "uid" uuid primary key references public."users"("uid") on delete cascade,
  "fullName" text,
  "registerNo" text,
  "email" text,
  "college" text,
  "department" text,
  "year" text,
  "section" text,
  "phone" text,
  "skills" text[],
  "interests" text[],
  "bio" text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- ALUMNI PROFILES
create table public."alumniProfiles" (
  "uid" uuid primary key references public."users"("uid") on delete cascade,
  "fullName" text,
  "email" text,
  "college" text,
  "department" text,
  "graduationYear" text,
  "company" text,
  "jobRole" text,
  "location" text,
  "skills" text[],
  "experience" text,
  "linkedinUrl" text,
  "phone" text,
  "verificationStatus" text not null default 'pending',
  "bio" text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- CONNECTIONS
create table public."connections" (
  "id" uuid primary key default gen_random_uuid(),
  "senderId" uuid not null references public."users"("uid") on delete cascade,
  "receiverId" uuid not null references public."users"("uid") on delete cascade,
  "status" text not null default 'pending',
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now(),
  unique ("senderId", "receiverId")
);

-- MENTORSHIP REQUESTS
create table public."mentorshipRequests" (
  "id" uuid primary key default gen_random_uuid(),
  "studentId" uuid not null references public."users"("uid") on delete cascade,
  "alumniId" uuid not null references public."users"("uid") on delete cascade,
  "topic" text,
  "message" text,
  "preferredArea" text,
  "availability" text,
  "status" text not null default 'pending',
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- OPPORTUNITIES
create table public."opportunities" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "company" text not null,
  "type" text,
  "workMode" text,
  "location" text,
  "description" text,
  "skills" text[],
  "deadline" text,
  "externalLink" text,
  "postedBy" uuid references public."users"("uid") on delete set null,
  "postedByName" text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- SAVED OPPORTUNITIES
create table public."savedOpportunities" (
  "studentId" uuid not null references public."users"("uid") on delete cascade,
  "opportunityId" uuid not null references public."opportunities"("id") on delete cascade,
  "createdAt" timestamp with time zone default now(),
  primary key ("studentId", "opportunityId")
);

-- APPLIED OPPORTUNITIES
create table public."appliedOpportunities" (
  "studentId" uuid not null references public."users"("uid") on delete cascade,
  "opportunityId" uuid not null references public."opportunities"("id") on delete cascade,
  "appliedAt" timestamp with time zone default now(),
  "data" jsonb,
  primary key ("studentId", "opportunityId")
);

-- EVENTS
create table public."events" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "description" text,
  "type" text,
  "date" text,
  "time" text,
  "location" text,
  "meetingLink" text,
  "registrationLink" text,
  "organizer" text,
  "createdBy" uuid references public."users"("uid") on delete set null,
  "registrationCount" integer default 0,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- EVENT REGISTRATIONS
create table public."eventRegistrations" (
  "eventId" uuid not null references public."events"("id") on delete cascade,
  "userId" uuid not null references public."users"("uid") on delete cascade,
  "userName" text,
  "registeredAt" timestamp with time zone default now(),
  primary key ("eventId", "userId")
);

-- ANNOUNCEMENTS
create table public."announcements" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "content" text,
  "category" text,
  "targetAudience" text,
  "createdBy" uuid references public."users"("uid") on delete set null,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- NOTIFICATIONS
create table public."notifications" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public."users"("uid") on delete cascade,
  "type" text,
  "title" text,
  "message" text,
  "relatedId" text,
  "read" boolean default false,
  "createdAt" timestamp with time zone default now()
);

-- CONVERSATIONS
create table public."conversations" (
  "id" text primary key,
  "participants" uuid[],
  "participantNames" jsonb,
  "lastMessage" text,
  "lastMessageAt" timestamp with time zone default now(),
  "unreadCount" jsonb default '{}'::jsonb,
  "createdAt" timestamp with time zone default now()
);

-- MESSAGES
create table public."messages" (
  "id" uuid primary key default gen_random_uuid(),
  "conversationId" text not null references public."conversations"("id") on delete cascade,
  "senderId" uuid not null references public."users"("uid") on delete cascade,
  "receiverId" uuid not null references public."users"("uid") on delete cascade,
  "text" text not null,
  "read" boolean default false,
  "createdAt" timestamp with time zone default now()
);


-- --------------------------------------------------
-- Automatic Sync from auth.users (Supabase Auth)
-- --------------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."users" ("uid", "email", "displayName", "role", "accountStatus", "photoURL")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'displayName', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    'active',
    coalesce(new.raw_user_meta_data->>'photoURL', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- --------------------------------------------------
-- RLS Security Configuration & Policies
-- --------------------------------------------------

-- Enable Row Level Security (RLS) on all tables
alter table public."users" enable row level security;
alter table public."studentProfiles" enable row level security;
alter table public."alumniProfiles" enable row level security;
alter table public."connections" enable row level security;
alter table public."mentorshipRequests" enable row level security;
alter table public."opportunities" enable row level security;
alter table public."savedOpportunities" enable row level security;
alter table public."appliedOpportunities" enable row level security;
alter table public."events" enable row level security;
alter table public."eventRegistrations" enable row level security;
alter table public."announcements" enable row level security;
alter table public."notifications" enable row level security;
alter table public."conversations" enable row level security;
alter table public."messages" enable row level security;

-- Admin Helper Function (Security Definer to bypass users RLS recursion)
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public."users"
    where uid = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- 1. USERS POLICIES
create policy "Read access for authenticated users" on public."users" for select using (auth.role() = 'authenticated');
create policy "Insert access for own user record" on public."users" for insert with check (auth.uid() = uid);
create policy "Update access for self or admin" on public."users" for update using (auth.uid() = uid or public.is_admin());
create policy "Delete access for admin" on public."users" for delete using (public.is_admin());

-- 2. STUDENT PROFILES POLICIES
create policy "Read student profiles for authenticated users" on public."studentProfiles" for select using (auth.role() = 'authenticated');
create policy "Insert own student profile" on public."studentProfiles" for insert with check (auth.uid() = uid);
create policy "Update own student profile or admin" on public."studentProfiles" for update using (auth.uid() = uid or public.is_admin());
create policy "Delete student profile or admin" on public."studentProfiles" for delete using (auth.uid() = uid or public.is_admin());

-- 3. ALUMNI PROFILES POLICIES
create policy "Read alumni profiles (public/authenticated)" on public."alumniProfiles" for select using (true);
create policy "Insert own alumni profile" on public."alumniProfiles" for insert with check (auth.uid() = uid);
create policy "Update own alumni profile or admin" on public."alumniProfiles" for update using (auth.uid() = uid or public.is_admin());
create policy "Delete alumni profile or admin" on public."alumniProfiles" for delete using (auth.uid() = uid or public.is_admin());

-- 4. CONNECTIONS POLICIES
create policy "Read connections if involved or admin" on public."connections" for select using (auth.uid() = "senderId" or auth.uid() = "receiverId" or public.is_admin());
create policy "Create connection request" on public."connections" for insert with check (auth.uid() = "senderId");
create policy "Update connection if involved or admin" on public."connections" for update using (auth.uid() = "senderId" or auth.uid() = "receiverId" or public.is_admin());
create policy "Delete connection if involved or admin" on public."connections" for delete using (auth.uid() = "senderId" or auth.uid() = "receiverId" or public.is_admin());

-- 5. MENTORSHIP REQUESTS POLICIES
create policy "Read mentorships if involved or admin" on public."mentorshipRequests" for select using (auth.uid() = "studentId" or auth.uid() = "alumniId" or public.is_admin());
create policy "Create mentorship request as student" on public."mentorshipRequests" for insert with check (auth.uid() = "studentId");
create policy "Update mentorship request if involved or admin" on public."mentorshipRequests" for update using (auth.uid() = "studentId" or auth.uid() = "alumniId" or public.is_admin());
create policy "Delete mentorship requests for admin" on public."mentorshipRequests" for delete using (public.is_admin());

-- 6. OPPORTUNITIES POLICIES
create policy "Read opportunities (public/authenticated)" on public."opportunities" for select using (true);
create policy "Create opportunities for authenticated users" on public."opportunities" for insert with check (auth.role() = 'authenticated');
create policy "Update own opportunities or admin" on public."opportunities" for update using (auth.uid() = "postedBy" or public.is_admin());
create policy "Delete own opportunities or admin" on public."opportunities" for delete using (auth.uid() = "postedBy" or public.is_admin());

-- 7. SAVED OPPORTUNITIES POLICIES
create policy "Read own saved opportunities or admin" on public."savedOpportunities" for select using (auth.uid() = "studentId" or public.is_admin());
create policy "Save opportunities for self" on public."savedOpportunities" for insert with check (auth.uid() = "studentId");
create policy "Delete saved opportunity for self or admin" on public."savedOpportunities" for delete using (auth.uid() = "studentId" or public.is_admin());

-- 8. APPLIED OPPORTUNITIES POLICIES
create policy "Read own applications or admin" on public."appliedOpportunities" for select using (auth.uid() = "studentId" or public.is_admin());
create policy "Apply for opportunity as self" on public."appliedOpportunities" for insert with check (auth.uid() = "studentId");
create policy "Update applications for self or admin" on public."appliedOpportunities" for update using (auth.uid() = "studentId" or public.is_admin());
create policy "Delete application as admin" on public."appliedOpportunities" for delete using (public.is_admin());

-- 9. EVENTS POLICIES
create policy "Read events (public/authenticated)" on public."events" for select using (true);
create policy "Manage events for admin" on public."events" for all using (public.is_admin());

-- 10. EVENT REGISTRATIONS POLICIES
create policy "Read registrations for authenticated users" on public."eventRegistrations" for select using (auth.role() = 'authenticated');
create policy "Register for event as self" on public."eventRegistrations" for insert with check (auth.uid() = "userId");
create policy "Cancel registration as self or admin" on public."eventRegistrations" for delete using (auth.uid() = "userId" or public.is_admin());

-- 11. ANNOUNCEMENTS POLICIES
create policy "Read announcements (public/authenticated)" on public."announcements" for select using (true);
create policy "Manage announcements for admin" on public."announcements" for all using (public.is_admin());

-- 12. NOTIFICATIONS POLICIES
create policy "Read own notifications" on public."notifications" for select using (auth.uid() = "userId");
create policy "Create notification for any user" on public."notifications" for insert with check (auth.role() = 'authenticated');
create policy "Manage own notifications" on public."notifications" for update using (auth.uid() = "userId" or public.is_admin());
create policy "Delete notifications as owner or admin" on public."notifications" for delete using (auth.uid() = "userId" or public.is_admin());

-- 13. CONVERSATIONS POLICIES
create policy "Read conversations if participant or admin" on public."conversations" for select using (auth.uid() = any("participants") or public.is_admin());
create policy "Manage conversations if participant or admin" on public."conversations" for all using (auth.uid() = any("participants") or public.is_admin());

-- 14. MESSAGES POLICIES
create policy "Read messages if participant or admin" on public."messages" for select using (
  auth.uid() = "senderId" or auth.uid() = "receiverId" or public.is_admin()
);
create policy "Send message as self" on public."messages" for insert with check (auth.uid() = "senderId");
create policy "Update message details if sender or receiver" on public."messages" for update using (
  auth.uid() = "senderId" or auth.uid() = "receiverId"
);


-- --------------------------------------------------
-- Realtime Subscriptions Publication Setup
-- --------------------------------------------------

begin;
  -- Remove tables if already published to avoid unique index / duplicate registration issues
  -- (Safe for database rebuilds)
  alter publication supabase_realtime drop table if exists public."messages", public."conversations", public."notifications";

  -- Enable Realtime
  alter publication supabase_realtime add table public."messages";
  alter publication supabase_realtime add table public."conversations";
  alter publication supabase_realtime add table public."notifications";
commit;
