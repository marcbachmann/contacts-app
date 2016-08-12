module.exports = getRelativeCoordinates

function getRelativeCoordinates (container, e) {
  var pos = {
    x: e.touches ? e.touches[0].pageX : e.pageX,
    y: e.touches ? e.touches[0].pageY : e.pageY
  }

  var offset = {
    left: container.offsetLeft,
    top: container.offsetTop
  }

  var ref = container.offsetParent
  while (ref) {
    offset.left += ref.offsetLeft
    offset.top += ref.offsetTop
    ref = ref.offsetParent
  }

  return {
    x: pos.x - offset.left,
    y: pos.y - offset.top
  }
}
