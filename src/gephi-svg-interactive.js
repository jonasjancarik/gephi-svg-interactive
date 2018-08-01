/* eslint-env browser */
var CSSPlugin = require('gsap/umd/CSSPlugin')
var Draggable = require('gsap/umd/Draggable')
var TweenLite = require('gsap/umd/TweenLite')

// prevent Browserify tree shaking
var GSAPplugins = [CSSPlugin, Draggable, TweenLite]; // eslint-disable-line no-unused-vars

(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    factory(require('jquery'), window, document)
  } else {
    factory(jQuery, window, document) // eslint-disable-line no-undef
  }
}(function ($, window, document) {
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
          options[option] = optionsDefault[option]
        }
      })

      // apply supplied options
      options.class && $(this).addClass(options.class)
      options.cursor && $(this).find('#edges path, #nodes circle, #node-labels text').css('cursor', options.cursor)

      // ===========
      // Dragability
      // ===========

      // initialise tweenlite properties
      TweenLite.set('circle', { x: '+=0' })
      TweenLite.set('text', { x: '+=0' })

      // store values in data attributes - origin and target of edges and positions of labels
      $(this).find('path').each(function () {
        $(this).attr('data-from', $(this).attr('class').split(' ')[0])
        $(this).attr('data-to', $(this).attr('class').split(' ')[1])
      })

      Draggable.create('text', {
        onDrag: function () {
          // when a label (text element) is dragged, linked elements (the node and linked edges) will be moved too using the moveCompanions function
          moveCompanions(selectCompanions(this), this)
        }
      })

      function selectCompanions (draggedObject) {
        // todo: support companion groups to move multiple nodes (e.g. same modularity group) at once
        // identifying groups:
        // var nodeGroups = {}
        // $('#nodes circle').each(function () {

        //   if (!nodeGroups[$(this).attr('fill')]) {
        //     nodeGroups[$(this).attr('fill')] = []
        //   } else {
        //     nodeGroups[$(this).attr('fill')].push($(this).attr('class'))
        //   }

        // })
        var companionsAll = $('#' + draggedObject.target.nearestViewportElement.id + ' .' + draggedObject.target.classList[0])
        var i = companionsAll.length
        var companions = []
        while (--i > -1) {
          if (companionsAll[i] !== draggedObject.target) {
            companions.push(companionsAll[i])
          }
        }
        return companions
      }

      function moveCompanions (companions, draggedObject) {
        // first, get new x and y positions based on the position of the node circle (the label has an offset from the node)
        var xNew, yNew

        companions.forEach(function (companion) {
          if (companion.tagName === 'circle') {
            xNew = Number(companion.attributes.cx.value) + companion._gsTransform.x + draggedObject.deltaX
            yNew = Number(companion.attributes.cy.value) + companion._gsTransform.y + draggedObject.deltaY
          }
        })

        // then go through all companions and move them
        companions.forEach(function (companion) {
          if (companion.tagName === 'circle') {
            // move the node circle
            TweenLite.set(companion, { x: companion._gsTransform.x + draggedObject.deltaX, y: companion._gsTransform.y + draggedObject.deltaY })
          } else if (companion.tagName === 'path') {
            // move edges
            if (companion.attributes['data-from'].value === draggedObject.target.classList[0]) {
              // move outcoming edges
              $(draggedObject.target.nearestViewportElement).find('path[data-from="' + draggedObject.target.classList[0] + '"]').each(function () {
                var dArray = $(this).attr('d').split(' ')
                dArray[1] = xNew + ',' + yNew
                $(this).attr('d', dArray.join(' '))
              })
            } else if (companion.attributes['data-to'].value === draggedObject.target.classList[0]) {
              // move incoming edges
              $(draggedObject.target.nearestViewportElement).find('path[data-to="' + draggedObject.target.classList[0] + '"]').each(function () {
                var dArray = $(this).attr('d').split(' ')
                dArray[5] = xNew + ',' + yNew
                $(this).attr('d', dArray.join(' '))
              })
            }
          }
        })
      }

      Draggable.create('circle', {
        // bounds: $('#' + this.id).parent(), // fix: doesn't work with multiple visualisations
        onDrag: function () {
          var target = this.target

          var xOffset = this.x
          var yOffset = this.y

          // get starting position of the node (circle)
          var xBase = Number(target.attributes.cx.value)
          var yBase = Number(target.attributes.cy.value)

          $(target.nearestViewportElement).find('circle.' + target.classList[0]).removeAttr('data-moved-by-another')

          $(target.nearestViewportElement).find('path[data-from=' + target.classList[0] + ']').each(function () {
            var dArray = $(this).first().attr('d').split(' ')
            dArray[1] = (xBase + xOffset) + ',' + (yBase + yOffset)
            $(this).attr('d', dArray.join(' '))
          })

          $(target.nearestViewportElement).find('path[data-to=' + target.classList[0] + ']').each(function () {
            var dArray = $(this).first().attr('d').split(' ')
            dArray[5] = (xBase + xOffset) + ',' + (yBase + yOffset)
            $(this).attr('d', dArray.join(' '))
          })

          $(target.nearestViewportElement).find('text.' + target.classList[0]).each(function () {
            TweenLite.set(this, { x: xOffset, y: yOffset })
          })
        }
      })

      // ==============================================
      // Click events - highlighting parts of the graph
      // ==============================================

      $(this).bind('click.gephiSvgInteractive', function () {
        // check if the click was on one of the SVG child elements
        if (event.target !== this) {
          // set the clicked element as the target
          var target = $(event.target)

          if (target.is('#edges path')) {
            // if the click is on an edge path

            // get the class of the path - refers to the linked nodes
            var classNames = target.attr('class').split(' ')

            // lower opacity of everything
            target.parents('svg').find('path,circle,text').css('opacity', '0.1')

            // (re)set clicked path to full opacity
            target.css('opacity', '1')

            classNames.forEach(function (className) {
              target.parents('svg').find('#nodes .' + className + ', #node-labels .' + className).css('opacity', '1')
            })
          } else if (target.is('#node-labels text') || target.is('#nodes circle')) {
            // if a label or a node itself was clicked

            // get the ID of the node - this is the same as the label field in Gephi
            var nodeId = target.attr('class')

            // lower opacity of everything
            target.parents('svg').find('path,circle,text').css('opacity', '0.1')

            // (re)set paths linked to the clicked node (they will have the node ID as a class) and the node itself to full opacity
            target.parents('svg').find('#edges path.' + nodeId + ', #nodes circle.' + nodeId + ', #node-labels text.' + nodeId).css('opacity', '1')
          }
        } else {
          // If clicked anywhere in the empty space, reset the view
          $(this).find('path, circle, text').css('opacity', '1')
        }
      })
    })
  }
}))
