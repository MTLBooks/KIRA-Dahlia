interface MenuItem {
	label: string;
	to?: string;
	key: string;
	icon: MaterialIcon.Names;
	shown?: boolean;
	children?: MenuItem[];
}

const selfUserInfo = noBackend ? null! : await getSelfUserInfo(undefined, false); // fetch only, don't update pinia

const menu: MenuItem[] = [
	{
		label: "Dashboard",
		to: "/",
		key: "",
		icon: "dashboard",
	},
	{
		label: "Users",
		key: "user",
		icon: "group",
		children: [
			{
				label: "Manage",
				key: "manage",
				icon: "manageAccounts",
			},
			{
				label: "Recently Changed",
				key: "recent",
				icon: "history",
			},
			{
				label: "Blocked",
				key: "block",
				icon: "block",
			},
		],
	},
	{
		label: "Novels",
		key: "novel",
		icon: "menuBook",
		children: [
			{ label: "Manage", key: "manage", icon: "libraryBooks" },
			{ label: "Chapters", key: "chapter", icon: "article" },
			{ label: "Reading Lists", key: "reading-list", icon: "playlistAdd" },
			{ label: "Comment Moderation", key: "comment-moderation", icon: "comment" },
		],
	},
	{
		label: "Taxonomy",
		key: "taxonomy",
		icon: "category",
		children: [
			{ label: "Tags", key: "tag", icon: "sell" },
			{ label: "Genres", key: "genre", icon: "style" },
		],
	},
	{
		label: "RBAC",
		key: "rbac",
		icon: "shield",
		shown: checkUserRole(["root", "developer"], selfUserInfo),
		children: [
			{
				label: "API Paths",
				key: "api-path",
				icon: "api",
			},
			{
				label: "Roles",
				key: "role",
				icon: "badge",
			},
			{
				label: "User Roles",
				key: "user-roles",
				icon: "person",
			},
		],
	},
	{
		label: "Reports",
		to: "/report/manage",
		key: "report",
		icon: "report",
		shown: checkUserRole(["root", "developer"], selfUserInfo),
	},
	{
		label: "Staging Secrets",
		key: "stg-secret",
		icon: "key",
		shown: checkUserRole(["root", "developer"], selfUserInfo),
	},
	{
		label: "About",
		key: "about",
		icon: "info",
	},
];

const menuOptions = (() => {
	function getMenuOptions({ label, to, key, icon, shown, children }: MenuItem, parentKeys: string[] = []): MenuOption {
		const keys = [...parentKeys, key], keysRoute = "/" + keys.join("/");
		if (!children) to ??= keysRoute;
		const menuOption: MenuOption = {
			label: () => to != null ? <RouterLink to={to}>{label}</RouterLink> : label,
			key: keysRoute,
			icon: () => <Icon name={icon} />,
			show: shown,
			children: children ? children.map(item => getMenuOptions(item, keys)) : undefined,
		};
		return menuOption;
	}

	return menu.map(item => getMenuOptions(item));
})();

export default menuOptions;
