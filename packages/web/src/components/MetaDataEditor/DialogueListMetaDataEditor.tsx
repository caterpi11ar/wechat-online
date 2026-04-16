import { type IDialogueItem, dialogueListAtom } from "@/stateV2/dialogueList";
import { type IStateGroup, allGroupsAtom } from "@/stateV2/group";
import { Button, Form, Input, InputNumber, Radio, Select, Switch } from "antd";
import dayjs from "dayjs";
import { useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useState } from "react";
import FriendSelect from "./FriendSelect";

type DialogueType = "friend" | "group";

const DialogueListMetaDataEditor = () => {
	const [form] = Form.useForm<IDialogueItem & { dialogueType: DialogueType }>();
	const setDialogueList = useSetAtom(dialogueListAtom);
	const allGroups = useAtomValue(allGroupsAtom);
	const [dialogueType, setDialogueType] = useState<DialogueType>("friend");

	const onFinish = (values: IDialogueItem & { dialogueType: DialogueType }) => {
		const { dialogueType: type, ...dialogueValues } = values;
		// 根据实际类型清除不需要的字段
		if (type === "group") {
			dialogueValues.friendId = undefined;
		} else {
			dialogueValues.groupId = undefined;
		}
		setDialogueList((prev) => [
			{
				...dialogueValues,
				id: nanoid(5),
			},
			...prev,
		]);
		form.resetFields();
	};

	const groupOptions = allGroups.map((g: IStateGroup) => ({
		label: `${g.name}(${g.displayMemberCount ?? g.memberIds.length})`,
		value: g.id,
	}));

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={onFinish}
			autoComplete="off"
			initialValues={{ dialogueType: "friend" }}
		>
			<Form.Item name="dialogueType" label="对话类型">
				<Radio.Group
					onChange={(e) => {
						setDialogueType(e.target.value);
						form.setFieldsValue({ friendId: undefined, groupId: undefined });
					}}
				>
					<Radio value="friend">单聊</Radio>
					<Radio value="group">群聊</Radio>
				</Radio.Group>
			</Form.Item>
			{dialogueType === "friend" ? (
				<Form.Item<IDialogueItem> name="friendId" label="关联好友" rules={[{ required: true }]}>
					<FriendSelect filterExisting withQuickAdd />
				</Form.Item>
			) : (
				<Form.Item<IDialogueItem> name="groupId" label="关联群聊" rules={[{ required: true }]}>
					<Select options={groupOptions} placeholder="选择群聊" />
				</Form.Item>
			)}
			<Form.Item<IDialogueItem>
				name="lastMessage"
				label="最后一条消息"
				rules={[{ required: true }]}
			>
				<Input />
			</Form.Item>
			<Form.Item<IDialogueItem>
				name="lastMessageTime"
				label="最后一条消息发送时间"
				rules={[{ required: true }]}
			>
				<Input
					suffix={
						<>
							<Button
								onClick={() => {
									const time = dayjs().format("HH:mm");
									form.setFieldValue("lastMessageTime", time);
								}}
							>
								当前时间
							</Button>
						</>
					}
				/>
			</Form.Item>
			<Form.Item<IDialogueItem> name="isMuted" label="是否静音" valuePropName="checked">
				<Switch />
			</Form.Item>
			<Form.Item<IDialogueItem> name="isPinned" label="是否置顶" valuePropName="checked">
				<Switch />
			</Form.Item>
			<Form.Item<IDialogueItem> name="unreadMarkNumber" label="未读通知数量">
				<InputNumber min={1} />
			</Form.Item>
			<Form.Item<IDialogueItem> name="badgeHide" label="是否隐藏未读角标" valuePropName="checked">
				<Switch />
			</Form.Item>
			<Form.Item<IDialogueItem> name="unreadDisplayType" label="未读角标显示方式">
				<Radio.Group>
					<Radio value="number">数字</Radio>
					<Radio value="dot">红点</Radio>
				</Radio.Group>
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					创建
				</Button>
			</Form.Item>
		</Form>
	);
};

export default DialogueListMetaDataEditor;
