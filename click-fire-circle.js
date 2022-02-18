/*
 * @Author       : Archer<ahh666@qq.com>
 * @Date         : 2022-01-19 16:48:25
 * @LastEditors  : Archer<ahh666@qq.com>
 * @LastEditTime : 2022-01-24 17:16:59
 * @FilePath     : \fireworks\clickFireworks.js
 * @Description  : 点击绽放烟花：以圆形为基础绘制烟花，烟花绽放为圆形规则
 */

const random = (min, max) => {
  let _max = max
  let _min = min

  if (!max) {
    _max = min
    _min = 0
  }

  if (max < min) {
    _max = min
    _min = max
  }

  return Math.floor(Math.random() * (_max - _min + 1)) + _min
}

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
    this.sum = options.sum || 12
    this.radius = 4
    this.size = 4
    this.speed = 3
    this.color = this.getRandomColor()
    this.alpha = 1
    this.x = options.x || 0
    this.y = options.y || 0
    this.animation = null
    this.step = 0
    this.init()
  }
  init() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  getRandomColor(alpha = 1) {
    const r = Math.round(random(120, 225))
    const g = Math.round(random(120, 225))
    const b = Math.round(random(120, 225))
    return `rgba(${r},${g},${b},${alpha})`
  }
  draw() {
    this.radius += this.speed
    this.y += this.step * 0.09
    this.step++
    // 下落消失效果的透明度
    if (this.radius > 60) {
      this.alpha -= this.step * 0.0008
      const rgb = this.color.split(',')
      this.color = `${rgb[0]},${rgb[1]},${rgb[2]},${this.alpha})`
      // 回收烟花
      if (this.alpha < -5) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.cancel()
      }
    }
    // 由一个点 x, y 确定一个圆
    for (let i = 0; i < this.sum; i++) {
      const angle = (360 / this.sum) * i // 角度
      const radian = (angle * Math.PI) / 180 // 弧度
      // 围成圆的各个点坐标
      const pointX = this.x + Math.cos(radian) * this.radius
      const pointY = this.y + Math.sin(radian) * this.radius

      this.ctx.beginPath()
      this.ctx.arc(pointX, pointY, this.size, 0, Math.PI * 2)
      this.ctx.closePath()
      this.ctx.fillStyle = this.color
      this.ctx.fill()
    }
  }
  fire() {
    // this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 拖影
    this.ctx.fillStyle = 'rgba(0,0,0,0.1)'
    this.ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.draw()
    // 动画
    this.animation = window.requestAnimationFrame(this.fire.bind(this))
  }
  cancel() {
    window.cancelAnimationFrame(this.animation)
    // this.ctx.clearRect(0,0,canvas.width,canvas.height)
  }
}
