import { GET, POST } from "api/tools/fetch";

const CHAPTER_API = `${backendUri}chapter`;

export const chapterCreate = async (payload: { novelId: number; title: string; content: string }) => {
	return await POST(`${CHAPTER_API}/create`, payload, { credentials: "include" }) as any;
};

export const chapterListByNovelUuid = async (params: { novelUuid: string; from?: number; size?: number }) => {
	const qs = new URLSearchParams();
	qs.set('novelUuid', params.novelUuid);
	if (params.from != null) qs.set('from', String(params.from));
	if (params.size != null) qs.set('size', String(params.size));
	return await GET(`${CHAPTER_API}/list?${qs.toString()}`, { credentials: "include" }) as any;
};

export const chapterAdjacent = async (params: { novelUuid: string; sequence: number }) => {
	const qs = new URLSearchParams();
	qs.set('novelUuid', params.novelUuid);
	qs.set('sequence', String(params.sequence));
	return await GET(`${CHAPTER_API}/adjacent?${qs.toString()}`, { credentials: "include" }) as any;
}; 