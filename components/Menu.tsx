import {
  Box,
  Button,
  Spacer,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {FiLogOut, FiPlus, FiTrash2} from "react-icons/fi";
import {IoChatboxOutline} from "react-icons/io5";
import {CheckIcon, MoonIcon, SunIcon} from "@chakra-ui/icons";
import {
  clearSession,
  logout,
  setConversation,
  setPhotoUrl,
  setUsername
} from "@/store/user";
import {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";

const Menu = () => {
  const {colorMode, toggleColorMode} = useColorMode()
  const router = useRouter()
  const dispatch = useDispatch();
  const jwt = useSelector((state: any) => state.user.token);
  const session = useSelector((state: any) => state.user.session);
  const conversation = useSelector((state: any) => state.user.conversation);
  const [isWaitClear, setIsWaitClear] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const clearConversationList = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return
    }
    setIsWaitClear(true);
    const response = await fetch('/api/conversation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ids: conversation.map((c: any) => c.id),
        })
      }
    );
    if (!response.ok) {
      return
    }
    await getConversationHistory()
    dispatch(clearSession())
    setIsWaitClear(false);
    setDeleteConfirm(false);
    await router.push({
      pathname: `/chat`,
    })
  }

  const getConversationHistory = async () => {
    const response = await fetch('/api/conversation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await response.json();
    dispatch(setConversation(data.items || []));
  }

  const getUserSession = async () => {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await response.json();
    dispatch(setUsername(data.username));
    dispatch(setPhotoUrl(data.photo_url));
  }

  useEffect(() => {
    getUserSession()
  }, [])

  useEffect(() => {
    getConversationHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  return (
    <Stack h={'full'} p={2} spacing={2} bg={'bg1'} minW={'260px'} w={['full', 'full', '260px']}>
      <Button variant={'outline'} boxShadow={'md'} minH={'46px'} borderColor={'whiteAlpha.400'} _hover={{bg: 'bg3'}}
              leftIcon={<FiPlus color={'white'}/>} justifyContent={"start"} gap={1} color={"white"}
              onClick={async () => {
                await dispatch(clearSession());
                await router.push({
                  pathname: `/chat`,
                })
              }}>
        新建回话
      </Button>
      <Stack pt={2} h={'full'} overflow={"scroll"}>
        {conversation && conversation?.map((item: any) => (
          <Button key={item.id} variant={'ghost'} minH={'40px'} leftIcon={<IoChatboxOutline color={'white'}/>} gap={1}
                  _hover={{bg: 'bg3'}}
                  onClick={() => {
                    router.push({
                      pathname: `/chat/${item.id.split('#').pop()}`,
                    })
                  }}
          >
            <Text color={'gray.50'} textAlign={'start'} w={'full'} overflow={'hidden'} textOverflow={'ellipsis'}
                  whiteSpace={'nowrap'} fontSize={'sm'}>
              {item.title}
            </Text>
          </Button>
        ))}
      </Stack>
      <Spacer/>
      <Stack spacing={1}>
        <Box w={'full'} h={'1px'} bg={'whiteAlpha.400'}/>
        {
          conversation && conversation.length && (
            <Button variant={'ghost'} leftIcon={deleteConfirm ? <CheckIcon color={'white'}/> : <FiTrash2 color={'white'}/>}
                    gap={1} justifyContent={"start"} isLoading={isWaitClear} loadingText={'清除中...'}
                    color={'white'} _hover={{bg: 'bg3'}} onClick={clearConversationList}>
              {deleteConfirm ? '确认清空' : '清空记录'}
            </Button>
          )
        }
        <Button variant={'ghost'} gap={1} justifyContent={'start'} color={"white"}
                leftIcon={colorMode === 'light' ? <MoonIcon color={'white'}/> : <SunIcon color={'white'}/>}
                _hover={{bg: 'bg3'}} onClick={toggleColorMode}>
          {colorMode === 'light' ? '深色' : '浅色'}模式
        </Button>
        <Button variant={'ghost'} leftIcon={<FiLogOut color={'white'}/>} justifyContent={"start"} gap={1}
                color={'white'} _hover={{bg: 'bg3'}}
                onClick={async () => {
                  await dispatch(logout())
                  await router.push('/auth/login')
                }}>
          注销
        </Button>
      </Stack>
    </Stack>
  )
}

export default Menu