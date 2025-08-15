import { GET, POST } from "api/tools/fetch";

const RL_API = `${backendUri}reading-list`;

export const readingListCreate = async (payload: { name: string; description?: string; visibility?: 'private' | 'public' | 'unlisted' }) => POST(`${RL_API}/create`, payload, { credentials: 'include' }) as any;
export const readingListUpdate = async (payload: { listId: number } & Partial<{ name: string; description: string; visibility: 'private' | 'public' | 'unlisted'; coverNovelId: number }>) => POST(`${RL_API}/update`, payload, { credentials: 'include' }) as any;
export const readingListDelete = async (payload: { listId: number }) => POST(`${RL_API}/delete`, payload, { credentials: 'include' }) as any;
export const readingListMy = async () => GET(`${RL_API}/my`, { credentials: 'include' }) as any;
export const readingListPublic = async (params?: { ownerUserId?: number }) => {
	const qs = new URLSearchParams();
	if (params?.ownerUserId != null) qs.set('ownerUserId', String(params.ownerUserId));
	return await GET(`${RL_API}/public?${qs.toString()}`) as any;
};

export const readingListItemAdd = async (payload: { listId: number; novelId: number; novelUuid: string; order?: number; notes?: string }) => POST(`${RL_API}/item/add`, payload, { credentials: 'include' }) as any;
export const readingListItemRemove = async (payload: { listId: number; novelId: number }) => POST(`${RL_API}/item/remove`, payload, { credentials: 'include' }) as any;
export const readingListItems = async (params: { listId: number; page?: number; pageSize?: number }) => {
	const qs = new URLSearchParams();
	qs.set('listId', String(params.listId));
	if (params.page != null) qs.set('page', String(params.page));
	if (params.pageSize != null) qs.set('pageSize', String(params.pageSize));
	return await GET(`${RL_API}/items?${qs.toString()}`, { credentials: 'include' }) as any;
}; 