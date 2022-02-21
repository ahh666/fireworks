/*
 * @Author       : Archer<ahh666@qq.com>
 * @Date         : 2022-02-09 11:03:27
 * @LastEditors  : Archer<ahh666@qq.com>
 * @LastEditTime : 2022-02-21 09:58:39
 * @FilePath     : \fireworks\auto-fire.js
 * @Description  : 自动播放烟花
 */

var random = (a, b) => Math.random() * (b - a) + a

var getRandomColor = (alpha = 1) => {
  const r = Math.round(random(120, 225))
  const g = Math.round(random(120, 225))
  const b = Math.round(random(120, 225))
  return `rgba(${r},${g},${b},${alpha})`
}

class Fireworks {
  constructor(ctx, options = {}) {
    this.ctx = ctx
    this.minSum = options.minSum || 10
    this.maxSum = options.maxSum || 40
    this.size = options.size || 2.5
    this.color = getRandomColor()
    this.x = options.x || 0
    this.y = options.y || 0
    this.animation = null
    this.fireworkGroup = [] // 存放粒子实例
    this.upTargetY = options.upHeight // 上升的目标位置

    this.canBlast = false
    this.upController = null

    this.blastOver = false

    this.init()
  }

  init() {
    this.draw()
  }
  // 获取上升动画实例
  getUpController(x, y) {
    const options = {
      x,
      y,
    }
    return new TrackMover(this.ctx, options)
  }

  fireworkItemController(_x, _y) {
    let x = _x
    let y = _y
    // 粒子数量及其运动轨迹都完全随机
    const sum = Math.round(random(this.minSum, this.maxSum))
    for (let i = 0; i < sum; i++) {
      const angle = random(0, 2 * Math.PI)
      const range = Math.round(random(50, 300))

      // 确定粒子运动的最终坐标
      const targetX = x + range * Math.cos(angle)
      const targetY = y + range * Math.sin(angle)

      const color = getRandomColor()
      // 粒子参数
      const options = {
        x,
        y,
        targetX,
        targetY,
        color,
        size: this.size,
      }
      const fireworkItem = new FireworkItem(this.ctx, options)

      this.fireworkGroup.push(fireworkItem)
    }
  }

  draw() {
    this.upController = this.getUpController(this.x, this.y)
    const { x, targetY } = this.upController
    this.fireworkItemController(x, targetY)
  }

  // 爆炸效果
  blast() {
    const { overFlag } = this.upController
    if (!overFlag) {
      this.upController.move()
      return
    }
    this.fireworkGroup.forEach((item, idx) => {
      item.move()
      if (item.disappear) {
        this.fireworkGroup.splice(idx, 1)
      }
      if (this.fireworkGroup.length === 0) {
        this.blastOver = true
      }
    })
  }
}

class AutoFire {
  constructor(canvas, fireworkSum) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.sum = fireworkSum || 6
    this.fireworks = []
    this.fillFireworks()
    this.fire()
  }

  createFirework() {
    const { innerWidth, innerHeight } = window
    const x = random(100, innerWidth - 100)
    const y = random(innerHeight, innerHeight + 500)
    const firework = new Fireworks(this.ctx, {
      x,
      y,
      upHeight: random(innerHeight - 300, 300),
      minSum: 20,
      maxSum: 40,
    })
    return firework
  }

  fillFireworks() {
    for (let i = 0; i < this.sum; i++) {
      this.fireworks.push(this.createFirework())
    }
  }

  fire() {
    // this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 拖影
    this.ctx.fillStyle = 'rgba(0,0,0,0.08)'
    this.ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.fireworks.length &&
      this.fireworks.forEach((item, idx) => {
        item.blast()
        if (item.blastOver) {
          this.fireworks.splice(idx, 1)
          this.fireworks.push(this.createFirework())
        }
      })

    // 动画
    this.animation = window.requestAnimationFrame(this.fire.bind(this))
  }

  cancel() {
    window.cancelAnimationFrame(this.animation)
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// 粒子
class FireworkItem {
  constructor(ctx, options = {}) {
    this.ctx = ctx
    this.x = options.x
    this.y = options.y
    this.targetX = options.targetX // 运动最终位置
    this.targetY = options.targetY
    this.color = options.color
    this.size = options.size

    this.disappear = false // 回收标记
    this.step = 1 // 用于控制回收时机
  }

  draw() {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x, this.y, this.size, this.size)
    this.ctx.restore()
  }

  move() {
    this.draw()
    // 控制粒子运动轨迹 :)这里很关键
    this.targetY += 0.5
    // this.targetY = this.targetY * 0.01 + this.targetY

    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    this.x = Math.abs(dx) < 0.1 ? this.targetX : this.x + dx * 0.01
    this.y = Math.abs(dy) < 0.1 ? this.targetY : this.y + dy * 0.01

    this.step -= 0.03
    // 回收
    if (this.step < -1) {
      this.disappear = true
    }
  }
}

// 上升轨迹
class TrackMover {
  constructor(ctx, options = {}) {
    this.x = options.x
    this.y = options.y
    this.ctx = ctx
    this.targetY = random(innerHeight / 2, innerHeight * 0.1)
    this.overFlag = false
    this.color = getRandomColor()
    this.speed = options.speed || 5
  }
  draw() {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, 4, 0, Math.PI * 2)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
    this.ctx.restore()
  }
  move() {
    this.draw()
    this.y -= this.speed
    if (this.y < this.targetY) {
      this.overFlag = true
    }
  }
}

// const canvas = document.querySelector('canvas')
// canvas.width = window.innerWidth
// canvas.height = window.innerHeight

// new AutoFire(canvas, 8)
