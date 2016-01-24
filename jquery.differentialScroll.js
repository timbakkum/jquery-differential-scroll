(function($) {
	
	$.fn.differentialScroll = function(options){

        var settings = $.extend({
            // default values
            scrollContainer : $(this),
            breakpoint : '(min-width: 40em)',

        }, options );

        var getWindowTop = function () {
	        return $(window).scrollTop();
	    };

	    var getWindowHeight = function () {
	        return $(window).height();
	    };

	    var getWindowBottom = function () {
	        return $(window).scrollTop() + $(window).height();
	    };// used? 

	    var columns;
	    var smallestColumn; 
	    var tallestColumn;

	    var getSmallestColumn = function(){
	    	columns = settings.scrollContainer.find('.differential-scroll-column');
	    	if(columns.length === 2){
	    		if(columns.first().height() < columns.last().height()){
	    			smallestColumn = columns.first();
	    			tallestColumn = columns.last();
	    		}
	    		else if(columns.first().height() > columns.last().height()){
	    			smallestColumn = columns.last();
	    			tallestColumn = columns.first();
	    		}
	    		else if(columns.first().height() === columns.last().height()){
	    			// both columns have the same height: both columns can scroll at the same time!
	    			smallestColumn = null;
	    		}
	    	}
	    	else{
	    		console.error('you must have two columns!');
	    	}
	    };

	    var styleContainer = function(){
	    	settings.scrollContainer.height(tallestColumn.height());
	    };

	    var unstyleContainer = function(){
	    	settings.scrollContainer.removeAttr('style');
	    };

	    var isLaunched = false;

	    var checkMQ = function(){
	    	if(window.matchMedia(settings.breakpoint).matches){
	    		return true;
	    	}
	    	else{
	    		return false;
	    	}
	    };



	    var windowTop;
	    var windowHeight;
	    var scrollContainerBottom;
	    var fixedStatus;
	    var fixed;
	    var smallestColumnHeight;


	    var toggleFixTop = function (){
	    	if(fixedStatus !== "top"){
	    		smallestColumn.removeClass('fixedToBottom fixedToMiddle').toggleClass('fixedToTop');
	    		fixedStatus = "top";
	    	}
	    };
	    var toggleFixMiddle = function(){
	    	if(fixedStatus !== "middle"){
	    		smallestColumn.removeClass('fixedToBottom fixedToTop').toggleClass('fixedToMiddle');
	    		fixedStatus = "middle";
	    	}
	    };
	    var toggleFixBottom = function(){
	    	if(fixedStatus !== "bottom"){
	    		smallestColumn.removeClass('fixedToTop fixedToMiddle').toggleClass('fixedToBottom');
	    		fixedStatus = "bottom";
	    	}
	    };

	    var positionTallestColumn = function(){
	    	tallestColumn.addClass('fixedToContainer');
	    };

	    var evalScrollPosition = function(){
		    // function for evaluating position of scrollTop
	        windowTop = getWindowTop();
	        windowHeight = getWindowHeight();
	        smallestColumnHeight = smallestColumn.height();
	        tallestColumnHeight = tallestColumn.height();

	       
	        
	        if(smallestColumn !== null){
	        	// if columns are equal, behavoir not necessary !
				if (windowTop >= 1) { // OR scrollContainer.offset().top !!
					// if window scrolled past the top of the element
					positionTallestColumn();

					if(smallestColumnHeight < windowHeight){
						// if the smallest column is smaller than or equal to the window height
						toggleFixTop();
					}
					else if(smallestColumnHeight > windowHeight){
						// if the smallest column is larger than the window height,
						// wait until fixing the bottom of the column is visible,
						// then fix on the bottom of the window if bottom of scrollContainer is not yet visible
						// or position absolutely once the bottom of the scrollContainer is visible
						if(windowTop >= smallestColumnHeight - windowHeight) {
							if(windowTop >= tallestColumnHeight - windowHeight){
								toggleFixBottom();
							}
							else if(windowTop < tallestColumnHeight - windowHeight){
								toggleFixMiddle();
							}
						}
					}
			    }
	        }
	    };

	    var init = function(){
	    	if (checkMQ() === true){

				getSmallestColumn();

				styleContainer();

				evalScrollPosition();
				if(isLaunched === false){
					// attach scroll handlers

					$(window).on('scroll resize', evalScrollPosition);
					isLaunched = true;
				}
				
	    	}
	    	else{
	    		if(isLaunched === true){
	    			// undo some handlers etc
	    			unstyleContainer();
	    			$(window).off('scroll resize', evalScrollPosition);
	    			isLaunched = false;
	    		}
	    	}
	    	
	    };

	    return this.each(function() {
        	// Do something to each element here.
        	init();
    	});

	};




})(jQuery); // Fully reference jQuery after this point.