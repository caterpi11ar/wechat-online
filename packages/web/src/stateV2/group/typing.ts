import type { IStateProfile } from "../profile";

export interface IStateGroup {
	id: string;
	/** 群聊名称 */
	name: string;
	/** 群成员 ID 列表，必须包含 MYSELF_ID */
	memberIds: IStateProfile["id"][];
	/** 群主 ID */
	ownerId: IStateProfile["id"];
	/** 自定义群头像，缺省则由成员头像拼接 */
	avatarInfo?: string;
	/** 群公告 */
	announcement?: string;
	/** 显示的群成员数量，缺省则使用 memberIds.length */
	displayMemberCount?: number;
}

export type TStateAllGroups = IStateGroup[];
