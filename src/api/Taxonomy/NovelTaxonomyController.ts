import { GET, POST } from "api/tools/fetch";

const TAG_API = `${backendUri}novel/tag`;
const GENRE_API = `${backendUri}novel/genre`;

export const tagCreate = async (payload: { slug: string; names: Record<string, string>; color?: string; description?: string }) => POST(`${TAG_API}/create`, payload, { credentials: 'include' }) as any;
export const tagUpdate = async (payload: { tagId: number } & Partial<{ slug: string; names: Record<string, string>; color: string; description: string }>) => POST(`${TAG_API}/update`, payload, { credentials: 'include' }) as any;
export const tagList = async () => GET(`${TAG_API}/list`) as any;
export const tagBind = async (payload: { novelId: number; tagId: number }) => POST(`${TAG_API}/bind`, payload, { credentials: 'include' }) as any;
export const tagUnbind = async (payload: { novelId: number; tagId: number }) => POST(`${TAG_API}/unbind`, payload, { credentials: 'include' }) as any;

export const genreCreate = async (payload: { slug: string; names: Record<string, string>; color?: string; description?: string }) => POST(`${GENRE_API}/create`, payload, { credentials: 'include' }) as any;
export const genreUpdate = async (payload: { genreId: number } & Partial<{ slug: string; names: Record<string, string>; color: string; description: string }>) => POST(`${GENRE_API}/update`, payload, { credentials: 'include' }) as any;
export const genreList = async () => GET(`${GENRE_API}/list`) as any;
export const genreBind = async (payload: { novelId: number; genreId: number }) => POST(`${GENRE_API}/bind`, payload, { credentials: 'include' }) as any;
export const genreUnbind = async (payload: { novelId: number; genreId: number }) => POST(`${GENRE_API}/unbind`, payload, { credentials: 'include' }) as any; 