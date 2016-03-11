var World = function(selector) {
    this.selector = selector;
    this.history  = [];
    this.current  = 0;
    this.input_current = 'input_standard';
    this.element = $('#world')[0];
    this.maxScreens = 20;
};

World.prototype.update = function(data) {
    if (typeof(data) != 'undefined') {
        if (data.indexOf('mot de passe') >= 0) {
            this.setInputPassword();
        }
        if (data.indexOf('Shutting down before restart') >= 0) {
            setTimeout(function() {
                location.reload();
            }, 3000);
        }
    }
    $(this.selector).append(data);
    $(this.selector).attr({
        scrollTop: $(this.selector).attr('scrollHeight'),
    });
};

World.prototype.cleanHeight = function() {
    var maxHeight = this.maxScreens * $(window).height();
    totalHeight = this.element.scrollHeight + this.element.clientHeight;
    if (totalHeight > maxHeight) {
        for(var i = 0; i < 100; i++) {
            this.element.removeChild(this.element.firstChild);
        }
    }
};

World.prototype.setInputStandard = function() {
    $('input#input_password').removeClass('input_current').val('');
    $('input#input_standard').addClass('input_current').select();
    this.input_current = 'input_standard';
};

World.prototype.getInputSelection = function() {
    var b = $('#input_standard')[0].selectionStart;
    var e = $('#input_standard')[0].selectionEnd;
    return $('#input_standard').val().substr(b, e - b);
};

World.prototype.setInputPassword = function() {
    var v = $('input#input_standard').val();
    if (this.getInputSelection() == $('#input_standard').val()) {
        v = '';
    }
    $('input#input_standard').removeClass('input_current').val('');
    $('input#input_password').addClass('input_current').val(v).focus();
    this.input_current = 'input_password';
};

World.prototype.selfMesssage = function(message) {
    message = message.replace('<','&lt;');
    message = message.replace('>','&gt;');
    this.update("&nbsp;<span class='self'>" + message + "</span>\r\n");
};

World.prototype.systemMessage = function(message) {
    this.update("\r\n<span class='yellow'># " + message + "</span>\r\n");
};

World.prototype.updateHistory = function(command) {
    if (command && command != this.history[this.history.length - 1]) {
        this.history.push(command);
    }
    this.current = this.history.length;
};