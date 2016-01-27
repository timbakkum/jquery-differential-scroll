/*
 * differential-scroll
 * https://github.com/Und3Rdo9/jquery-differential-scroll
 *
 * Copyright (c) 2016 Tim Bakkum
 * Licensed under the MIT license.
 */
/* globals console */

(function($) {
  
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
                });
                smallestColumn.css(smallestSide, 0);
            };
            var toggleFixMiddle = function(){
                
                fixedStatus = "middle";
                smallestColumn.css({
                    'position'  : 'absolute', // 'fixed',
                    'top'       : 'auto',
                    'bottom'    : ( ( tallestColumnHeight - ( getWindowTop()  + getWindowHeight() - scrollContainerTop ) ) + 'px' ),
                });
                
                smallestColumn.css(smallestSide, 0);
            };
            var toggleFixBottom = function(){
                if(fixedStatus !== "bottom"){ // prevent from running multiple times if not necessary
                    fixedStatus = "bottom";
                    smallestColumn.css({
                        'position'  : 'absolute',
                        'top'       : 'auto',
                        'bottom'    : '0',
                    });
                }
                smallestColumn.css(smallestSide, 0);
            };
            var toggleFixContainer = function(){
                if(fixedStatus !== "container"){ // prevent from running multiple times if not necessary
                    fixedStatus = "container";
                    smallestColumn.css({
                        'position'  : 'absolute',
                        'top'       : '0',
                        'bottom'    : 'auto',
                    });
                }
                smallestColumn.css(smallestSide, 0);
            };

            var positionTallestColumn = function(){
                tallestColumn.addClass('fixedToContainer');
                tallestColumn.css({
                    'position'  : 'absolute',
                    'top'       : '0',
                    'bottom'    : 'auto',
                });
                tallestColumn.css(tallestSide, 0);
            };


            var evalScrollPosition = function(){

                getSmallestColumn();

                // function for evaluating position of scrollTop
                windowTop = getWindowTop();
                windowHeight = getWindowHeight();
                smallestColumnHeight = smallestColumn.outerHeight();
                tallestColumnHeight = tallestColumn.outerHeight();
                scrollContainerTop = settings.scrollContainer.offset().top;

                scrollContainerBottom = scrollContainerTop + tallestColumnHeight;
                smallestColumnBottom = scrollContainerTop + smallestColumnHeight; 

                styleContainer(); // give scrollContainer height of tallest column 
              
                if(smallestColumn !== null && tallestColumnHeight > windowHeight){
                // if columns are equal, behavoir not necessary !
                // if tallest column isn't longer than the screen, behavouir not necessary

                    positionTallestColumn(); // always position tallest container, because its position doesn't need to change

                    if (windowTop >= scrollContainerTop && windowTop <= scrollContainerBottom && windowTop < scrollContainerBottom - smallestColumnHeight){ 
                    // if window scrolled past the top of the container but not past the bottom of container
                      //  console.log('scrolled passed top of container - but not past bottom');
                        //console.log(windowTop + ' <= ' + scrollContainerBottom);
                        
                        if(smallestColumnHeight <= windowHeight){
                            // if the smallest column is smaller than or equal to the window height
                            toggleFixTop();

                            console.log('smallest column is smaller than or equal to the window height');
                        }
                        else if(smallestColumnHeight > windowHeight){
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
                    else if(windowTop >= scrollContainerBottom - smallestColumnHeight && windowTop < scrollContainerBottom){
                        // we scrolled to the point where the smallest container fits exaclty in the remaining visible space of the container
                        // but we haven't scrolled past the container bottom
                       // console.log(windowTop + ' >= ' + smallestColumnBottom + ' - ' + smallestColumnHeight);
                        console.log('we scrolled to the point where the smallest container fits exaclty in the remaining visible space of the container \n but we haven\'t scrolled past the container bottom');
                        toggleFixBottom();
                    }
                    else if(windowTop >= scrollContainerBottom){
                        // we scrolled past the container bottom
                        //console.log('we scrolled past the bottom of the container');
                       // console.log(windowTop + ' > ' + scrollContainerBottom);

                        // is this condition useful ??
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
                    unstyleContainer();
                    $(window).off('scroll resize', evalScrollPosition);
                        isLaunched = false;
                    }
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
        
    };

}(jQuery));

