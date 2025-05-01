import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

// 配置中文语言和相对时间插件
dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

export const formatDateTime = (timestamp: number) => {
	if (!timestamp) return null;

  // 自动处理秒级/毫秒级时间戳
	const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;

	return {
		formatted: dayjs(ts).format("YYYY-MM-DD HH:mm:ss"),
		relative: dayjs(ts).fromNow(),
	};
};
