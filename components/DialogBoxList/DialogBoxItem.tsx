import {FC, useCallback, useEffect, useMemo, useState} from "react";
// import Edit2Icon from "@/components/SVG/Edit2Icon";
import LikeIcon from "@/components/SVG/LikeIcon";
import UnLikeIcon from "@/components/SVG/UnLikeIcon";
import {useDispatch, useSelector} from "react-redux";
import {updateCurrentNodeId, setBlockComplete} from "@/store/session";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from 'rehype-katex';
import {useUser} from "@auth0/nextjs-auth0/client";
import CodeFormat from "@/components/DialogBoxList/CodeFormat";
import Image from "next/image";
import CopyIcon from "@/components/SVG/CopyIcon";
import copy from "copy-to-clipboard";
import OpenAIIcon from "@/components/SVG/OpenAIIcon";
import {useRouter} from "next/router";

export type Message = {
  id: string
  role: 'assistant' | 'user' | 'system'
  content: {
    content_type: 'text' | 'image' | 'video' | 'audio' | 'file'
    parts: string[]
  },
  author: {
    role: 'assistant' | 'user' | 'system',
    name?: string,
    metadata?: {}
  }
}

export type BaseDialogBoxItemProps = {
  id: string,
  message: Message | null,
  currentNodeId: string | null,
  isWaitComplete: boolean,
  area: string,
}

