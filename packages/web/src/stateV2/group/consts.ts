import { MYSELF_ID } from "@/faker/user";
import { nanoid } from "nanoid";
import { EConversationType, type TConversationItem } from "../conversation/typing";
import type { TStateAllGroups } from "./typing";

export const GROUP_ID_PREFIX = "group_";

export const generateGroupId = () => `${GROUP_ID_PREFIX}${nanoid(8)}`;

export const isGroupId = (id: string) => id.startsWith(GROUP_ID_PREFIX);

export const INIT_GROUPS: TStateAllGroups = [
	{
		id: `${GROUP_ID_PREFIX}demo1`,
		name: "开发组",
		memberIds: [MYSELF_ID, "1", "2"],
		ownerId: MYSELF_ID,
	},
];

export const MOCK_GROUP_CONVERSATION_LIST: TConversationItem[] = [
	{
		type: EConversationType.text,
		role: "friend",
		senderId: "1",
		textContent: [{ type: "paragraph", children: [{ text: "今天下午开会吗？" }] }],
		id: "gc1",
		sendTimestamp: 1713200000000,
		upperText: "14:30",
	},
	{
		type: EConversationType.text,
		role: "mine",
		senderId: MYSELF_ID,
		textContent: [{ type: "paragraph", children: [{ text: "三点准时开始" }] }],
		id: "gc2",
		sendTimestamp: 1713200060000,
	},
	{
		type: EConversationType.text,
		role: "friend",
		senderId: "2",
		textContent: [{ type: "paragraph", children: [{ text: "收到，我准备一下材料" }] }],
		id: "gc3",
		sendTimestamp: 1713200120000,
	},
];
