var instagram_site_url = "https://app.aaawebstore.com/instagram-feed/";
if (typeof jQuery == 'undefined') {
    var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'text/javascript';
    jqTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
    jqTag.onload = aaa_data_load;
    headTag.appendChild(jqTag)
} else {
    var $ = jQuery.noConflict();
    aaa_data_load();
}
function aaa_data_load() {
    jQuery(document).ready(function () {
        var id = "";
        //alert();
        if (($(".aaa-instafeed-manager").length > 0)) {

            /*alert('test by instagram-feed App'); */
            //jQuery('.aaa-instafeed-manager').css("text-align", "center").append('<img class="aaa-loader-image" src="' + instagram_site_url + 'src/assets/images/apploader.gif">');
            jQuery('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">');
            jQuery('head').append('<link rel="stylesheet"  href="' + instagram_site_url + 'src/assets/css/lightslider.css"/>');
            jQuery('head').append('<script src="' + instagram_site_url + 'src/assets/js/lightslider.js"></script>');
            jQuery('head').append('<link rel="stylesheet"  href="' + instagram_site_url + 'src/assets/css/tagging.css"/>');
            jQuery('body').append('<div id="fade" class="black_overlay"></div>');
            jQuery('body').append('<div class="aaa-ajax-popup for-slider-only"></div>');

            //var gallery_id = jQuery('.aaa-instafeed-manager').attr('data-id');

            var shopurl = aaa_get_shop_domain();
            var shoppath = aaa_get_page_path();
            
            if(shopurl == 'wiggit.myshopify.com' || shopurl == 'hdnyc.myshopify.com' || shopurl == 'arons-watch.myshopify.com') { 
                //do nothing as script is in local itself
            }  else {
            //console.log('shop url from aaa server' + shopurl);
            
            jQuery('.aaa-instafeed-manager').each(function () {

                var gallery_id = jQuery(this).attr('data-id');

                jQuery.ajax({
                    crossDomain: true,
                    url: instagram_site_url + 'process.php?shopurl=' + shopurl + '&shoppath=' + shoppath + '&gallery_id=' + gallery_id,
                    method: 'GET',
                    //dataType: "json",
                    success: function (response) {

                        //console.log(response)

                        //jQuery('.aaa-instafeed-manager').append(response);
                        jQuery('[data-id=' + gallery_id + ']').append(response);
                        jQuery('.aaa-loader-image').remove();
                        var relax_load_time = 100;
                        
                        
                         var window_width =  jQuery( window ).width();
                            
                            if(window_width < '868' && window_width > '400' ) {
                                var column_count = 3;
                            } else if(window_width < '478'  ) {
                                var column_count = 2;
                            } else {
                                var column_count = jQuery('.no_of_column').val();
                            }
                            
                            if (column_count == 1) {
                                
                                relax_load_time = 2500;
                            } else {
                                
                                relax_load_time = 50;
                            }
                        
                        console.log('relax time === '+ relax_load_time);
                        setTimeout(function () {
                            
                            //if (($("#content-slider").length > 0)) {
                            if (($(".slider_target_" + gallery_id).length > 0)) {

                                var is_slider_pager = $('.is_slider_pager').val();
                                var pager_flag = false;

                                if (is_slider_pager == 1) {
                                    pager_flag = true;
                                } else {
                                    pager_flag = false;
                                }

                                jQuery("#content-slider").lightSlider({
                                    loop: true,
                                    keyPress: true,
                                    pager: pager_flag,
                                    slideEndAnimation: true,
                                    item: column_count,
                                    auto: true,
                                    pauseOnHover: true,
                                    pause : 4000,
                                    speed: 1000,
                                });
                            }
                        }, relax_load_time);

                        jQuery(document).on("click", "#close-pop-up", function () {
                            console.log('triggered ');
                            $('.aaa-ajax-popup').html(' ');
                            var elem = jQuery(this);

                            if (elem.hasClass('video-frame')) {
                                $('.single-popup-box iframe').attr('src', '');
                            }
                            aaaclosePopUp();
                        });


                        // $(document).on("click" , ".shop-frame" , function() {

                        // });

                        jQuery(document).on('click', '.shop-frame', function () {
                            //console.log('hit');
                            var elem = jQuery(this);

                            if (elem.hasClass('video-frame')) {
                                //console.log('hit1');
                                var dataMediaId = elem.data('mediaid');
                                var videoFrom = jQuery('.popup' + dataMediaId).data('video_from');
                                var videoId = jQuery('.popup' + dataMediaId).data('video_id');
                                if (videoFrom == 'youtube') {
                                    var src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
                                } else if (videoFrom == 'vimeo') {
                                    var src = 'https://player.vimeo.com/video/' + videoId + '?autoplay=1';
                                }
                                $('#iframe_for' + dataMediaId).attr('src', src);

                                var popupId = elem.attr('data-target');
                                var thisMediaId = elem.attr('data-mediaid');
                                aaashowPopUp(popupId);
                                viewtag(thisMediaId, shopurl);
                                savereportremote(thisMediaId, shopurl);

                            } else {

                                var popupId = elem.attr('data-target');
                                var thisMediaId = elem.attr('data-mediaid');
                                //console.log('hit2'+popupId);    
                                aaashowPopUp(popupId);
                                viewtag(thisMediaId, shopurl);
                                savereportremote(thisMediaId, shopurl);
                            }

                        });


                        function viewtag(pic_id) {
                            // get the tag list with action remove and tag boxes and place it on the image.

                            jQuery.ajax({
                                crossDomain: true,
                                url: instagram_site_url + 'taglist.php',
                                method: 'POST',
                                dataType: "json",
                                data: "pic_id=" + pic_id + "&shopurl=" + shopurl,
                                success: function (data) {
                                    jQuery('#taglist ol').html(data.lists);
                                    jQuery('#tagbox' + pic_id).html(data.boxes);
                                }

                            });
                        }

                        function savereportremote(media_id, shopname) {
                            jQuery.ajax({
                                crossDomain: true,
                                url: instagram_site_url + 'savereportremote.php',
                                method: 'POST',
                                data: "media_id=" + media_id + "&shopname=" + shopname,
                                success: function (data) {
                                    //alert('saved success');
                                }
                            });
                        }

                        jQuery(document).on('mouseover', '.aaa_tagged_product', function ( ) {
                            id = jQuery(this).attr("id");
                            if (id != undefined) {
                                jQuery('#view_' + id).addClass('blink_me');
                            }
                        }).on('mouseout', 'li', function ( ) {
                            if (id != undefined) {
                                jQuery('#view_' + id).removeClass('blink_me');
                            }
                        });

                        jQuery(document).on('mouseover', '.tagview', function ( ) {

                            id = jQuery(this).attr("id");
                            var split_id = id.split('_');
                            var final_id = split_id[1];

                            jQuery('#' + final_id).addClass('blink_me');
                        }).on('mouseout', '.tagview', function ( ) {
                            id = jQuery(this).attr("id");
                            var split_id = id.split('_');
                            var final_id = split_id[1];

                            jQuery('#' + final_id).removeClass('blink_me');

                        });

                        jQuery(document).on('click', '.shop-frame-slider', function () {
                            var thisMediaId = jQuery(this).attr('data-mediaid');
                            var storeId = jQuery(this).attr('data-storeid');


                            jQuery.ajax({
                                crossDomain: true,
                                url: instagram_site_url + 'getpopupremote.php',
                                method: 'POST',
                                dataType: "json",
                                data: "media_id=" + thisMediaId + "&store_id=" + storeId,
                                success: function (response) {

                                    jQuery('.aaa-ajax-popup').html(response.data);


                                    //jQuery('.black_overlay').show();
                                    viewtag(response.mediaId);
                                    savereportremote(response.mediaId, shopurl);
                                }

                            });

                        });

                    }
                });


                // CODE 

                $(document).on("click", ".aaa-insta-loadmore-click-" + gallery_id, function (e) {
                    e.preventDefault();
                    jQuery(this).css('pointer-events' , 'none'); 
                    jQuery('.aaa-instafeed-manager').css("text-align", "center").append('<img class="aaa-loader-image" src="' + instagram_site_url + 'src/assets/images/apploader.gif">');

                    var load_more_elem = $(this);
                    load_more_elem.html('Loading..').css("margin-bottom", "30px");
                    var new_offset = $(this).attr('data-newoffset');
                    var new_limit = $(this).attr('data-newlimit');
                    var this_gallery_id = $(this).attr('data-galleryid');

                    jQuery.ajax({
                        crossDomain: true,
                        url: instagram_site_url + 'process.php?shopurl=' + shopurl + '&shoppath=' + shoppath + '&gallery_id=' + this_gallery_id + '&new_offset=' + new_offset + '&new_limit=' + new_limit,
                        method: 'GET',
                        //dataType: "json",
                        success: function (response) {
                            //jQuery('.aaa-instafeed-manager').append(response);
                            jQuery('[data-id=' + this_gallery_id + ']').append(response);


                            load_more_elem.remove();
                            jQuery('.aaa-loader-image').remove();

                        }
                    });

                });
                //ENDS 

            });
        }
        
        }

        /* $(document).on("click", ".aaa-instagram-feed-loadmore", function () {
         jQuery('.aaa-instafeed-manager').css("text-align", "center").append('<img class="aaa-loader-image" src="' + instagram_site_url + 'src/assets/images/apploader.gif">');
         
         var load_more_elem = $(this);
         load_more_elem.html('Loading..').css("margin-bottom", "30px");
         var new_offset = $(this).attr('data-newoffset');
         var new_limit = $(this).attr('data-newlimit');
         jQuery.ajax({
         crossDomain: true,
         url: instagram_site_url + 'process.php?shopurl=' + shopurl + '&shoppath=' + shoppath + '&gallery_id=' + gallery_id + '&new_offset=' + new_offset + '&new_limit=' + new_limit,
         method: 'GET',
         //dataType: "json",
         success: function (response) {
         jQuery('.aaa-instafeed-manager').append(response);
         load_more_elem.remove();
         jQuery('.aaa-loader-image').remove();
         
         }
         });
         
         }); */

    });
}
function aaa_get_shop_domain() {
    var aaa_shop = document.getElementsByTagName('script');
    for (var i = 0; i < aaa_shop.length; i++) {
        if (aaa_shop[i].src.indexOf('aaa-insta-feed-script') > -1) {
            var b = aaa_shop[i].src.substring(aaa_shop[i].src.indexOf('shop=') + 5, aaa_shop[i].src.length);
            return b
        }
    }
    return document.domain
}
function aaa_get_page_path() {
    return window.location.pathname;
}

function aaashowPopUp(popupId) {
    $('.popup' + popupId).fadeIn("slow");
    $('.popup' + popupId).css("position", "fixed");
    $('.popup' + popupId).css("z-index", "2147483647");
    var temp = '.popup' + popupId;
    console.log(temp);
    $('.black_overlay').show();
}

function aaaclosePopUp() {
    $('.white_content').fadeOut();
    $('.black_overlay').hide();
    aaapauseAllVideos();
}

function aaapauseAllVideos()
{
    $('iframe').contents().find('video').each(function ()
    {
        this.pause();
    });

}


/*function aaa_is_mobile() {
 var a = false;
 if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)))
 a = true;
 return a;
 }*/