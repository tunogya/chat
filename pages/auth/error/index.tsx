import {useRouter} from 'next/router';
import OpenAIIcon from "@/components/SVG/OpenAIIcon";

const Error = () => {
  const router = useRouter()
  const {error} = router.query

  return (
    <div className="w-full h-full flex justify-center items-center flex-col bg-gray-50 dark:bg-gray-800">
      <div className="w-96 flex flex-col justify-center items-center">
        <div className="mb-5">
          <OpenAIIcon/>
        </div>
        <div className="mb-2 text-center text-lg">呀！</div>
        <div className="mb-5 text-center">{error}</div>
        <button className="btn relative btn-neutral" onClick={() => router.back()}>
          <div className="flex w-full items-center justify-center gap-2">返回</div>
        </button>
      </div>
    </div>
  )
}

export default Error

