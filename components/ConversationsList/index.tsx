import ConversationItem, {ConversationItemProps} from "./ConversationItem";
import {setConversation} from "@/store/session";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";

const ConversationsList = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: any) => state.user.accessToken);
  const session = useSelector((state: any) => state.session.session);
  const conversation = useSelector((state: any) => state.session.conversation);

  const getConversationHistory = async () => {
    const response = await fetch('/api/conversation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    dispatch(setConversation(data.items || []));
  }

  useEffect(() => {
    getConversationHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  return (
    <div className="flex-col flex-1 overflow-y-auto border-b border-white/20">
      {conversation && conversation?.map((item: ConversationItemProps) => (
        <ConversationItem key={item.id} {...item}/>
      ))}
    </div>
  )
}

export default ConversationsList