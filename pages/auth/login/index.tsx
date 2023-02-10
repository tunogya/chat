import {
  Button, FormControl, FormErrorMessage, FormHelperText,
  HStack, Input, InputGroup, InputRightElement,
  Stack,
  Text
} from "@chakra-ui/react";
import {useMemo, useState} from "react";
import {useRouter} from "next/router";

const Login = () => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  const isInvalidPassword = useMemo(() => {
    // need at last 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
    return !!password && !regex.test(password)
  }, [password])

  const login = async () => {
    setPending(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      }),
    })
    if (res.status === 200) {
      const {token} = await res.json()
      console.log(token)
      await router.push('/chat')
    } else {
      const {error} = await res.json()
      await router.push({
        pathname: '/auth/error',
        query: {
          error
        }
      })
    }
  }

  return (
    <Stack h={'100vh'} w={'full'} justify={"center"} align={"center"} spacing={3}>
      <Text textAlign={"center"} fontSize={'sm'}>
        Welcome to ChatGPT via WizardingPay<br/>
        Log in with your account to continue
      </Text>
      <Stack w={'280px'}>
        <FormControl>
          <InputGroup variant={'outline'}>
            <Input placeholder={'Username'} value={username} onChange={(e) => setUsername(e.target.value)}/>
          </InputGroup>
        </FormControl>
        <FormControl isInvalid={isInvalidPassword}>
          <InputGroup variant={'outline'}>
            <Input placeholder={'Password'} type={show ? 'text' : 'password'} value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
          { isInvalidPassword ? (
            <FormErrorMessage fontSize={'xs'}>
              at last 12 chars, contains A-Z, a-z, 0-9, @$!%*?&
            </FormErrorMessage>
          ) : (
            <FormHelperText fontSize={'xs'}>
              at last 12 chars, contains A-Z, a-z, 0-9, @$!%*?&
            </FormHelperText>
          ) }
        </FormControl>
      </Stack>
      <HStack spacing={3}>
        <Button isDisabled={!username || !password || isInvalidPassword} onClick={login} isLoading={pending}>
          Login in or Sign up
        </Button>
      </HStack>
    </Stack>
  )
}

export default Login