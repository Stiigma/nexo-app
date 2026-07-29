export interface Giveaway {
  id: string;
  name: string;
  postId: string;
  prizeDescription: string;
  prizeValue: number;
  winnerDate: string;
  isActive: boolean;
  participantCount: number;
  commentCount: number;
  totalTickets: number;
}

export interface Comment {
  id: string;
  taggedUsername: string | null;
  followBonus: number;
  verifiedFollow: boolean;
  isValid: boolean;
  invalidReason: string | null;
}

export interface Participant {
  id: string;
  giveawayId: string;
  instagramUsername: string;
  storyShareBonus: number;
  verifiedStoryShare: boolean;
  totalTickets: number;
  isActive: boolean;
  evidenceTags: ParticipantPenalty[];
  comments: Comment[];
  tagCount: number;
}

export interface ParticipantPenalty {
  id: string;
  commentId: string | null;
  taggedUsername: string | null;
  reason: string;
  note: string;
  source: string;
  appliedAt: string;
  appliedBy: string;
}

export interface GiveawayDetail {
  giveaway: Giveaway;
  participants: Participant[];
}

export interface SyncResult {
  totalComments: number;
  validComments: number;
  invalidComments: number;
  participants: number;
  details: {
    noTag: number;
    multiTag: number;
    selfTag: number;
    duplicateTag: number;
  };
}

export interface UserGiveawayActivity {
  giveawayId: string;
  giveawayName: string;
  totalTickets: number;
  verifiedStoryShare: boolean;
  storyShareBonus: number;
  comments: Comment[];
}

export interface UserActivity {
  username: string;
  giveaways: UserGiveawayActivity[];
}

export interface VerifyFollowsResult {
  commenterInvalid: number;
  taggedFollowBonus: number;
  taggedNoFollow: number;
  alreadyVerified: number;
}
