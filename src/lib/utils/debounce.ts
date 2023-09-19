const debounce = <T extends Function>(func: T, timeout = 500) => {
  let timer: ReturnType<typeof setTimeout>

  const wrappedFunc = (...params: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...params)
    }, timeout)
  }
  return <T>(<any>wrappedFunc)
}

export default debounce
