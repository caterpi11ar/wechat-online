import type { IStateProfile, TStateAllProfiles } from "@/stateV2/profile";
import CATERPILLAR_AVATAR from "@/assets/caterpillar-avatar.jpg";
import MEI_AVATAR from "@/assets/mei-avatar.jpg";

export const MYSELF_ID = "0";

export const INIT_MY_PROFILE: IStateProfile = {
	id: MYSELF_ID,
	nickname: "毛毛虫",
	avatarInfo: CATERPILLAR_AVATAR,
	wechat: "caterpillar1046",	
	gender: "male",
	momentsBackgroundInfo: "https://cdn-fakeworld.azureedge.net/fakeworld/pnqqk6.jpg",
	momentsPrivacy: "all",
	thumbnailInfo: [],
	momentsBackgroundLike: false,
	privacy: "all",
	area: "中国大陆",
	signature: "不学习是🐶再熬夜是🐷",
};

/**
 * 好友列表
 */
export const INIT_FRIENDS: TStateAllProfiles = [
	{
		id: "1",
		nickname: "唐吉诃德",
		avatarInfo: MEI_AVATAR,
		wechat: "*",
		gender: "female",
		privacy: "all",
		thumbnailInfo: [],
		momentsBackgroundInfo: "https://cdn-fakeworld.azureedge.net/fakeworld/pnqz5x.jpg",
		momentsBackgroundLike: false,
		momentsPrivacy: "all",
		signature: "Cr",
		area: "韩国 仁川 仁川市",
		isStarred: true,
	},
	{
		id: "2",
		nickname: "星之笨比",
		avatarInfo: "https://cdn-fakeworld.azureedge.net/fakeworld/ppf1ga.jpg",
		wechat: "kirby",
		privacy: "all",
		thumbnailInfo: [],
		momentsBackgroundInfo: "https://cdn-fakeworld.azureedge.net/fakeworld/pnqz5x.jpg",
		momentsBackgroundLike: false,
		momentsPrivacy: "all",
	},
];
