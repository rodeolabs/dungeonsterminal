-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable Row Level Security
alter default privileges revoke execute on functions from public;

-- Campaigns table
create table public.campaigns (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    description text,
    setting_info jsonb default '{}',
    dm_user_id uuid references auth.users(id) on delete cascade,
    status varchar(50) default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
    max_players integer default 6 check (max_players > 0 and max_players <= 12),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Characters table
create table public.characters (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null,
    class varchar(50) not null,
    race varchar(50) not null,
    level integer default 1 check (level >= 1 and level <= 20),
    stats jsonb not null default '{"strength": 10, "dexterity": 10, "constitution": 10, "intelligence": 10, "wisdom": 10, "charisma": 10}',
    background text,
    equipment jsonb default '[]',
    spells jsonb default '[]',
    backstory text,
    campaign_id uuid references public.campaigns(id) on delete cascade,
    player_user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions table
create table public.sessions (
    id uuid default uuid_generate_v4() primary key,
    campaign_id uuid references public.campaigns(id) on delete cascade,
    session_number integer not null,
    title varchar(255),
    summary text,
    notes text,
    narrative_log jsonb default '[]',
    combat_encounters jsonb default '[]',
    npc_interactions jsonb default '[]',
    treasure_found jsonb default '[]',
    experience_gained integer default 0,
    session_date timestamp with time zone,
    duration_minutes integer,
    status varchar(50) default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NPCs table
create table public.npcs (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null,
    race varchar(50),
    class varchar(50),
    level integer check (level >= 1 and level <= 20),
    stats jsonb default '{"strength": 10, "dexterity": 10, "constitution": 10, "intelligence": 10, "wisdom": 10, "charisma": 10}',
    personality_traits text,
    background text,
    relationship_to_party varchar(100),
    campaign_id uuid references public.campaigns(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- World locations table
create table public.locations (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    type varchar(100) not null,
    description text,
    geography jsonb default '{}',
    notable_features jsonb default '[]',
    inhabitants jsonb default '[]',
    campaign_id uuid references public.campaigns(id) on delete cascade,
    parent_location_id uuid references public.locations(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI generated content table
create table public.ai_content (
    id uuid default uuid_generate_v4() primary key,
    content_type varchar(100) not null check (content_type in ('narrative', 'npc_dialogue', 'description', 'encounter', 'treasure', 'quest')),
    prompt text not null,
    generated_content text not null,
    metadata jsonb default '{}',
    campaign_id uuid references public.campaigns(id) on delete cascade,
    session_id uuid references public.sessions(id) on delete cascade,
    quality_rating integer check (quality_rating >= 1 and quality_rating <= 5),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create unique constraints
create unique index campaigns_dm_title_unique on public.campaigns (dm_user_id, title);
create unique index characters_campaign_name_unique on public.characters (campaign_id, name);
create unique index sessions_campaign_number_unique on public.sessions (campaign_id, session_number);

-- Create indexes for performance
create index idx_campaigns_dm_user_id on public.campaigns (dm_user_id);
create index idx_characters_campaign_id on public.characters (campaign_id);
create index idx_characters_player_user_id on public.characters (player_user_id);
create index idx_sessions_campaign_id on public.sessions (campaign_id);
create index idx_npcs_campaign_id on public.npcs (campaign_id);
create index idx_locations_campaign_id on public.locations (campaign_id);
create index idx_locations_parent_id on public.locations (parent_location_id);
create index idx_ai_content_campaign_id on public.ai_content (campaign_id);
create index idx_ai_content_session_id on public.ai_content (session_id);
create index idx_ai_content_type on public.ai_content (content_type);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_campaigns_updated_at before update on public.campaigns
    for each row execute procedure update_updated_at_column();

create trigger update_characters_updated_at before update on public.characters
    for each row execute procedure update_updated_at_column();

create trigger update_sessions_updated_at before update on public.sessions
    for each row execute procedure update_updated_at_column();

create trigger update_npcs_updated_at before update on public.npcs
    for each row execute procedure update_updated_at_column();

create trigger update_locations_updated_at before update on public.locations
    for each row execute procedure update_updated_at_column();