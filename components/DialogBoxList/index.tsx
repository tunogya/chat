import {useCallback, useEffect, useMemo, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setIsWaitHistory, setSession} from "@/store/session";
import DialogBoxItem from "@/components/DialogBoxList/DialogBoxItem";
import {useRouter} from "next/router";
import DownIcon from "@/components/SVG/DownIcon";
import ScrollToBottom, {useScrollToBottom, useSticky} from "react-scroll-to-bottom";
import dynamic from 'next/dynamic';
import useSWR from "swr";
import Typewriter from "@/components/Typewriter";

const DialogBoxListContent = ({session}: any) => {
  const bottomRef = useRef(null);
  const scrollToBottom = useScrollToBottom();
  const [sticky] = useSticky();

  // scroll to bottom when new message
  useEffect(() => {
    // @ts-ignore
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [session.messages]);

  const rootMessageId = useMemo(() => {
    if (!session) {
      return null
    }
    if (session.mapping?.['00000000-0000-0000-0000-000000000000']) {
      return '00000000-0000-0000-0000-000000000000'
    }
    // for those who has no root(00000000-0000-0000-0000-000000000000) message
    const ids = Object?.keys(session?.mapping || {}) || []
    if (ids.length === 0) {
      return null
    }
    let check_point = ids[0]
    while (session.mapping[check_point].parent !== null) {
      check_point = session.mapping[check_point].parent
    }
    return check_point
  }, [session])

  return (
    <div className={"w-full h-full"}>
      <div className="flex flex-col h-full items-center text-sm dark:bg-gray-800">
        {
          (session?.id || rootMessageId)
            ? (
              rootMessageId && (
                <DialogBoxItem id={rootMessageId} session={session}/>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-sm dark:bg-gray-800 h-full">
                <h1
                  className="text-4xl font-semibold text-center text-gray-800 dark:text-gray-100">
                  <Typewriter text={'ChatGPT'}/>
                </h1>
                <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
              </div>
            )
        }
      </div>
      {
        !sticky && (
          <button onClick={scrollToBottom} id={"scroll-to-bottom-button"}
                  className="cursor-pointer absolute right-6 bottom-[124px] md:bottom-[120px] z-10 rounded-full border border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
            <DownIcon/>
          </button>
        )
      }
    </div>
  )
}

const WrapDialogBoxListContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const conversation_id = router.query.id?.[0] || undefined;
  const session = useSelector((state: any) => state.session.session);
  const {
    data,
    isLoading
  } = useSWR(conversation_id ? `/api/conversation/${conversation_id}` : null, (url: string) => fetch(url).then((res) => res.json()))

  const updateSession = useCallback(async () => {
    if (data) {
      dispatch(setSession({
        // @ts-ignore
        id: data.SK,
        // @ts-ignore
        title: data.title,
        // @ts-ignore
        mapping: data.mapping,
        // @ts-ignore
        create_time: new Date(data.created * 1000).toLocaleString(),
      }))
    }
    dispatch(setIsWaitHistory(isLoading))
  }, [data, dispatch, isLoading])

  useEffect(() => {
    updateSession()
  }, [updateSession])

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollToBottom className="h-full w-full dark:bg-gray-800">
        <DialogBoxListContent session={session}/>
      </ScrollToBottom>
    </div>
  )
}

export default dynamic(() => Promise.resolve(WrapDialogBoxListContent), {
  ssr: false
})
