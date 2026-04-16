import FriendSelect from "@/components/MetaDataEditor/FriendSelect";
import { MYSELF_ID } from "@/faker/user";
import { type IStateGroup, groupAtom } from "@/stateV2/group";
import { Form, Input, InputNumber } from "antd";
import { useSetAtom } from "jotai";

const GroupProfileMetaDataEditor = ({
	data,
	index,
}: EditorProps<IStateGroup, IStateGroup["id"]>) => {
	const [form] = Form.useForm<IStateGroup>();
	const setGroup = useSetAtom(groupAtom(index));

	const onFinish = (values: Partial<IStateGroup>) => {
		setGroup((prev) => {
			if (!prev) return prev;
			const updated = { ...prev, ...values };
			if (!updated.memberIds.includes(MYSELF_ID)) {
				updated.memberIds = [MYSELF_ID, ...updated.memberIds];
			}
			if (!updated.memberIds.includes(updated.ownerId)) {
				updated.ownerId = MYSELF_ID;
			}
			return updated;
		});
	};

	return (
		<Form
			form={form}
			layout="vertical"
			autoComplete="off"
			onFinish={onFinish}
			onValuesChange={() => {
				setTimeout(() => {
					form.submit();
				}, 100);
			}}
			initialValues={data}
		>
			<Form.Item<IStateGroup> name="name" label="群聊名称">
				<Input />
			</Form.Item>
			<Form.Item<IStateGroup> name="memberIds" label="群成员">
				<FriendSelect mode="multiple" withMyself withQuickAdd />
			</Form.Item>
			<Form.Item<IStateGroup>
				name="displayMemberCount"
				label="显示群成员数量"
				tooltip="留空则自动使用实际成员数"
			>
				<InputNumber min={1} placeholder="自动" className="w-full" />
			</Form.Item>
			<Form.Item<IStateGroup> name="announcement" label="群公告">
				<Input.TextArea rows={2} />
			</Form.Item>
		</Form>
	);
};

export default GroupProfileMetaDataEditor;
