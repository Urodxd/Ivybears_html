(function() {
    var options = {
        whatsapp: "+380713712791",
        // WhatsApp number
        email: "hello@Satanacrew69@mail.ru",
        // Email
        company_logo_url: "img/favicon.png",
        // URL of company logo (png, jpg, gif)
        greeting_message: "",
        // Text of greeting message
        call_to_action: "",
        // Call to action
        button_color: "#FF318E",
        // Color of button
        position: "left",
        // Position may be 'right' or 'left'
        order: "whatsapp,email",
        // Order of buttons
    };
    var proto = document.location.protocol
        , host = "whatshelp.io"
        , url = proto + "//static." + host;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = url + '/widget-send-button/js/init.js';
    s.onload = function() {
        WhWidgetSendButton.init(host, proto, options);
    }
    ;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
})();
