/*
 * @Author       : Archer<ahh666@qq.com>
 * @Date         : 2022-02-09 11:03:27
 * @LastEditors  : Archer<ahh666@qq.com>
 * @LastEditTime : 2022-02-21 10:28:49
 * @FilePath     : \fireworks\click-fire-has-up.js
 * @Description  : 在点击位置播放烟花，一端固定，带上升效果
 */

var random = (a, b) => Math.random() * (b - a) + a

var getRandomColor = (alpha = 1) => {
  const r = Math.round(random(120, 225))
  const g = Math.round(random(120, 225))
  const b = Math.round(random(120, 225))
  return `rgba(${r},${g},${b},${alpha})`
}

class FireworksOfClick {
  constructor(canvas, options = {}) {
    this.ctx = canvas.getContext('2d')
    this.minSum = options.minSum || 10
    this.maxSum = options.maxSum || 40
    this.size = options.size || 2.5
    this.color = getRandomColor()
    this.x = options.x || 0
    this.y = options.y || 0
    this.animation = null
    this.fireworkGroup = [] // 存放粒子实例
    this.upTargetY = random(300, 500) + this.y // 上升的目标位置

    this.canBlast = false
    this.upController = null

    this.init()
  }

  init() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.draw()
  }

  // 获取上升动画实例
  getUpController(x, y) {
    // 烟花放置位置，位于视口中间
    const options = {
      x: window.innerWidth / 2,
      y: window.innerHeight - 5,
      targetX: x,
      targetY: y,
    }
    return new TrackMoverOfClick(this.ctx, options)
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
      const fireworkItem = new FireworkItemOfClick(this.ctx, options)

      this.fireworkGroup.push(fireworkItem)
    }
  }

  draw() {
    this.upController = this.getUpController(this.x, this.y)
    this.fireworkItemController(this.x, this.y)
  }

  // 爆炸效果
  blast() {
    const { overFlag } = this.upController
    if (!overFlag) {
      return
    }
    this.fireworkGroup.forEach((item, idx) => {
      item.move()
      if (item.disappear) {
        this.fireworkGroup.splice(idx, 1)
      }
    })
  }

  fire() {
    // this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 拖影
    this.ctx.fillStyle = 'rgba(0,0,0,0.1)'
    this.ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (this.upController.overFlag) {
      this.blast()
    } else {
      this.upController.move()
    }

    // 动画
    this.animation = window.requestAnimationFrame(this.fire.bind(this))
  }

  cancel() {
    window.cancelAnimationFrame(this.animation)
    // this.ctx.clearRect(0,0,canvas.width,canvas.height)
  }
}

// 粒子
class FireworkItemOfClick {
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
    // this.targetY += 0.6
    this.targetY += 0.9
    // this.targetY = this.targetY * 0.01 + this.targetY

    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    this.x = Math.abs(dx) < 0.1 ? this.targetX : this.x + dx * 0.01
    this.y = Math.abs(dy) < 0.1 ? this.targetY : this.y + dy * 0.01

    this.step -= 0.04
    // 回收
    if (this.step < -1) {
      this.disappear = true
    }
  }
}

// 上升轨迹
class TrackMoverOfClick {
  constructor(ctx, options = {}) {
    // 上升的初始位置
    this.x = options.x
    this.y = options.y
    this.ctx = ctx
    this.targetX = options.targetX
    this.targetY = options.targetY
    this.overFlag = false
    this.color = getRandomColor()
    this.ySpeed = options.ySpeed || 9
    this.xSpeed = (this.targetX - this.x) / ((this.targetY - this.y) / this.ySpeed)
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
    this.x -= this.xSpeed
    this.y -= this.ySpeed
    if (this.y < this.targetY) {
      this.overFlag = true
    }
  }
}

// const canvas = document.querySelector('canvas')
// canvas.width = 0
// canvas.height = 0

// let fireworks = null

// const clickSite = e => {
//   const opts = {
//     x: e.clientX,
//     y: e.clientY,
//     minSum: 20,
//     maxSum: 40,
//   }
//   fireworks && fireworks.cancel()
//   fireworks = new FireworksOfClick(canvas, opts)
//   fireworks.fire()
// }

// window.addEventListener('click', clickSite)
