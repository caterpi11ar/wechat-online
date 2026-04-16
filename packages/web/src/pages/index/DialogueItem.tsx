import MUTED_SVG from "@/assets/muted.svg";
import Badge from "@/components/Badge";
import { h } from "@/components/HashAssets";
import { canBeDetected } from "@/components/NodeDetected";
import TopOperations from "@/components/TopOperations";
import { conversationListAtom } from "@/stateV2/conversation";
import { EMetaDataType } from "@/stateV2/detectedNode";
import { type IDialogueItem, dialogueItemAtom, dialogueListAtom } from "@/stateV2/dialogueList";
import { groupAtom } from "@/stateV2/group";
import { profileAtom } from "@/stateV2/profile";
import { Modal } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import styles from "./style.module.scss";

type Props = {
	itemId: IDialogueItem["id"];
	className?: string;
};

const DialogueItem = ({ itemId, className }: Props) => {
	const {
		friendId,
		groupId,
		id,
		isPinned,
		unreadDisplayType,
		unreadMarkNumber,
		isMuted,
		badgeHide,
		lastMessage,
		lastMessageTime,
	} = useAtomValue(dialogueItemAtom(itemId))!;
	const friendProfile = useAtomValue(profileAtom(friendId ?? ""));
	const groupInfo = useAtomValue(groupAtom(groupId ?? ""));
	const conversationKey = groupId ?? friendId ?? "";
	const setConversationList = useSetAtom(conversationListAtom(conversationKey));
	const setDialogueList = useSetAtom(dialogueListAtom);
	const navigate = useNavigate();

	const isGroup = !!groupId;

	if (!isGroup && !friendProfile) return null;
	if (isGroup && !groupInfo) return null;

	const displayName = isGroup
		? `${groupInfo!.name}(${groupInfo!.displayMemberCount ?? groupInfo!.memberIds.length})`
		: (friendProfile!.remark ?? friendProfile!.nickname);
	const displayAvatar = isGroup ? (groupInfo!.avatarInfo ?? "") : friendProfile!.avatarInfo;

	const handleOperationDelete = () => {
		Modal.confirm({
			title: "是否删除该对话项？",
			content: "这将删除与该对话的聊天记录",
			onOk: () => {
				setDialogueList((prev) => prev.filter((v) => v.id !== id));
				setConversationList(RESET);
			},
		});
	};

	return (
		<canBeDetected.div
			className={twMerge(
				"relative flex cursor-pointer items-center p-4 after:absolute after:bottom-0 after:w-full after:border-gray-200 after:border-b",
				styles["chat-item"],
				isPinned && "bg-[rgba(237,237,237,1)]",
				className,
			)}
			metaData={
				isGroup
					? {
							type: EMetaDataType.DialogueItem,
							index: id,
							operations: [
								{ onClick: handleOperationDelete, element: <TopOperations.OperaionDeleteBase /> },
								{
									onClick: TopOperations.OperationSelectParent.selectParentNode,
									element: <TopOperations.OperationNewBase />,
								},
							],
							label: "对话项目",
						}
					: [
							{
								type: EMetaDataType.DialogueItem,
								index: id,
								operations: [
									{ onClick: handleOperationDelete, element: <TopOperations.OperaionDeleteBase /> },
									{
										onClick: TopOperations.OperationSelectParent.selectParentNode,
										element: <TopOperations.OperationNewBase />,
									},
								],
								label: "对话项目",
							},
							{
								type: EMetaDataType.FirendProfile,
								index: friendId!,
								label: "好友个人信息",
								treeItemDisplayName: (data) => `对话项目（${data.nickname}）`,
							},
						]
			}
			onClick={() => {
				if (isGroup) {
					navigate(`/group-conversation/${groupId}`);
				} else {
					navigate(`/conversation/${friendId}`);
				}
			}}
			nodeTreeSort
		>
			<Badge type={unreadDisplayType} text={unreadMarkNumber} hidden={badgeHide}>
				{isGroup && !groupInfo!.avatarInfo ? (
					<GroupAvatarMini memberIds={groupInfo!.memberIds} />
				) : (
					<h.img
						className="h-10 w-10 rounded-[4px] object-cover object-center"
						src={displayAvatar}
					/>
				)}
			</Badge>
			<div className="ml-3 flex flex-1 flex-col space-y-1 overflow-hidden">
				<div className="flex items-center justify-between">
					<span className="font-normal">{displayName}</span>
					<span className="text-gray-400 text-xs">{lastMessageTime}</span>
				</div>
				<div className="flex items-center">
					<span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-400 text-sm">
						{lastMessage}
					</span>
					{isMuted && <img className="w-4" src={MUTED_SVG} />}
				</div>
			</div>
		</canBeDetected.div>
	);
};

/** 对话列表中群聊的迷你组合头像（微信风格：2=1x2, 3=1+2, 4=2x2, 5+=3x3） */
const GroupAvatarMini = ({ memberIds }: { memberIds: string[] }) => {
	const shown = memberIds.slice(0, 9);
	const count = shown.length;
	const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;

	return (
		<div
			className="grid h-10 w-10 gap-[1px] overflow-hidden rounded-[4px] bg-[#E0E0E0] place-items-center"
			style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
		>
			{count === 3 && <div />}
			{shown.map((memberId) => (
				<GroupAvatarMiniItem key={memberId} memberId={memberId} />
			))}
		</div>
	);
};

const GroupAvatarMiniItem = ({ memberId }: { memberId: string }) => {
	const profile = useAtomValue(profileAtom(memberId));
	return (
		<h.img className="h-full w-full object-cover object-center" src={profile?.avatarInfo ?? ""} />
	);
};

export default memo(DialogueItem);
