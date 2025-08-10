/**
 * Video API client
 * Base URL is derived from backendUri and prefixed with "video".
 */
import { GET, POST, DELETE } from "api/tools/fetch";
import { backendUri } from "api/tools/getCorrectUri";
import type {
  SearchVideoByKeywordResponseDto,
  GetPendingReviewVideoResponseDto,
  ApprovePendingReviewVideoRequestDto,
  ApprovePendingReviewVideoResponseDto,
  DeleteVideoByKvidRequestDto,
  DeleteVideoByKvidResponseDto,
} from "./VideoControllerDto";

/**
 * Base URI for video APIs
 */
const VIDEO_API_URI = `${backendUri}video`;

/**
 * Search videos by keyword
 * @param keyword - Keyword to search
 * @returns Response containing matching videos and total count
 */
export const searchVideoByKeyword = async (keyword: string): Promise<SearchVideoByKeywordResponseDto> => {
  return await GET(`${VIDEO_API_URI}/search?keyword=${encodeURIComponent(keyword)}`, { credentials: "include" }) as SearchVideoByKeywordResponseDto;
};

/**
 * Get videos pending review (admin only)
 * @param page - Page number (1-based)
 * @param pageSize - Page size
 * @returns Response containing pending videos and total count
 */
export const getPendingReviewVideo = async (page: number, pageSize: number): Promise<GetPendingReviewVideoResponseDto> => {
  return await GET(`${VIDEO_API_URI}/pending?page=${page}&pageSize=${pageSize}`, { credentials: "include" }) as GetPendingReviewVideoResponseDto;
};

/**
 * Approve a pending review video (admin only)
 * @param req - Request payload including target video ID
 * @returns Response indicating whether approval succeeded
 */
export const approvePendingReviewVideo = async (req: ApprovePendingReviewVideoRequestDto): Promise<ApprovePendingReviewVideoResponseDto> => {
  return await POST(`${VIDEO_API_URI}/pending/approved`, req, { credentials: "include" }) as ApprovePendingReviewVideoResponseDto;
};

/**
 * Delete a video by its KVID (admin only)
 * @param req - Request payload including target video ID
 * @returns Response indicating whether deletion succeeded
 */
export const deleteVideoByKvid = async (req: DeleteVideoByKvidRequestDto): Promise<DeleteVideoByKvidResponseDto> => {
  return await DELETE(`${VIDEO_API_URI}/delete`, req, { credentials: "include" }) as DeleteVideoByKvidResponseDto;
};
