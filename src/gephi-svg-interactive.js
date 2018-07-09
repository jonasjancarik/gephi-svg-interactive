// var Snap = require('snapsvg');
// import Draggable from 'gsap/Draggable';
var CSSPlugin = require('gsap/umd/CSSPlugin')
var Draggable = require('gsap/umd/Draggable')

var plugins = [CSSPlugin, Draggable]; // prevent tree shaking

(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    factory(require('jquery'), window, document)
  } else {
    factory(jQuery, window, document)
  }
}(function ($, window, document, undefined) {
  $.fn.gephiSvgInteractive = function (options) {
    return this.each(function () {
      // Default options
      var optionsDefault = {
        class: null,
        cursor: 'pointer'
      }

      // apply defaults where options were not set
      Object.keys(optionsDefault).forEach(function (option) {
        if (!options[option]) {
          options.option = optionsDefault[option]
        }
      })

      options.class ? $(this).addClass(options.class) : null
      options.cursor ? $(this).find('#edges path, #nodes circle, #node-labels text').css('cursor', options.cursor) : null

      // dragability

      // store values in data attributes - origin and target of edges and positions of labels
      $(this).find('path').each(function () {
        $(this).attr('data-from', $(this).attr('class').split(' ')[0])
        $(this).attr('data-to', $(this).attr('class').split(' ')[1])
      })
      $(this).find('text').each(function () {
        $(this).attr('data-x-original', $(this).attr('x'))
        $(this).attr('data-y-original', $(this).attr('y'))
      })

      Draggable.create('text', { // todo: circle dragging doesn't work correctly if previously dragged by label. Attempted fix by saving offset in data-
        // bounds: thisId, // commented out as this causes all circles to be placed in the top left corner. Todo: investigate
        onDragStart: function () {
          var target = this.target
          $(this.target.nearestViewportElement).find('circle.' + target.classList[0]).each(function () {
            $(this).attr('data-transform', $(this).attr('transform'))
          })
        },
        onDrag: function () {
          var target = this.target

          var xOffset = Number(this.x)
          var yOffset = Number(this.y)

          if (this.target.tagName === 'circle') {
            var xBase = Number(target.attributes.cx.value)
            var yBase = Number(target.attributes.cy.value)

            $(this.target.nearestViewportElement).find('path[data-from=' + target.classList[0] + ']').each(function () {
              var dArray = $(this).first().attr('d').split(' ')
              var newX = xBase + xOffset
              var newY = yBase + yOffset
              dArray[1] = newX + ',' + newY
              $(this).attr('d', dArray.join(' '))
            })

            $(this.target.nearestViewportElement).find('path[data-to=' + target.classList[0] + ']').each(function () {
              var dArray = $(this).first().attr('d').split(' ')
              var newX = xBase + xOffset
              var newY = yBase + yOffset
              dArray[5] = newX + ',' + newY
              $(this).attr('d', dArray.join(' '))
            })

            $(this.target.nearestViewportElement).find('text.' + target.classList[0]).each(function () {
              var newX = xOffset + Number($(this).attr('data-x-original'))
              var newY = yOffset + Number($(this).attr('data-y-original'))
              $(this).attr('x', newX)
              $(this).attr('y', newY)
            })

            // correct self - todo: fix. Circle offset changes if dragged first by label
            $(this.target.nearestViewportElement).find('circle.' + target.classList[0]).each(function () {
              if ($(this).attr('data-transform')) {
                var newXoffset = Number($(this).attr('data-transform').split(',')[4]) + xOffset
                var newYoffset = Number($(this).attr('data-transform').split(',')[5].replace(')', '')) + yOffset
                $(this).attr('transform', 'matrix(1,0,0,1,' + newXoffset + ',' + newYoffset + ')')
              }
            })
          } else if (this.target.tagName === 'text') {
            xBase = Number($(this.target.nearestViewportElement).find('circle.' + target.classList[0]).attr('cx'))
            yBase = Number($(this.target.nearestViewportElement).find('circle.' + target.classList[0]).attr('cy'))

            $(this.target.nearestViewportElement).find('path[data-from=' + target.classList[0] + ']').each(function () {
              var dArray = $(this).first().attr('d').split(' ')
              var newX = xBase + xOffset
              var newY = yBase + yOffset
              dArray[1] = newX + ',' + newY
              $(this).attr('d', dArray.join(' '))
            })

            $(this.target.nearestViewportElement).find('path[data-to=' + target.classList[0] + ']').each(function () {
              var dArray = $(this).first().attr('d').split(' ')
              var newX = xBase + xOffset
              var newY = yBase + yOffset
              dArray[5] = newX + ',' + newY
              $(this).attr('d', dArray.join(' '))
            })

            $(this.target.nearestViewportElement).find('circle.' + target.classList[0]).each(function () {
              // var newXoffset = Number($(this).attr('transform').split(',')[4]) + xOffset
              // var newYoffset = Number($(this).attr('transform').split(',')[5].replace(')', '')) + yOffset
              $(this).attr('transform', 'matrix(1,0,0,1,' + xOffset + ',' + yOffset + ')')
            })
          }
        }
      })

      // bind to the click event
      $(this).bind('click.gephiSvgInteractive', function () {
        // check if the click was on one of the SVG child elements
        if (event.target !== this) {
          // set the clicked element as the target
          var target = $(event.target)

          // if the click is on an edge path
          if (target.is('#edges path')) {
            // get the class of the path - refers to the linked nodes
            var classNames = target.attr('class').split(' ')

            // lower opacity of everything
            target.parents('svg').find('path,circle,text').css('opacity', '0.1')

            // (re)set clicked path to full opacity
            target.css('opacity', '1')

            classNames.forEach(function (className) {
              target.parents('svg').find('#nodes .' + className + ', #node-labels .' + className).css('opacity', '1')
            })
          } else if (target.is('#node-labels text') || target.is('#nodes circle')) { // if a label or a node itself was clicked
            // get the ID of the node - this is the same as the label field in Gephi
            var nodeId = target.attr('class')

            // lower opacity of everything
            target.parents('svg').find('path,circle,text').css('opacity', '0.1')

            // (re)set paths linked to the clicked node (they will have the node ID as a class) and the node itself to full opacity
            target.parents('svg').find('#edges path.' + nodeId + ', #nodes circle.' + nodeId + ', #node-labels text.' + nodeId).css('opacity', '1')
          }
        } else { // reset the view
          $(this).find('path, circle, text').css('opacity', '1')
        }
      })
    })
  }
}))
