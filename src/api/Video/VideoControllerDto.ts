/**
 * Response for searching videos by a keyword
 */
export type SearchVideoByKeywordResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
  /** Matched video list */
  result?: unknown[];
  /** Total count */
  count?: number;
};

/**
 * Response for fetching videos pending review (admin only)
 */
export type GetPendingReviewVideoResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
  /** Pending video list */
  result?: unknown[];
  /** Total count */
  count?: number;
};

/**
 * Request payload to approve a pending review video (admin only)
 */
export type ApprovePendingReviewVideoRequestDto = {
  /** Video ID */
  videoId: number | string;
};

/**
 * Response for approving a pending review video (admin only)
 */
export type ApprovePendingReviewVideoResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
};

/**
 * Request payload to delete a video by KVID (admin only)
 */
export type DeleteVideoByKvidRequestDto = {
  /** Video ID */
  videoId: number | string;
};

/**
 * Response for deleting a video by KVID (admin only)
 */
export type DeleteVideoByKvidResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
}; 