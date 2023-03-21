const throttle = <T extends Function>(func: T, timeout = 500) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const wrappedFunc = (...params: any) => {
    if (timer)
      return
    func(...params)
    timer = setTimeout(() => {
      timer = null
    }, timeout)
  }
  return <T>(<any>wrappedFunc)
}

export default throttle
