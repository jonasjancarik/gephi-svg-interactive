(function ($) {

    $.fn.gephiSvgInteractive = function (options) {

        return this.each(function () {

            // Default options
            var optionsDefault = {
                class: null,
                cursor: 'pointer'
            }

            // applied defaults where options were not set
            Object.keys(optionsDefault).forEach(function (option) {
                if (!options[option]) {
                    options.option = optionsDefault[option]
                }
            });

            options.class ? $(this).addClass(options.class) : null
            options.cursor ? $(this).find('#edges path, #nodes circle, #node-labels text').css('cursor', options.cursor) : null
           
            // bind to the click event
            $(this).bind("click.gephiSvgInteractive", function () {

                // check if the click was on one of the SVG child elements
                if (event.target !== this) {

                    // set the clicked element as the target
                    var target = $(event.target)

                    // if the click is on an edge path
                    if (target.is('#edges path')) {
                        // (re)set clicked path to full opacity
                        target.css('opacity', '1')
                        // lower the opacity of all other egde paths
                        target.siblings().each(function () {
                            $(this).css('opacity', '0.1')
                        })
                    }
                    // if a label or a node itself was clicked
                    else if (target.is('#node-labels text') || target.is('#nodes circle')) {
                        // get the ID of the node - this is the same as the label field in Gephi
                        var nodeId = target.attr('class')
                        // (re)set paths linked to the clicked node (they will have the node ID as a class) to full opacity
                        target.parents('svg').find('#edges path.' + nodeId).css('opacity', '1')
                        // lower the opacity of other paths
                        target.parents('svg').find('#edges path').not('.' + nodeId).css('opacity', '0.1')
                    }

                } else {  // reset the view
                    $(this).find('path').css('opacity', '1')
                }

            });

        })

    };

})(jQuery);