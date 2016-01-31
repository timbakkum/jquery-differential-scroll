/*
 * differential-scroll
 * version: 0.0.1
 * https://github.com/Und3Rdo9/jquery-differential-scroll
 *
 * Copyright (c) 2016 Tim Bakkum
 * Licensed under the MIT license.
 */
/* globals console */

;(function($) {

    "use strict";

    // define default once
    var defaults = {            
        breakpoint :        '(min-width: 40em)', // breakpoint to activate at
        offsetTop :         0, // extra offset from top to take into account (in case of fixed header for example)
        offsetBottom :      0, // extra bottom offset to take into account (in case of fixed footer for example) // to-do : add this values in calculations 
    };

    var DifferentialScroll = function(elem, options){
        this.elem = elem;
        this.$container = $(elem);
        this.options = options;
        this.metadata = this.$container.data('differential-scroll-options');

        this.$columns = this.$container.find('.differential-scroll-column');

        this.$smallestColumn = null;
        this.$tallestColumn = null;
        this.smallestSide   = '';
        this.tallestSide    = '';

        this.isLaunched     = false;
        this.fixedStatus    = '';

        this.windowTop      = '';
        this.windowHeight   = '';
        this.windowBottom   = '';

        this.containerTop   = '';

        // utility functions 
        this.getWindowTop = function(){
            return $(window).scrollTop();
        };

        this.getWindowHeight = function(){
            return $(window).height();
        };

        this.getWindowBottom = function(){
            return this.getWindowTop() + this.getWindowHeight();
        };

    };

    DifferentialScroll.prototype = {
        version :   '0.0.1',
        mediaQuery : window.matchMedia(defaults.breakpoint),

        mediaQueryCheck : function(mql){
             if(mql.matches === true){ // if our mediaQuery matches
                this.evalScrollPosition();
                if(this.isLaunched === false){
                    // attach scroll handlers

                    $(window).on('scroll resize', this.evalScrollPosition.bind(this));
                    this.isLaunched = true;
                }
            }
            else if(mql.matches === false){ // if the mediaQuery isn't active atm
                if(this.isLaunched === true){
                // remove handlers
                $(window).off('scroll resize', this.evalScrollPosition.bind(this));
                    this.isLaunched = false;
                }
                this.fixedStatus = '';
                this.unstyleContainer(); // remove positioning set by plugin
                this.unstyleColumns(); // remove positioning set by plugin
            }
        },
        
        init: function(){
            
            // merge user options with defaults 
            this.config = $.extend({}, defaults, this.options, this.metadata);
            // define mql object
            this.mediaQuery = window.matchMedia(this.config.breakpoint);
            
            // add listener to conditionally toggle scroll and resize listeners
            this.mediaQuery.addListener(this.mediaQueryCheck);
            // check mediaQuery to determine whether to apply eventListeners 
            // and run for a first time
            this.mediaQueryCheck(this.mediaQuery);

            return this;
        },

        evalColumns : function(){
            if(this.$columns.length === 2){
                if(this.$columns.first().outerHeight() < this.$columns.last().outerHeight()){
                    this.$smallestColumn     = this.$columns.first();
                    this.$tallestColumn      = this.$columns.last();
                    this.smallestSide       = 'left';
                    this.tallestSide        = 'right';

                }
                else if(this.$columns.first().outerHeight() > this.$columns.last().outerHeight()){
                    this.$smallestColumn     = this.$columns.last();
                    this.$tallestColumn      = this.$columns.first();
                    this.smallestSide       = 'right';
                    this.tallestSide        = 'left';
                }
                else if(this.$columns.first().outerHeight() === this.$columns.last().outerHeight()){
                    // both columns have the same height: both columns can scroll at the same time!
                    this.$smallestColumn     = null;
                    console.log('columns are the same height, no need to apply differential scroll effect');
                }
                
            }
            else{
                this.$smallestColumn     = null;
                console.error('you must have two columns!');
            }
        },

        styleContainer : function(){
            this.$container.css({
                'position'  : 'relative',
                'overflow'  : 'hidden',
                'height'    : this.$tallestColumn.outerHeight(),
            });
        },

        unstyleContainer : function(){
            this.$container.css({
                'position'  : 'initial', // to-do : not sure if best way
                'overflow'  : 'initial', // to-do : not sure if best way
                'height'    : 'auto',
            });
        },

        unstyleColumns : function(){
            this.$columns.css({
                'position'  : 'relative',
                'top'       : 'auto',
                'bottom'    : 'auto',
                'right'     : 'auto',
                'left'      : 'auto'
            });
        },

        fixToTopScreen : function(){
            this.fixedStatus = "top-screen";
            this.$smallestColumn.css({
                'position'  : 'absolute', // 'fixed',
                'top'       : ((this.getWindowTop() - this.containerTop) + 'px'), //offset of scrollContainer to top - window scroll bottom
                'bottom'    : 'auto',
            }).css(this.smallestSide, 0);

            console.log('toggleFixTop');
        },

        fixToBottomContainer : function(){
            if(this.fixedStatus !== "bottom-container"){ // prevent from running multiple times if not necessary
                this.fixedStatus = "bottom-container";
                this.$smallestColumn.css({
                    'position'  : 'absolute',
                    'top'       : 'auto',
                    'bottom'    : '0',
                }).css(this.smallestSide, 0);

                console.log('toggleFixBottom container');
            }
        },

        fixToTopContainer : function(){
            if(this.fixedStatus !== "top-container"){ // prevent from running multiple times if not necessary
                this.fixedStatus = "top-container";
                this.$smallestColumn.css({
                    'position'  : 'absolute',
                    'top'       : '0',
                    'bottom'    : 'auto',
                }).css(this.smallestSide, 0);
                
                console.log('toggleFix top Container');
            }
        },

        fixToBottomScreen : function (){
            this.fixedStatus = "middle";
            this.$smallestColumn.css({
                'position'  : 'absolute', // 'fixed',
                'top'       : 'auto',
                'bottom'    : ( ( this.$tallestColumn.outerHeight()- ( this.getWindowTop()  + this.getWindowHeight() - this.containerTop ) ) + 'px' ),
            }).css(this.smallestSide, 0);
            console.log('toggle fix to bottom screen');
        },

        positionTallestColumn : function(){
            this.$tallestColumn.css({
                'position'  : 'absolute',
                'top'       : '0',
                'bottom'    : 'auto',
            }).css(this.tallestSide, 0);

            console.log('positionTallestColumn');
        },

        evalScrollPosition : function(){

            // Get info on columns to determine whether to go ahead or not
            this.evalColumns();

            // Get window info once to reuse for comparisons
            this.windowTop      = this.getWindowTop();
            this.windowHeight   = this.getWindowHeight();
            this.windowBottom   = this.getWindowBottom();


            /* Check if smallest column is defined
             * columns might have equal height
             * or there might not be exactly 2 columns
             * then check if tallest column is bigger than window
             */ 
            if(this.$smallestColumn !== null && this.$tallestColumn.outerHeight() > this.windowHeight){

                    this.styleContainer();          // apply neccesary styles to container
                    this.positionTallestColumn();   // position the tallest column absolutely


                    this.containerTop   = this.$container.offset().top;
                    //this.containerBottom= this.$container.offset().top

                if(this.$smallestColumn.outerHeight() <= this.windowHeight){
                    /* Check if smallest column fits the screen
                     * adapt positioning based on scroll positioning
                     */
                    if(
                        this.windowTop <= this.containerTop
                    ){
                        /* We haven't scrolled past the top of the container 
                         * or we have scrolled back up past the top of the container
                         */ 
                        this.fixToTopContainer();
                    }
                    else if( 
                        this.windowTop > this.containerTop &&
                        this.windowTop < this.containerTop + (this.$tallestColumn.outerHeight() - this.$smallestColumn.outerHeight()) && 
                        this.windowTop < this.containerTop + this.$tallestColumn.outerHeight()
                    ){
                        /* - We scrolled past the top of the container
                         * - We haven't scrolled to the point where the smallest column
                         * fits exactly in the remaing visible container space
                         * - We haven't scrolled past the bottom of the container either
                         */
                         //console.log(this.windowBottom + 'wb <' + this.containerTop  + 'ct ' + this.$tallestColumn.outerHeight() );
                        this.fixToTopScreen();
                    }
                    else if( 
                        this.windowTop > this.containerTop &&
                        this.windowTop >= this.containerTop + (this.$tallestColumn.outerHeight() - this.$smallestColumn.outerHeight()) && 
                        this.windowBottom < this.containerTop + this.$tallestColumn.outerHeight()
                    ){
                        /* - We scrolled past the top of the container
                         * - We scrolled to the point where the smallest column
                         * fits exactly in the remaing visible container space
                         * - We haven't scrolled past the bottom of the container either
                         */
                        this.fixToBottomContainer();
                    }
                    else if(
                        this.windowTop > this.containerTop &&
                        this.windowBottom >= this.containerTop + this.$tallestColumn.outerHeight()
                    ){
                        /* - We scrolled past the top of the container
                         * - We scrolled past the bottom the container 
                         * (container is not visible on screen anymore)
                         */ 
                        this.fixToBottomContainer(); 
                    }
                }
                else if (this.$smallestColumn.outerHeight() > this.windowHeight){
                    /* Check if smallest column is bigger than the screen height
                     * adapt positioning based on scroll positioning
                     */
                    if(
                        this.windowTop <= this.containerTop
                    ){
                        /* We haven't scrolled past the top of the container 
                         * or we have scrolled back up past the top of the container
                         */ 
                        this.fixToTopContainer();
                    }
                    else if( 
                        this.windowTop > this.containerTop &&
                        this.windowBottom >= this.containerTop + this.$smallestColumn.outerHeight()  &&
                        this.windowBottom < this.containerTop + this.$tallestColumn.outerHeight()
                    ){
                        /* - We scrolled past the top of the container
                         * - We scrolled to/past the point where we can see the bottom of the smallest column
                         * - We haven't scrolled past the bottom of the container 
                         */
                        this.fixToBottomScreen();
                    }
                    else if(
                        this.windowTop > this.containerTop &&
                        this.windowBottom >= this.containerTop + this.$tallestColumn.outerHeight()
                    ){
                        /* - We scrolled past the top of the container
                         * - We scrolled past the bottom the container 
                         * (container is not visible on screen anymore)
                         */ 
                        this.fixToBottomContainer(); 
                    }
                }
            }
            else{
                // differential scroll behaviour not necessary 
                // removes styles just in case they were previously set
                this.unstyleColumns();
                this.unstyleContainer();
            }
        },

        test : 'random string test',
    };
    

    $.fn.differentialScroll2 = function(options){
        return this.each(function(){
            new DifferentialScroll(this, options).init();
        });
    };
    /*
    $.fn.differentialScroll = function(options){

        $(this).each(function(){
            var settings = $.extend({
                // default values
                scrollContainer :   $(this),
                breakpoint :        '(min-width: 40em)', // breakpoint to activate at
                offsetTop :         0, // extra offset from top to take into account (in case of fixed header for example) // to-do : add this values in calculations
                offsetBottom :      0, // extra bottom offset to take into account (in case of fixed footer for example) // to-do : add this values in calculations

            }, options );

            // Utility functions

            var getWindowTop = function () {
                return $(window).scrollTop();
            };

            var getWindowHeight = function () {
                return $(window).height();
            };

            var columns;
            var smallestColumn;
            var tallestColumn;
            var smallestSide = '';
            var tallestSide = '';

            var getSmallestColumn = function(){
                columns = settings.scrollContainer.find('.differential-scroll-column');
                if(columns.length === 2){
                    if(columns.first().outerHeight() < columns.last().outerHeight()){
                        smallestColumn = columns.first();
                        tallestColumn = columns.last();
                        smallestSide = 'left';
                        tallestSide = 'right';

                    }
                    else if(columns.first().outerHeight() > columns.last().outerHeight()){
                        smallestColumn = columns.last();
                        tallestColumn = columns.first();
                        smallestSide = 'right';
                        tallestSide = 'left';
                    }
                    else if(columns.first().outerHeight() === columns.last().outerHeight()){
                        // both columns have the same height: both columns can scroll at the same time!
                        smallestColumn = null;
                        console.log('columns are the same height, no need to apply differential scroll effect');
                    }
                   
                }
                else{
                    smallestColumn = null;
                    console.error('you must have two columns!');
                }
            };

            var styleContainer = function(){
                settings.scrollContainer.css({
                    'position'  : 'relative',
                    'overflow'  : 'hidden',
                    'height'    : tallestColumn.outerHeight(),
                    //'width'     : settings.scrollContainer.outerWidth()
                });
            };

            var unstyleContainer = function(){
                settings.scrollContainer.removeAttr('style');
                settings.scrollContainer.find('.differential-scroll-column').css({
                    'position'  : 'relative',
                    'top'       : 'auto',
                    'bottom'    : 'auto',
                    'right'     : 'auto',
                    'left'      : 'auto'
                });
            };

            var unstyleColumns = function(){
                console.log('unstyling columns');
                settings.scrollContainer.find('.differential-scroll-column').removeAttr('style');
            }

            var isLaunched = false;

            var windowTop;
            var windowHeight;
            var scrollContainerBottom;
            var scrollContainerTop;
            var fixedStatus = '';
            var smallestColumnHeight;
            var smallestColumnBottom;
            var tallestColumnHeight;

            var toggleFixTop = function (){
                fixedStatus = "top";
                smallestColumn.css({
                    'position'  : 'absolute', // 'fixed',
                    'top'       : ((getWindowTop() - scrollContainerTop) + 'px'), //offset of scrollContainer to top - window scroll bottom
                    'bottom'    : 'auto',
                }).css(smallestSide, 0);
                console.log('toggleFixTop');
            };
            var toggleFixMiddle = function(){
               
                fixedStatus = "middle";
                smallestColumn.css({
                    'position'  : 'absolute', // 'fixed',
                    'top'       : 'auto',
                    'bottom'    : ( ( tallestColumnHeight - ( getWindowTop()  + getWindowHeight() - scrollContainerTop - settings.offsetTop ) ) + 'px' ),
                }).css(smallestSide, 0);
                console.log('toggleFixMiddle');
            };
            var toggleFixBottom = function(){
                if(fixedStatus !== "bottom"){ // prevent from running multiple times if not necessary
                    fixedStatus = "bottom";
                    smallestColumn.css({
                        'position'  : 'absolute',
                        'top'       : 'auto',
                        'bottom'    : '0',
                    }).css(smallestSide, 0);
                    console.log('toggleFixBottom');
                }

               
            };
            var toggleFixContainer = function(){
                if(fixedStatus !== "container"){ // prevent from running multiple times if not necessary
                    fixedStatus = "container";
                    smallestColumn.css({
                        'position'  : 'absolute',
                        'top'       : '0',
                        'bottom'    : 'auto',
                    }).css(smallestSide, 0);
                    console.log('toggleFixContainer');
                }
               
            };

            var positionTallestColumn = function(){
                tallestColumn.css({
                    'position'  : 'absolute',
                    'top'       : '0',
                    'bottom'    : 'auto',
                }).css(tallestSide, 0);
                console.log('positionTallestColumn');
            };


            var evalScrollPosition = function(){

                getSmallestColumn();

                // function for evaluating position of scrollTop
                windowTop = getWindowTop();
                windowHeight = getWindowHeight();
             
                if(smallestColumn !== null){
                // if columns are equal, behavoir not necessary !
               
                    smallestColumnHeight = smallestColumn.outerHeight();
                    tallestColumnHeight = tallestColumn.outerHeight();
                    if($.isNumeric(settings.offsetTop) && settings.offsetTop > 0){
                        scrollContainerTop =    settings.scrollContainer.offset().top - settings.offsetTop;
                        smallestColumnBottom =  scrollContainerTop + smallestColumnHeight + settings.offsetTop;
                    }
                    else{
                        scrollContainerTop = settings.scrollContainer.offset().top;
                        smallestColumnBottom =  scrollContainerTop + smallestColumnHeight;
                    }

                    scrollContainerBottom = settings.scrollContainer.offset().top + tallestColumnHeight;
                   

                    if(tallestColumnHeight + settings.offsetTop > windowHeight){
                    // if tallest column isn't longer than the screen, behavouir not necessary
                        styleContainer(); // give scrollContainer height of tallest column

                        positionTallestColumn(); // always position tallest container, because its position doesn't need to change

                        if( windowTop >= scrollContainerTop &&
                            windowTop <= scrollContainerBottom - windowHeight &&
                            windowTop <  scrollContainerBottom - (smallestColumnHeight + settings.offsetTop)
                          ){
                            // if window scrolled past the top of the container but not past the bottom of container
                            // console.log('scrolled passed top of container - but not past bottom');
                            // console.log(windowTop + ' <= ' + scrollContainerBottom);

                            if(smallestColumnHeight + settings.offsetTop <= windowHeight){
                                // if the smallest column is smaller than or equal to the window height
                                toggleFixTop();

                                console.log('smallest column is smaller than or equal to the window height');
                            }
                            else if(smallestColumnHeight + settings.offsetTop > windowHeight){
                            // if the smallest column is larger than the window height,
                            // wait until fixing the bottom of the column is visible,
                            // then fix on the bottom of the window if bottom of scrollContainer is not yet visible
                            // or position absolutely once the bottom of the scrollContainer is visible
                                if(windowTop >= smallestColumnBottom - windowHeight) {
                                  //  console.log('wt = ' + windowTop + ' sct = ' + scrollContainerTop + ' sch = ' + smallestColumnHeight + ' wh = ' + windowHeight + ' scb = ' + smallestColumnBottom);
                                    if(windowTop >= scrollContainerBottom){
                                        toggleFixBottom();
                                       // console.log('fix on the bottom of the window if bottom of scrollContainer is not yet visible');
                                    }
                                    else if(windowTop < scrollContainerBottom){
                                        toggleFixMiddle();
                                      //  console.log('position absolutely once the bottom of the scrollContainer is visible');
                                    }
                                }
                                else if(windowTop < smallestColumnBottom - windowHeight) {
                                   // console.log('toggling to fix container');

                                    toggleFixContainer();
                                }
                            }
                        }
                        else if(windowTop < scrollContainerTop ){
                            toggleFixContainer();
                            console.log('not scrolled passed top container / scrolled back up past top container = fix smallest to top absolutely')
                        }
                        else if(windowTop >= scrollContainerBottom - (smallestColumnHeight + settings.offsetTop) &&
                                windowTop <= scrollContainerBottom - windowHeight
                            ){
                            // we scrolled to the point where the smallest container fits exaclty in the remaining visible space of the container
                            // but we haven't scrolled past the container bottom
                                if(smallestColumnHeight + settings.offsetTop > windowHeight){
                                    // if the smallest column is bigger than the window height
                                    toggleFixMiddle();
                                }
                                else{
                                    toggleFixBottom();

                                }
                                console.log('we scrolled to the point where the smallest container fits exaclty in the remaining visible space of the container \n but we haven\'t scrolled past the container bottom');
                           
                        }
                        else if(windowTop >= scrollContainerBottom - windowHeight){
                            if(smallestColumnHeight + settings.offsetTop <= windowHeight){
                                // if the smallest column is smaller than or equal to the window height
                                if(windowTop >= scrollContainerBottom - (smallestColumnHeight + settings.offsetTop)){
                                    toggleFixBottom();
                                    console.log('1');
                                }
                                else if(windowTop < scrollContainerBottom - (smallestColumnHeight + settings.offsetTop)){
                                    
                                     console.log('2');toggleFixTop();
                                }
                               

                                console.log('smallest column is smaller than or equal to the window height');
                            }
                            // we scrolled past the container bottom
                            //console.log('we scrolled past the bottom of the container');
                           // console.log(windowTop + ' > ' + scrollContainerBottom);

                            // is this condition useful ??
                        }
                    }
                   
                   
                }
            };

            var MQL = window.matchMedia(settings.breakpoint);

            // define the function to execute on breakpoint match / change
            var mediaQueryCheck = function(mql){
                if(mql.matches){ // if our mediaQuery matches
                    evalScrollPosition();
                    if(isLaunched === false){
                        // attach scroll handlers

                        $(window).on('scroll resize', evalScrollPosition);
                        isLaunched = true;
                    }
                }
                else{ // if the mediaQuery isn't active atm
                    if(isLaunched === true){
                    // undo some handlers etc
                    $(window).off('scroll resize', evalScrollPosition);
                        isLaunched = false;
                    }
                    fixedStatus = '';
                    unstyleContainer(); // remove positioning set by plugin
                    unstyleColumns(); // remove positioning set by plugin
                }
            };
            // add the mediaQueryCheck function to mediaquery change listener
            MQL.addListener(mediaQueryCheck);

            var init = function(){
                // check the current media query to see whether to go ahead
                mediaQueryCheck(MQL);
            };

            return init();
       
        });
       
    };*/

}(jQuery));