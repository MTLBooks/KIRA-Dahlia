export type SearchVideoByKeywordResponseDto = {
  success: boolean;
  message?: string;
  result?: unknown[];
  count?: number;
};

export type GetPendingReviewVideoResponseDto = {
  success: boolean;
  message?: string;
  result?: unknown[];
  count?: number;
};

export type ApprovePendingReviewVideoRequestDto = {
  videoId: number | string;
};

export type ApprovePendingReviewVideoResponseDto = {
  success: boolean;
  message?: string;
};

export type DeleteVideoByKvidRequestDto = {
  videoId: number | string;
};

export type DeleteVideoByKvidResponseDto = {
  success: boolean;
  message?: string;
}; 