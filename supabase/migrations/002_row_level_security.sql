-- Enable Row Level Security on all tables
alter table public.campaigns enable row level security;
alter table public.characters enable row level security;
alter table public.sessions enable row level security;
alter table public.npcs enable row level security;
alter table public.locations enable row level security;
alter table public.ai_content enable row level security;

-- Campaigns RLS Policies
create policy "Users can view campaigns they are DM of or have characters in" on public.campaigns
    for select using (
        dm_user_id = auth.uid() or 
        id in (
            select campaign_id from public.characters 
            where player_user_id = auth.uid()
        )
    );

create policy "Users can create campaigns" on public.campaigns
    for insert with check (dm_user_id = auth.uid());

create policy "DMs can update their campaigns" on public.campaigns
    for update using (dm_user_id = auth.uid());

create policy "DMs can delete their campaigns" on public.campaigns
    for delete using (dm_user_id = auth.uid());

-- Characters RLS Policies
create policy "Users can view characters in campaigns they participate in" on public.characters
    for select using (
        player_user_id = auth.uid() or
        campaign_id in (
            select id from public.campaigns where dm_user_id = auth.uid()
        )
    );

create policy "Users can create characters in campaigns they can access" on public.characters
    for insert with check (
        player_user_id = auth.uid() and
        campaign_id in (
            select id from public.campaigns 
            where dm_user_id = auth.uid() or id in (
                select campaign_id from public.characters 
                where player_user_id = auth.uid()
            )
        )
    );

create policy "Players can update their own characters" on public.characters
    for update using (player_user_id = auth.uid());

create policy "Players can delete their own characters" on public.characters
    for delete using (player_user_id = auth.uid());

-- Sessions RLS Policies
create policy "Users can view sessions in campaigns they participate in" on public.sessions
    for select using (
        campaign_id in (
            select id from public.campaigns 
            where dm_user_id = auth.uid() or id in (
                select campaign_id from public.characters 
                where player_user_id = auth.uid()
            )
        )
    );

create policy "DMs can manage sessions in their campaigns" on public.sessions
    for all using (
        campaign_id in (
            select id from public.campaigns where dm_user_id = auth.uid()
        )
    );

-- NPCs RLS Policies
create policy "Users can view NPCs in campaigns they participate in" on public.npcs
    for select using (
        campaign_id in (
            select id from public.campaigns 
            where dm_user_id = auth.uid() or id in (
                select campaign_id from public.characters 
                where player_user_id = auth.uid()
            )
        )
    );

create policy "DMs can manage NPCs in their campaigns" on public.npcs
    for all using (
        campaign_id in (
            select id from public.campaigns where dm_user_id = auth.uid()
        )
    );

-- Locations RLS Policies
create policy "Users can view locations in campaigns they participate in" on public.locations
    for select using (
        campaign_id in (
            select id from public.campaigns 
            where dm_user_id = auth.uid() or id in (
                select campaign_id from public.characters 
                where player_user_id = auth.uid()
            )
        )
    );

create policy "DMs can manage locations in their campaigns" on public.locations
    for all using (
        campaign_id in (
            select id from public.campaigns where dm_user_id = auth.uid()
        )
    );

-- AI Content RLS Policies
create policy "Users can view AI content in campaigns they participate in" on public.ai_content
    for select using (
        campaign_id in (
            select id from public.campaigns 
            where dm_user_id = auth.uid() or id in (
                select campaign_id from public.characters 
                where player_user_id = auth.uid()
            )
        )
    );

create policy "DMs can manage AI content in their campaigns" on public.ai_content
    for all using (
        campaign_id in (
            select id from public.campaigns where dm_user_id = auth.uid()
        )
    );