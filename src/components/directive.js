import $ from 'jquery'

export const focus = {
  update(value) {
    if (value) this.el.focus()
  },
}

export const blur = {
  update(value) {
    if (value) this.el.blur()
  },
}

export const selection = {
  bind() {
    this.listen()
  },
  listen() {
    if (!this.handler) {
      $(this.el).on('focus', this.handler = () => {
        setImmediate(() => { this.el.select() })
      })
    }
  },
  unlisten() {
    if (this.handler) {
      $(this.el).off('focus', this.handler)
    }
  },
  unbind() {
    this.unlisten()
  },
}