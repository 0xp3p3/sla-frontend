import { useEffect, useState } from "react"


const extractEnvVar = (value: string | null): string | null => {
  return (value && (value !== 'null')) ? value! : null
} 


const useCountdown = () => {
  const goLiveDate = extractEnvVar(process.env.NEXT_PUBLIC_PRESALE_START) ? new Date(process.env.NEXT_PUBLIC_PRESALE_START!) : null
  const countDownDate = goLiveDate ? new Date(goLiveDate).getTime() : null

  const [countDown, setCountDown] = useState<number | null>(
    countDownDate ? countDownDate - new Date().getTime() : null
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate ? countDownDate - new Date().getTime() : null)
    }, 1000)

    return () => clearInterval(interval);
  }, [countDownDate])

  const isLive = () => {
    return goLiveDate && countDown <= 0
  }

  return { goLiveDate, countDown, isLive }
}

export default useCountdown