import { MYSELF_ID } from "@/faker/user";
import { type TStateConversationInputterConfig, inputterConfigAtom } from "@/stateV2/conversation";
import { allGroupsAtom } from "@/stateV2/group";
import { profileAtom } from "@/stateV2/profile";
import { Form, Radio, Select } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/** 从 pathname 中提取 groupId，如 /group-conversation/group_xxx -> group_xxx */
function extractGroupIdFromPath(pathname: string): string | undefined {
	const match = pathname.match(/\/group-conversation\/([^/]+)/);
	return match?.[1];
}

const MemberOption = ({ id }: { id: string }) => {
	const profile = useAtomValue(profileAtom(id));
	return <>{profile ? (profile.remark ?? profile.nickname) : id}</>;
};

const ConversationInputMetaDataEditor = ({
	data,
}: EditorProps<TStateConversationInputterConfig>) => {
	const [form] = Form.useForm<TStateConversationInputterConfig>();
	const setInputterConfig = useSetAtom(inputterConfigAtom);
	const location = useLocation();
	const groupId = useMemo(() => extractGroupIdFromPath(location.pathname), [location.pathname]);
	const isGroupChat = !!groupId;

	const allGroups = useAtomValue(allGroupsAtom);
	const group = groupId ? allGroups.find((g) => g.id === groupId) : undefined;
	const groupMembers = group?.memberIds ?? [MYSELF_ID];

	const onFinish = (values: TStateConversationInputterConfig) => {
		if (isGroupChat && values.senderId) {
			values.sendRole = values.senderId === MYSELF_ID ? "mine" : "friend";
		}
		setInputterConfig(values);
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
			initialValues={{
				...data,
				senderId: data.senderId ?? MYSELF_ID,
			}}
		>
			{isGroupChat ? (
				<Form.Item<TStateConversationInputterConfig> name="senderId" label="由谁发送">
					<Select>
						{groupMembers.map((memberId) => (
							<Select.Option key={memberId} value={memberId}>
								<MemberOption id={memberId} />
							</Select.Option>
						))}
					</Select>
				</Form.Item>
			) : (
				<Form.Item<TStateConversationInputterConfig> name="sendRole" label="由谁发送">
					<Radio.Group>
						<Radio value="mine">我自己</Radio>
						<Radio value="friend">朋友</Radio>
					</Radio.Group>
				</Form.Item>
			)}
		</Form>
	);
};

export default ConversationInputMetaDataEditor;
