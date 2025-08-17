import { GET, POST } from "api/tools/fetch";

const TAG_API = `${backendUri}novel/tag`;
const GENRE_API = `${backendUri}novel/genre`;

// Tag operations
export const tagCreate = async (payload: { name: string; description?: string; color?: string }) => POST(`${TAG_API}/create`, payload, { credentials: 'include' }) as any;
export const tagUpdate = async (payload: { tagId: number; name?: string; description?: string; color?: string }) => POST(`${TAG_API}/update`, payload, { credentials: 'include' }) as any;
export const tagList = async (page = 1, pageSize = 50) => GET(`${TAG_API}/list?page=${page}&pageSize=${pageSize}`) as any;
export const tagGet = async (tagId: number) => GET(`${TAG_API}/${tagId}`) as any;

// Genre operations
export const genreCreate = async (payload: { name: string; description?: string; color?: string }) => POST(`${GENRE_API}/create`, payload, { credentials: 'include' }) as any;
export const genreUpdate = async (payload: { genreId: number; name?: string; description?: string; color?: string }) => POST(`${GENRE_API}/update`, payload, { credentials: 'include' }) as any;
export const genreList = async (page = 1, pageSize = 50) => GET(`${GENRE_API}/list?page=${page}&pageSize=${pageSize}`) as any;
export const genreGet = async (genreId: number) => GET(`${GENRE_API}/${genreId}`) as any; 