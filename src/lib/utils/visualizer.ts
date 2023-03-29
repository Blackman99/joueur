const createVisualizer = (canvas: HTMLCanvasElement, audio: HTMLAudioElement) => {
  let x = 0
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const audioCtx = new window.AudioContext()
  const audioSource = audioCtx.createMediaElementSource(audio)
  const analyser = audioCtx.createAnalyser()
  audioSource.connect(analyser)
  analyser.connect(audioCtx.destination)
  analyser.fftSize = 256
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
    analyser.getByteTimeDomainData(dataArray)

    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i]
      ctx.fillStyle = 'rgba(0, 0, 0, .3)'
      ctx.lineTo(x, canvas.height - barHeight)
      x += barWidth
    }

    ctx.strokeStyle = gradient
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.closePath()
    requestAnimationFrame(draw)
  }

  function drawWave() {
    const sliceWidth = canvas.width / bufferLength
    x = 0
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    analyser.getByteTimeDomainData(dataArray)

    ctx.beginPath()

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * (canvas.height / 2)

      if (i === 0)
        ctx.moveTo(x, y)
      else
        ctx.lineTo(x, y)

      x += sliceWidth
    }
    ctx.strokeStyle = gradient
    ctx.globalAlpha = 0.8
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    ctx.closePath()
    requestAnimationFrame(drawWave)
  }
  

  return {
    draw,
    drawWave,
  }
}

export default createVisualizer
