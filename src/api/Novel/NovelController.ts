import { GET, POST } from "api/tools/fetch";

const NOVEL_API = `${backendUri}novel`;

export const novelCreate = async (payload: { title: string; slug: string; description?: string; tags?: string[]; genres?: string[]; language?: string; coverUrl?: string }) => {
	return await POST(`${NOVEL_API}/create`, payload, { credentials: "include" }) as any;
};

export const novelUpdate = async (payload: { novelId: number } & Partial<{ title: string; slug: string; description: string; tags: string[]; genres: string[]; status: string; language: string; coverUrl: string }>) => {
	return await POST(`${NOVEL_API}/update`, payload, { credentials: "include" }) as any;
};

export const novelDelete = async (payload: { novelId: number }) => {
	return await POST(`${NOVEL_API}/delete`, payload, { credentials: "include" }) as any;
};

export const novelSearch = async (params: { q?: string; tagIds?: number[]; genreIds?: number[]; language?: string; status?: string; from?: number; size?: number; sort?: 'recent' | 'popular' } = {}) => {
	const qs = new URLSearchParams();
	if (params.q) qs.set('q', params.q);
	if (params.tagIds?.length) qs.set('tagIds', params.tagIds.join(','));
	if (params.genreIds?.length) qs.set('genreIds', params.genreIds.join(','));
	if (params.language) qs.set('language', params.language);
	if (params.status) qs.set('status', params.status);
	if (params.from != null) qs.set('from', String(params.from));
	if (params.size != null) qs.set('size', String(params.size));
	if (params.sort) qs.set('sort', params.sort);
	return await GET(`${NOVEL_API}/search?${qs.toString()}`) as any;
};

export const novelAddFavorite = async (payload: { novelId: number }) => {
	return await POST(`${NOVEL_API}/favorite/add`, payload, { credentials: "include" }) as any;
};
export const novelRemoveFavorite = async (payload: { novelId: number }) => {
	return await POST(`${NOVEL_API}/favorite/remove`, payload, { credentials: "include" }) as any;
};

export const novelUpsertHistory = async (payload: { novelId: number; chapterId: number; progress?: number }) => {
	return await POST(`${NOVEL_API}/history/upsert`, payload, { credentials: "include" }) as any;
};

export const novelAddComment = async (payload: { novelId: number; content: string; replyToCommentId?: number }) => {
	return await POST(`${NOVEL_API}/comment/add`, payload, { credentials: "include" }) as any;
};

export const novelLike = async (payload: { novelId: number; action: 'like' | 'dislike' }) => {
	return await POST(`${NOVEL_API}/${payload.action}`, payload, { credentials: "include" }) as any;
};

export const novelCommentLike = async (payload: { commentId: number; action: 'like' | 'dislike' }) => {
	return await POST(`${NOVEL_API}/comment/${payload.action}`, payload, { credentials: "include" }) as any;
};

// Comment moderation
export const novelListComments = async (params: { novelId?: number; page?: number; pageSize?: number; includeDeleted?: boolean }) => {
	const qs = new URLSearchParams();
	if (params.novelId != null) qs.set('novelId', String(params.novelId));
	if (params.page != null) qs.set('page', String(params.page));
	if (params.pageSize != null) qs.set('pageSize', String(params.pageSize));
	if (params.includeDeleted != null) qs.set('includeDeleted', String(params.includeDeleted));
	return await GET(`${NOVEL_API}/comments?${qs.toString()}`, { credentials: "include" }) as any;
};

export const novelDeleteComment = async (payload: { commentId: number }) => {
	return await POST(`${NOVEL_API}/comment/delete`, payload, { credentials: "include" }) as any;
};

export const novelRestoreComment = async (payload: { commentId: number }) => {
	return await POST(`${NOVEL_API}/comment/restore`, payload, { credentials: "include" }) as any;
};

export const novelGetComment = async (commentId: number) => {
	return await GET(`${NOVEL_API}/comment/${commentId}`, { credentials: "include" }) as any;
};

// Public novel comments
export const novelGetNovelComments = async (novelId: number, params: { page?: number; pageSize?: number } = {}) => {
	const qs = new URLSearchParams();
	if (params.page != null) qs.set('page', String(params.page));
	if (params.pageSize != null) qs.set('pageSize', String(params.pageSize));
	return await GET(`${NOVEL_API}/${novelId}/comments?${qs.toString()}`) as any;
}; 