const BaseDialogBoxItem: FC<BaseDialogBoxItemProps> = ({id, message, currentNodeId, isWaitComplete, area}) => {
  const {user} = useUser();
  const [editMode, setEditMode] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const router = useRouter();
  const conversation_id = router.query.id?.[0] || undefined;
  const dispatch = useDispatch();
  const model = useSelector((state: any) => state.session.model);

  const showStreaming = useMemo(() => {
    return currentNodeId === id && isWaitComplete
  }, [currentNodeId, id, isWaitComplete])

  const moderator = useCallback(async () => {
    if (!message || !message?.content?.parts?.[0]) {
      return
    }
    if (isWaitComplete && message.role === 'assistant') {
      return
    }
    const input = message.content.parts[0]
    try {
      const res = await fetch('/api/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.slice(0, 500),
          area,
        })
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data?.blocked) {
          setBlocked(true)
        }
        if (data?.flagged) {
          setFlagged(true)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [message, isWaitComplete])

  useEffect(() => {
    moderator()
  }, [moderator])

  const handleBlocked = useCallback(() => {
    if (!blocked) {
      return
    }
    dispatch(setBlockComplete(true))
    if (!conversation_id) {
      return
    }
    fetch(`/api/conversation/${conversation_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    }).catch((e) => {
      console.log(e)
    })
  }, [blocked, conversation_id])

  useEffect(() => {
    handleBlocked()
  }, [handleBlocked])

  if (message === null || message?.role === 'system') {
    return <></>
  }

  if (message?.role === 'user') {
    return (
      <div
        className="w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800">
        <div
          className="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0">
          <div className={'w-[30px]'}>
            <div className={'relative flex'}>
              <div className={'rounded-sm overflow-hidden'}>
                <Image src={user?.picture || ""} alt={user?.name || "avatar"} width={30} height={30} quality={80}
                       priority/>
              </div>
              {
                flagged && (
                  <div
                    className="absolute w-4 h-4 rounded-full text-[10px] flex justify-center items-center right-0 top-[20px] -mr-2 border border-white bg-orange-500 text-white">
                    <div>!</div>
                  </div>
                )
              }
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            {
              editMode ? (
                <div className="flex flex-grow flex-col gap-3">
                  {
                    blocked ? (
                      <div/>
                    ) : (
                      <textarea
                        className="m-0 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0"
                        style={{height: '24px', overflowY: 'hidden'}}>
                    {message?.content?.parts?.[0]}
                  </textarea>
                    )
                  }
                  <div className="text-center mt-2 flex justify-center">
                    <button className="btn relative btn-primary mr-2" onClick={() => {
                      // TODO: update message
                    }}>
                      <div className="flex w-full items-center justify-center gap-2">Save</div>
                    </button>
                    <button className="btn relative btn-neutral" onClick={() => {
                      setEditMode(false);
                    }}>
                      <div className="flex w-full items-center justify-center gap-2">Cancel</div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-grow flex-col gap-3">
                    <div
                      className={`min-h-[20px] flex flex-col items-start gap-4 ${flagged ? 'text-orange-500' : ''}`}>
                      {
                        blocked ? (
                          <div/>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              code({...props}) {
                                return <CodeFormat {...props} />
                              }
                            }}
                            className={`${!!showStreaming ? "result-streaming" : ""} markdown prose w-full break-words dark:prose-invert light`}>
                            {message?.content?.parts?.[0] || '...'}
                          </ReactMarkdown>
                        )
                      }

                      {flagged && (
                        <div
                          className="py-2 px-3 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-orange-500 bg-orange-500/10">
                          This content may violate our<a
                          rel={'noreferrer'} className={'underline'} href={'/doc/term'}
                          target={'_blank'}>content policy</a>. If you think this is wrong, please<a
                          rel={'noreferrer'}
                          className={'underline'}
                          href={'https://support.qq.com/products/566478'}
                          target={'_blank'}>submit your feedback</a>Repeated violations will result in your account
                          being banned.
                        </div>
                      )}
                    </div>
                  </div>
                  {/*<div*/}
                  {/*  className="text-gray-400 flex self-end lg:self-center justify-center mt-2 gap-3 md:gap-4 lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible">*/}
                  {/*  <button*/}
                  {/*    className="p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400 md:invisible md:group-hover:visible"*/}
                  {/*    onClick={() => {*/}
                  {/*      setEditMode(true)*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    <Edit2Icon/>*/}
                  {/*  </button>*/}
                  {/*</div>*/}
                </>
              )
            }
            <div className="flex justify-between"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#444654]">
      <div
        className="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0">
        <div className="w-[30px] flex flex-col relative items-end">
          <div
            className={`relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center ${model === 'gpt-4' ? '!bg-brand-purple' : '!bg-brand-green'}`}>
            <OpenAIIcon width={'30'}/>
            {
              flagged && (
                <div
                  className="absolute w-4 h-4 rounded-full text-[10px] flex justify-center items-center right-0 top-[20px] -mr-2 border border-white bg-orange-500 text-white">
                  <div>!</div>
                </div>
              )
            }
          </div>
        </div>
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
          <div className="flex flex-grow flex-col gap-3">
            <div className="min-h-[20px] flex flex-col items-start gap-4">
              {
                blocked ? (
                  <div/>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({...props}) {
                        return <CodeFormat {...props} />
                      }
                    }}
                    className={`${!!showStreaming ? "result-streaming" : ""} markdown prose w-full break-words dark:prose-invert light`}>
                    {message?.content?.parts?.[0] || '...'}
                  </ReactMarkdown>
                )
              }
              {!message?.content?.parts?.[0] && (
                <div
                  className="py-2 px-3 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-orange-500 bg-orange-500/10">
                  Sorry, it&apos;s not your fault. The server failed to respond, please try again later.
                </div>
              )}
              {flagged && (
                <div
                  className="py-2 px-3 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-orange-500 bg-orange-500/10">
                  This content may violate our<a
                  rel={'noreferrer'} className={'underline'} href={'/doc/term'}
                  target={'_blank'}>content policy</a>. If you think this is wrong, please<a
                  rel={'noreferrer'}
                  className={'underline'}
                  href={'https://support.qq.com/products/566478'}
                  target={'_blank'}>submit your feedback</a>Repeated violations will result in your account being
                  banned.
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between lg:block">
            <div/>
            <div
              className="text-gray-400 flex self-end lg:self-center justify-center mt-2 gap-3 md:gap-4 lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible">
              <button
                className="flex ml-auto gap-2 rounded-md p-1 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400"
                onClick={() => {
                  if (message?.content?.parts?.[0]) {
                    copy(message?.content?.parts?.[0])
                  } else {
                    copy('...')
                  }
                }}
              >
                <CopyIcon/>
              </button>
              <button
                className="p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400">
                <LikeIcon/>
              </button>
              <button
                className="p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400">
                <UnLikeIcon/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type DialogBoxItemProps = {
  id: string
  data: any
}

const DialogBoxItem: FC<DialogBoxItemProps> = ({id, data}) => {
  const [children_index, setChildren_index] = useState(0)
  const dispatch = useDispatch()
  const currentNodeId = useSelector((state: any) => state.session.currentNodeId)
  const isWaitComplete = useSelector((state: any) => state.session.isWaitComplete)
  const area = useSelector((state: any) => state.ui.area);

  const children = useMemo(() => {
    // filter used to remove the current id from the children list, so that the current id is not rendered twice
    return data?.mapping?.[id]?.children?.filter((c_id: string) => c_id !== id)?.map((id: string) => (
      <DialogBoxItem key={id} id={id} data={data}/>
    )) || []
  }, [data, id])

  useEffect(() => {
    if (children.length === 0) {
      dispatch(updateCurrentNodeId(id))
    }
  }, [children, dispatch, id])

  return (
    <>
      <BaseDialogBoxItem
        message={data?.mapping?.[id].message}
        id={id}
        currentNodeId={currentNodeId}
        isWaitComplete={isWaitComplete}
        area={area}
      />
      {
        children.length > 0 ? (
          children[children_index]
        ) : (
          <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
        )
      }
    </>
  )
}

export default DialogBoxItem
