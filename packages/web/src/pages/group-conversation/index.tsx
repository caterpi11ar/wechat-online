import ConversationFooter from "../conversation/ConversationFooter";
import ConversationList from "../conversation/ConversationList";
import { ConversationAPIProvider } from "../conversation/context";
import GroupConversationHeader from "./GroupConversationHeader";

const GroupConversation = () => {
	return (
		<ConversationAPIProvider>
			<GroupConversationHeader />
			<ConversationList />
			<ConversationFooter />
		</ConversationAPIProvider>
	);
};

export default GroupConversation;
