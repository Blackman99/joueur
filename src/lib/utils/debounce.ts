type DebounceFun<T, R> = (params?: T) => R

const debounce = <T extends Array<any> = any[], R = any>(func: DebounceFun<T, R>, timeout = 500) => {
  let timer: ReturnType<typeof setTimeout>

  return (...params: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...params)
    }, timeout)
  }
}

export default debounce
