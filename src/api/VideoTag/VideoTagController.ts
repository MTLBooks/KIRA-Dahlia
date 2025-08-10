/**
 * Video Tag API client
 * Base URL is derived from backendUri and prefixed with "video/tag".
 */
import { GET, POST } from "api/tools/fetch";
import { backendUri } from "api/tools/getCorrectUri";
import type { SearchVideoTagResponseDto, CreateVideoTagRequestDto, CreateVideoTagResponseDto, GetVideoTagByTagIdRequestDto, GetVideoTagByTagIdResponseDto } from "./VideoTagControllerDto";

/**
 * Base URI for video tag APIs
 */
const TAG_API_URI = `${backendUri}video/tag`;

/**
 * Search video tags by tag name (supports empty string to fetch all)
 * @param tagName - Tag name keyword
 * @returns Response containing matching tags
 */
export const searchVideoTag = async (tagName: string): Promise<SearchVideoTagResponseDto> => {
  return await GET(`${TAG_API_URI}/search?tagName=${encodeURIComponent(tagName)}`, { credentials: "include" }) as SearchVideoTagResponseDto;
};

/**
 * Create a video tag
 * @param req - Request payload with multilingual tag names
 * @returns Response containing created tag when successful
 */
export const createVideoTag = async (req: CreateVideoTagRequestDto): Promise<CreateVideoTagResponseDto> => {
  return await POST(`${TAG_API_URI}/create`, req, { credentials: "include" }) as CreateVideoTagResponseDto;
};

/**
 * Get video tags by tag IDs
 * @param req - Request payload containing tagId list
 * @returns Response containing tag list
 */
export const getVideoTagByTagId = async (req: GetVideoTagByTagIdRequestDto): Promise<GetVideoTagByTagIdResponseDto> => {
  return await POST(`${TAG_API_URI}/get`, req, { credentials: "include" }) as GetVideoTagByTagIdResponseDto;
};
