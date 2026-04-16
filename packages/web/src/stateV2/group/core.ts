import { dequal } from "dequal/lite";
import { type SetStateAction, atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomFamily } from "jotai/utils";
import type { OpticFor_ } from "optics-ts";
import atomWithStorage from "../atomWithStorage";
import { mainStore } from "../store";
import { INIT_GROUPS } from "./consts";
import type { IStateGroup, TStateAllGroups } from "./typing";

/**
 * 所有群聊信息
 */
export const allGroupsAtom = atomWithStorage<TStateAllGroups>("allGroups", INIT_GROUPS);

export const getAllGroupsValueSnapshot = () => mainStore.get(allGroupsAtom);
export const setAllGroupsValue = (args: SetStateAction<TStateAllGroups>) =>
	mainStore.set(allGroupsAtom, args);

/**
 * 所有群聊 ID
 */
export const allGroupsIdsAtom = atom((get) => get(allGroupsAtom).map((v) => v.id));

export const getAllGroupsIdsValueSnapshot = () => mainStore.get(allGroupsIdsAtom);

/**
 * 单个群聊信息
 */
export const groupAtom = atomFamily(
	(id: IStateGroup["id"]) =>
		focusAtom(allGroupsAtom, (optic: OpticFor_<TStateAllGroups>) => optic.find((v) => v.id === id)),
	dequal,
);

export const getGroupValueSnapshot = (id: IStateGroup["id"]) => mainStore.get(groupAtom(id));
export const setGroupValue = (id: IStateGroup["id"], args: SetStateAction<IStateGroup>) =>
	mainStore.set(groupAtom(id), args);
