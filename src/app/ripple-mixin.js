module.exports = rippleMixin

var getRelativeCoordinates = require('./relative-coordinates')
function rippleMixin (opts) {
  return {
    init: function () {
      var self = this
      this.root.addEventListener('click', function (e) {
        var parent = self.root
        if (opts.parent) parent = parent.querySelector(opts.parent)
        var ink = parent.querySelector('.ink')
        if (!ink) {
          var size = Math.max(parent.offsetWidth, parent.offsetHeight)
          ink = document.createElement('span')
          ink.className = 'ink'
          ink.style.width = size + 'px'
          ink.style.height = size + 'px'
          parent.appendChild(ink)
        }

        ink.className = ink.className.replace(' animate', '')
        var x, y
        var offset = getRelativeCoordinates(parent, e)
        x = offset.x - ink.offsetWidth / 2
        y = offset.y - ink.offsetHeight / 2

        ink.style.top = y + 'px'
        ink.style.left = x + 'px'
        ink.className += ' animate'
      })
    }
  }
}
