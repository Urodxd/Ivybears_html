$(document).ready(function () {

	//faq show block

	$(document).on('click', '.faq__element_trigger a', function(event){
        event.preventDefault();
        
        var hover_block = $(this).parent().next();

        if ($(this).hasClass('js-show-block')) {	
        	$(this).removeClass('js-show-block');
        	hover_block.slideUp();
        } else {
        	$(this).addClass('js-show-block');
        	hover_block.slideDown();
        }
        
    });


});