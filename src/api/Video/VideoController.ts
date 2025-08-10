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

const VIDEO_API_URI = `${backendUri}video`;

export const searchVideoByKeyword = async (keyword: string): Promise<SearchVideoByKeywordResponseDto> => {
  return await GET(`${VIDEO_API_URI}/search?keyword=${encodeURIComponent(keyword)}`, { credentials: "include" }) as SearchVideoByKeywordResponseDto;
};

export const getPendingReviewVideo = async (page: number, pageSize: number): Promise<GetPendingReviewVideoResponseDto> => {
  return await GET(`${VIDEO_API_URI}/pending?page=${page}&pageSize=${pageSize}`, { credentials: "include" }) as GetPendingReviewVideoResponseDto;
};

export const approvePendingReviewVideo = async (req: ApprovePendingReviewVideoRequestDto): Promise<ApprovePendingReviewVideoResponseDto> => {
  return await POST(`${VIDEO_API_URI}/pending/approved`, req, { credentials: "include" }) as ApprovePendingReviewVideoResponseDto;
};

export const deleteVideoByKvid = async (req: DeleteVideoByKvidRequestDto): Promise<DeleteVideoByKvidResponseDto> => {
  return await DELETE(`${VIDEO_API_URI}/delete`, req, { credentials: "include" }) as DeleteVideoByKvidResponseDto;
};
