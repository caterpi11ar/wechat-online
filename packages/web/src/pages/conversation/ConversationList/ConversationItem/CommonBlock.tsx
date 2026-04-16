import { h } from "@/components/HashAssets";
import { canBeDetected } from "@/components/NodeDetected";
import useModeNavigate from "@/components/useModeNavigate";
import { MYSELF_ID } from "@/faker/user";
import type { IConversationItemBase } from "@/stateV2/conversation";
import { getModeValueSnapshot } from "@/stateV2/mode";
import { type IStateProfile, profileAtom } from "@/stateV2/profile";
import { css } from "@emotion/react";
import { useDebounceFn } from "ahooks";
import { useAtomValue } from "jotai";
import type { CSSProperties, MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { useConversationAPI } from "../../context";

interface Props<P = AnyObject> {
	upperText: IConversationItemBase["upperText"];
	senderId: IStateProfile["id"];
	innerBlockClassName?: string;
	blockClassName?: string;
	blockStyle?: CSSProperties;
	extraElement?: ReactNode;
	hideAvatar?: boolean;
	innerBlockProps?: P;
	onClick?: MouseEventHandler<HTMLDivElement>;
}

const CommonBlock = <P extends AnyObject>({
	upperText,
	senderId,
	children,
	innerBlockClassName,
	blockClassName,
	blockStyle,
	extraElement,
	hideAvatar,
	innerBlockProps,
	onClick,
}: PropsWithChildren<Props<P>>) => {
	const profile = useAtomValue(profileAtom(senderId));
	const { avatarInfo = "", nickname = "", remark } = profile ?? {};
	const navigate = useModeNavigate({ silence: true });
	const { sendTickleText, isGroupChat } = useConversationAPI();

	const handleClick: MouseEventHandler<HTMLImageElement> = (ev) => {
		const { detail: count } = ev;
		if (count === 2) {
			handleDoubliClick();
		} else if (count === 1) {
			navigate(`/friend/${senderId}`);
		}
	};

	const handleDoubliClick = () => {
		if (getModeValueSnapshot() === "edit") return;
		sendTickleText(senderId);
	};

	const { run: debouncedHandleClick } = useDebounceFn(handleClick, { wait: 200 });

	return (
		<>
			{upperText && <div className="m-auto text-black/50 text-xs">{upperText}</div>}
			<div className="flex flex-col group-[.mine]:items-end group-[.friend]:items-start">
				{isGroupChat && senderId !== MYSELF_ID && (
					<div className="mb-1 ml-[52px] text-gray-400 text-xs group-[.mine]:mr-[52px] group-[.mine]:ml-0">
						{remark ?? nickname}
					</div>
				)}
				<div
					className={twMerge(
						"relative flex max-w-[85%] space-x-3 group-[.mine]:ml-auto group-[.mine]:flex-row-reverse group-[.mine]:space-x-reverse",
						blockClassName,
					)}
					style={blockStyle}
					onClick={onClick}
				>
					<h.img
						src={avatarInfo}
						className={twJoin(
							"h-10 w-10 min-w-10 cursor-pointer rounded object-cover object-center",
							hideAvatar && "invisible",
						)}
						onClick={debouncedHandleClick}
					/>
					<canBeDetected.div
						css={css`
            &::before {
              clip-path: polygon(0% 50%, 50% 100%, 0% 100%);
            }
          `}
						className={twMerge(
							"group-[.friend]:before:-left-[1px] group-[.mine]:before:-right-[1px] group-[.mine]:before:-rotate-[135deg] relative max-w-[85%] break-words rounded p-[10px] before:absolute before:top-[6px] before:h-7 before:w-7 before:rounded-sm group-[.friend]:before:rotate-45",
							innerBlockClassName,
						)}
						{...(innerBlockProps as P)}
					>
						{children}
					</canBeDetected.div>
					{extraElement}
				</div>
			</div>
		</>
	);
};

export default CommonBlock;
