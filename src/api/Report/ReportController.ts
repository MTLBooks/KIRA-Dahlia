import { GET, POST } from 'api/tools/fetch'

const REPORT_API = `${backendUri}report`

export const reportCreate = async (payload: { targetType: 'novel'|'chapter'|'comment'|'user'; targetId: number; category: string; title?: string; description?: string; tags?: string[]; attachments?: string[] }) => {
	return await POST(`${REPORT_API}/create`, payload, { credentials: 'include' }) as any
}

export const reportList = async (params: { status?: string; targetType?: string; targetId?: number; category?: string; page?: number; pageSize?: number } = {}) => {
	const qs = new URLSearchParams()
	if (params.status) qs.set('status', params.status)
	if (params.targetType) qs.set('targetType', params.targetType)
	if (params.targetId != null) qs.set('targetId', String(params.targetId))
	if (params.category) qs.set('category', params.category)
	if (params.page != null) qs.set('page', String(params.page))
	if (params.pageSize != null) qs.set('pageSize', String(params.pageSize))
	return await GET(`${REPORT_API}/list?${qs.toString()}`, { credentials: 'include' }) as any
}

export const reportUpdateStatus = async (payload: { reportId: number; status: 'open'|'reviewing'|'resolved'|'dismissed'; assignedToUserId?: number; resolutionNote?: string }) => {
	return await POST(`${REPORT_API}/status`, payload, { credentials: 'include' }) as any
}

export const reportGet = async (reportId: number) => {
	return await GET(`${REPORT_API}/${reportId}`, { credentials: 'include' }) as any
} 