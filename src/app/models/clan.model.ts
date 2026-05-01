export interface Clan {
  id: string;
  name: string;
  description?: string | null;
  inviteCode?: string | null;
  ownerId?: string | null;
  ownerDisplayName?: string | null;
  membersCount?: number;
  createdAt?: string | null;
  joined?: boolean;
  notificationsEnabled?: boolean;
}

export interface ClanMember {
  id: string;
  userId: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  joinedAt?: string | null;
}

export interface ClanMessage {
  id: string;
  clanId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface CreateClanRequest {
  name: string;
  description: string;
}

export interface JoinClanRequest {
  inviteCode: string;
}

export interface UpdateClanNotificationsRequest {
  enabled: boolean;
}

export interface ClanActivityItem {
  id: string;
  userDisplayName: string;
  userProfileImageUrl: string | null;
  action: 'WATCHED' | 'RECOMMENDED' | 'RATED' | 'JOINED' | 'LEFT' | 'ADDED_TO_LIST';
  title: string | null;
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | 'MOVIE' | 'TV' | null;
  year: number | null;
  rating: number | null;
  posterUrl: string | null;
  listName: string | null;
  createdAt: string;
}

export interface ClanMessage {
  id: string;
  clanId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
}
