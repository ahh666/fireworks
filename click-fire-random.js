/*
 * @Author       : Archer<ahh666@qq.com>
 * @Date         : 2022-02-09 11:03:27
 * @LastEditors  : Archer<ahh666@qq.com>
 * @LastEditTime : 2022-02-17 15:21:33
 * @FilePath     : \fireworks\click-fire-random.js
 * @Description  : 点击放烟花：烟花粒子运动轨迹随机
 */

const random = (a, b) => Math.random() * (b - a) + a

const canvas = document.querySelector('canvas')
canvas.width = 0
canvas.height = 0

let fireworks = null

const clickSite = e => {
  const opts = {
    x: e.clientX,
    y: e.clientY,
  }
  fireworks && fireworks.cancel()
  fireworks = new Fireworks(canvas, opts)
  fireworks.fire()
}

window.addEventListener('click', clickSite)

class Fireworks {
  constructor(canvas, options = {}) {
    this.ctx = canvas.getContext('2d')
    this.minSum = options.minSum || 10
    this.maxSum = options.maxSum || 40
    this.size = options.size || 2.5
    this.color = this.getRandomColor()
    this.x = options.x || 0
    this.y = options.y || 0
    this.animation = null
    this.fireworkGroup = [] // 存放粒子实例
    this.init()
  }

  init() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.draw()
  }

  getRandomColor(alpha = 1) {
    const r = Math.round(random(120, 225))
    const g = Math.round(random(120, 225))
    const b = Math.round(random(120, 225))
    return `rgba(${r},${g},${b},${alpha})`
  }

  draw() {
    let x = this.x
    let y = this.y
    // 粒子数量及其运动轨迹都完全随机
    const sum = Math.round(random(this.minSum, this.maxSum))
    for (let i = 0; i < sum; i++) {
      const angle = random(0, 2 * Math.PI)
      const range = Math.round(random(50, 300))

      // 确定粒子运动的最终坐标
      const targetX = x + range * Math.cos(angle)
      const targetY = y + range * Math.sin(angle)

      const color = this.getRandomColor()
      // 粒子参数
      const options = {
        x,
        y,
        targetX,
        targetY,
        color,
        size: this.size,
      }
      const fireworkItem = new CreateFireworkItem(this.ctx, options)

      this.fireworkGroup.push(fireworkItem)
    }
  }

  // 爆炸效果
  blast() {
    this.fireworkGroup.forEach((item, idx) => {
      item.draw()
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

    this.blast()
    // 动画
    this.animation = window.requestAnimationFrame(this.fire.bind(this))
  }

  cancel() {
    window.cancelAnimationFrame(this.animation)
    // this.ctx.clearRect(0,0,canvas.width,canvas.height)
  }
}

// 粒子
class CreateFireworkItem {
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
    // 控制粒子运动轨迹 :)这里很关键
    // this.targetY += 0.5
    this.targetY += 0.99
    this.targetY = this.targetY * 0.01 + this.targetY

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
