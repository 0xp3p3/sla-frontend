import { useEffect, useState } from "react"


interface TimeLeft {
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
}

const computeTimeLeft = (target: Date): TimeLeft => {
  let timeLeft = {
    days: 0, hours: 0, minutes: 0, seconds: 0
  }

  const difference = +target - Date.now()
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  return timeLeft
}


interface Props {
  date: Date | null,
}

const CountDown = (props: Props) => {
  const [isCountdownLive, setIsCountdownLive] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>()
  const [isLive, setIsLive] = useState(false)

  // Start the countdown when the `date` is no longer `null`
  useEffect(() => {
    if (props.date) {
      setIsCountdownLive(true)
    }
  }, [props.date])

  // Upddate the countdown every second
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isCountdownLive && props.date) {
        const t = computeTimeLeft(props.date)
        setTimeLeft(t)
        setIsLive(t.days == 0 && t.hours == 0 && t.minutes == 0 && t.seconds == 0)
      } else {
        setIsLive(false)
      }
    }, 1000)  // update the countdown every 1000ms

    return () => clearTimeout(timer)
  })

  const timercomponents = []

  if (timeLeft) {
    Object.keys(timeLeft).forEach((interval) => {
      timercomponents.push(
        <div className="countdown-wrap" key={interval}>
          <h2 id={interval} className="h3">{timeLeft[interval]}</h2>
          <div className="p1">{interval.toUpperCase()}</div>
        </div>
      )
    })
  }

  return (
    <>
      {isLive ? <h1 className="h1">minting now</h1> : <h1 className="h-big">coming soon</h1>}
      <div className="w-layout-grid counter-grid">
        {timercomponents}
      </div>
    </>
  )
}

export default CountDown