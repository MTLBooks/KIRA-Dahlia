import { GET, POST } from "api/tools/fetch";
import { backendUri } from "api/tools/getCorrectUri";
import type { SearchVideoTagResponseDto, CreateVideoTagRequestDto, CreateVideoTagResponseDto, GetVideoTagByTagIdRequestDto, GetVideoTagByTagIdResponseDto } from "./VideoTagControllerDto";

const TAG_API_URI = `${backendUri}video/tag`;

export const searchVideoTag = async (tagName: string): Promise<SearchVideoTagResponseDto> => {
  return await GET(`${TAG_API_URI}/search?tagName=${encodeURIComponent(tagName)}`, { credentials: "include" }) as SearchVideoTagResponseDto;
};

export const createVideoTag = async (req: CreateVideoTagRequestDto): Promise<CreateVideoTagResponseDto> => {
  return await POST(`${TAG_API_URI}/create`, req, { credentials: "include" }) as CreateVideoTagResponseDto;
};

export const getVideoTagByTagId = async (req: GetVideoTagByTagIdRequestDto): Promise<GetVideoTagByTagIdResponseDto> => {
  return await POST(`${TAG_API_URI}/get`, req, { credentials: "include" }) as GetVideoTagByTagIdResponseDto;
};
