import { EMenus, activatedMenuAtom } from "@/stateV2/activatedMenu";
import { CodeOutlined, HomeOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { Menu, type MenuProps } from "antd";
import { useAtom } from "jotai";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import CommonBlock from "./CommonBlock";
import MainMenu from "./MainMenu";
import SourceCodeMenu from "./SourceCodeMenu";
import TreesMenu from "./TreesMenu";

const LeftPanel = () => {
	const [menu, setMenu] = useAtom(activatedMenuAtom);
	const { t } = useTranslation();

	const MENU_ITEMS: MenuProps["items"] = [
		{
			key: EMenus.Main,
			icon: <HomeOutlined />,
			title: t("menu.main"),
		},
		{
			key: EMenus.Trees,
			icon: <NodeIndexOutlined />,
			title: t("menu.trees"),
		},
		{
			key: EMenus.Code,
			icon: <CodeOutlined />,
			title: t("menu.code"),
		}
	];

	return (
		<div className="flex h-screen flex-col pt-4 pr-4" id="left-panel">
			<div className="flex flex-1 overflow-hidden">
				<Menu
					onSelect={({ selectedKeys }) => {
						const value = selectedKeys[0] as EMenus;
						setMenu(value);
					}}
					style={{ width: "64px" }}
					selectedKeys={[menu]}
					items={MENU_ITEMS}
					mode="inline"
					inlineCollapsed
				/>
				<div className="flex flex-1 flex-col overflow-auto px-4 pt-2">
					<CommonBlock />
					{menu === EMenus.Main && <MainMenu />}
					{menu === EMenus.Trees && <TreesMenu />}
					{menu === EMenus.Code && <SourceCodeMenu />}
				</div>
			</div>
		</div>
	);
};

export default memo(LeftPanel);
