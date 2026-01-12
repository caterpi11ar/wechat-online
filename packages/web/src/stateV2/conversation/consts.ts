import { EConversationType, type TConversationItem } from "./typing";
import outsourcing from "@/assets/outsourcing.jpg";

export const ConversationTypeLabel = {
	[EConversationType.text]: "文本",
	[EConversationType.image]: "图片",
	[EConversationType.transfer]: "转账",
	[EConversationType.redPacket]: "红包",
	[EConversationType.personalCard]: "个人名片",
	[EConversationType.voice]: "语音消息",
	[EConversationType.video]: "视频",
	[EConversationType.centerText]: "居中文本",
	[EConversationType.redPacketAcceptedReply]: "红包领取成功消息",
};

export const MOCK_INIT_CONVERSATION_LIST: TConversationItem[] = [
	{
		id: "1",
		type: EConversationType.text,
		textContent: [
			{
				text: "以后别联系了"
			},
		],
		role: "friend",
		upperText: "12:57",
	},
	{
		id: "2",
		type: EConversationType.text,
		textContent: [
			{
				text: "为什么"
			},
		],
		role: "mine",
	},
	{
		id: "3",
		type: EConversationType.text,
		textContent: [
			{
				text: "因为你是外包"
			},
		],
		role: "friend",
	},
	{
		id: "4",
		type: EConversationType.image,
		role: "mine",
		imageInfo: outsourcing,
	}
];
