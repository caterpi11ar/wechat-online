import { MYSELF_ID } from "@/faker/user";
import {
	EConversationType,
	type IConversationTypeRedPacket,
	type IConversationTypeTransfer,
	type TConversationItem,
	type TConversationRole,
	fromLastGenerateUpperText,
	getInputterConfigValueSnapshot,
	getInputterValueSnapshot,
	recentUsedEmojiAtom,
	setConversationListValue,
} from "@/stateV2/conversation";
import {
	type IStateProfile,
	getMyProfileValueSnapshot,
	getProfileValueSnapshot,
} from "@/stateV2/profile";
import { animateElement } from "@/utils";
import type { CustomElementEmoji } from "@/vite-env";
import { SLATE_INITIAL_VALUE, withInlines } from "@/wechatComponents/SlateText/utils";
import { useCreation, usePrevious } from "ahooks";
import dayjs from "dayjs";
import { useSetAtom } from "jotai";
import { isEqual, throttle } from "lodash-es";
import { nanoid } from "nanoid";
import {
	type Dispatch,
	type HTMLAttributes,
	type PropsWithChildren,
	type RefObject,
	type SetStateAction,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { useParams } from "react-router-dom";
import { type BaseEditor, Editor, Node, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import { type ReactEditor, withReact } from "slate-react";

type InputMode = HTMLAttributes<HTMLDivElement>["inputMode"];

interface IConversationAPIContext {
	conversationId: string;
	isGroupChat: boolean;
	listRef: RefObject<HTMLDivElement>;
	scrollConversationListToBtm: () => void;
	inputEditor: BaseEditor & ReactEditor;
	insertEmojiNode: (emojiSymbol: string) => void;
	sendTextMessage: () => void;
	sendTickleText: (friendId: IStateProfile["id"]) => void;
	sendTransfer: (
		data: Omit<IConversationTypeTransfer, "id" | "sendTimestamp" | "upperText" | "type">,
	) => void;
	sendRedPacketAcceptedReply: (redPacketId: IConversationTypeRedPacket["id"]) => void;
	removeLastNode: () => void;
	focusInput: () => void;
	mobileInputMode: InputMode;
	setMobileInputMode: Dispatch<SetStateAction<InputMode>>;
	previousMobileInputMode: InputMode;
}

const ConversationAPIContext = createContext<IConversationAPIContext | null>(null);

export const ConversationAPIProvider = ({ children }: PropsWithChildren) => {
	const listRef = useRef<HTMLDivElement>(null);
	const inputEditor = useCreation(() => withInlines(withHistory(withReact(createEditor()))), []);
	const params = useParams<{ id?: string; groupId?: string }>();
	const isGroupChat = !!params.groupId;
	const conversationId = params.groupId ?? params.id ?? "";
	const setRecentUsedEmoji = useSetAtom(recentUsedEmojiAtom);
	const [mobileInputMode, setMobileInputMode] = useState<InputMode>("text");
	const previousMobileInputMode = usePrevious(mobileInputMode);

	const scrollConversationListToBtm = useCallback(() => {
		setTimeout(() => {
			if (listRef.current) {
				listRef.current.scrollTop = 9999999;
			}
		});
	}, []);

	const insertEmojiNode = useCallback((emojiSymbol: string) => {
		const emoji: CustomElementEmoji = { type: "emoji", emojiSymbol, children: [{ text: "" }] };
		Transforms.insertNodes(inputEditor, emoji);
		Transforms.move(inputEditor, { distance: 1 });
	}, []);

	/** 群聊时返回 { senderId, role }，单聊时返回空对象 */
	const getGroupSenderFields = useCallback(() => {
		if (!isGroupChat) return {};
		const { senderId } = getInputterConfigValueSnapshot();
		const id = senderId ?? MYSELF_ID;
		return { senderId: id, role: (id === MYSELF_ID ? "mine" : "friend") as TConversationRole };
	}, [isGroupChat]);

	const sendTextMessage = useCallback(() => {
		const { sendRole, senderId } = getInputterConfigValueSnapshot();
		const value = getInputterValueSnapshot();
		if (isEqual(value, SLATE_INITIAL_VALUE)) return;
		const role = isGroupChat ? (senderId && senderId !== MYSELF_ID ? "friend" : "mine") : sendRole;
		setConversationListValue(conversationId, (prev) => {
			return [
				...prev,
				{
					type: EConversationType.text,
					role,
					textContent: value,
					id: nanoid(8),
					sendTimestamp: dayjs().valueOf(),
					upperText: fromLastGenerateUpperText(prev),
					...(isGroupChat ? { senderId: senderId ?? MYSELF_ID } : {}),
				},
			] as TConversationItem[];
		});
		const pickedEmoji: string[] = [];
		for (const nodeEntry of Node.descendants(inputEditor)) {
			const [node] = nodeEntry;
			if ((node as CustomElementEmoji).type === "emoji") {
				const { emojiSymbol } = node as CustomElementEmoji;
				pickedEmoji.push(emojiSymbol);
			}
		}
		setRecentUsedEmoji((prev) => Array.from(new Set([...pickedEmoji, ...prev])).slice(0, 8));
		Transforms.delete(inputEditor, {
			at: {
				anchor: Editor.start(inputEditor, []),
				focus: Editor.end(inputEditor, []),
			},
		});
		scrollConversationListToBtm();
	}, [conversationId, isGroupChat]);

	const sendTickleText = useCallback(
		throttle(
			(friendId: IStateProfile["id"]) => {
				const friendProfile = getProfileValueSnapshot(friendId)!;
				const myProfile = getMyProfileValueSnapshot()!;
				const { senderId } = getInputterConfigValueSnapshot();
				let finalTickleText = "";
				if (isGroupChat && senderId && senderId !== MYSELF_ID) {
					const senderProfile = getProfileValueSnapshot(senderId)!;
					if (friendId === senderId) {
						finalTickleText = `"${senderProfile.nickname}" 拍了拍自己${senderProfile.tickleText ?? ""}`;
					} else {
						finalTickleText = `"${senderProfile.nickname}" 拍了拍 "${friendProfile.nickname}" ${friendProfile.tickleText ?? ""}`;
					}
				} else if (friendId === MYSELF_ID) {
					finalTickleText = `我拍了拍自己${myProfile.tickleText ?? ""}`;
				} else {
					finalTickleText = `我拍了拍 "${friendProfile.nickname}" ${friendProfile.tickleText ?? ""}`;
				}
				setConversationListValue(conversationId, (prev) => {
					return [
						...prev,
						{
							type: EConversationType.centerText,
							id: nanoid(8),
							sendTimestamp: dayjs().valueOf(),
							role: "mine",
							simpleContent: finalTickleText,
							upperText: fromLastGenerateUpperText(prev),
							extraClassName: friendId === MYSELF_ID ? "text-black/70 font-bold" : "",
						},
					] as TConversationItem[];
				});
				animateElement("#screen", "headShake");
				scrollConversationListToBtm();
			},
			1000,
			{ trailing: false },
		),
		[conversationId, isGroupChat],
	);

	const sendTransfer = useCallback(
		(data: Parameters<IConversationAPIContext["sendTransfer"]>[0]) => {
			setConversationListValue(conversationId, (prev) => {
				return [
					...prev,
					{
						type: EConversationType.transfer,
						id: nanoid(8),
						sendTimestamp: dayjs().valueOf(),
						upperText: fromLastGenerateUpperText(prev),
						...data,
						...getGroupSenderFields(),
					},
				] as TConversationItem[];
			});
		},
		[conversationId, getGroupSenderFields],
	);

	const sendRedPacketAcceptedReply = useCallback(
		(redPacketId: Parameters<IConversationAPIContext["sendRedPacketAcceptedReply"]>[0]) => {
			setConversationListValue(conversationId, (prev) => {
				return [
					...prev,
					{
						type: EConversationType.redPacketAcceptedReply,
						id: nanoid(8),
						sendTimestamp: dayjs().valueOf(),
						upperText: fromLastGenerateUpperText(prev),
						redPacketId,
						...getGroupSenderFields(),
					},
				] as TConversationItem[];
			});
		},
		[conversationId, getGroupSenderFields],
	);

	const removeLastNode = useCallback(async () => {
		Editor.deleteBackward(inputEditor, { unit: "character" });
	}, []);

	const focusInput = useCallback(() => {
		setMobileInputMode("text");
	}, []);

	const value: IConversationAPIContext = useMemo(() => {
		return {
			conversationId,
			isGroupChat,
			listRef,
			scrollConversationListToBtm,
			inputEditor,
			insertEmojiNode,
			sendTextMessage,
			removeLastNode,
			sendTickleText,
			sendTransfer,
			sendRedPacketAcceptedReply,
			focusInput,
			mobileInputMode,
			setMobileInputMode,
			previousMobileInputMode,
		};
	}, [mobileInputMode, isGroupChat]);

	return (
		<ConversationAPIContext.Provider value={value}>{children}</ConversationAPIContext.Provider>
	);
};

export const useConversationAPI = () => useContext(ConversationAPIContext)!;
