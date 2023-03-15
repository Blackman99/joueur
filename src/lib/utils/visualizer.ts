const createVisualizer = (canvas: HTMLCanvasElement, audio: HTMLAudioElement) => {
  let x = 0
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const audioCtx = new window.AudioContext()
  const audioSource = audioCtx.createMediaElementSource(audio)
  const analyser = audioCtx.createAnalyser()
  audioSource.connect(analyser)
  analyser.connect(audioCtx.destination)
  analyser.fftSize = 512
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  const barWidth = (canvas.width / bufferLength)
  const gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0)
  gradient.addColorStop(0, '#F83434')
  gradient.addColorStop(0.1, '#F86642')
  gradient.addColorStop(0.2, '#FFD529')
  gradient.addColorStop(0.3, '#69E227')
  gradient.addColorStop(0.4, '#3F9EF8')
  gradient.addColorStop(0.5, '#37D5D7')
  gradient.addColorStop(0.6, '#A82FE2')
  gradient.addColorStop(0.7, '#37D5D7')
  gradient.addColorStop(0.8, '#3F9EF8')
  gradient.addColorStop(0.9, '#69E227')
  gradient.addColorStop(1, '#F83434')
  function draw() {
    x = 0
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    analyser.getByteFrequencyData(dataArray)

    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i]
      ctx.fillStyle = 'rgba(0, 0, 0, .3)'
      // ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      ctx.lineTo(x, canvas.height - barHeight + 20)
      x += barWidth
    }

    ctx.strokeStyle = gradient
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.closePath()
    requestAnimationFrame(draw)
  }

  return {
    draw,
  }
}

export default createVisualizer
