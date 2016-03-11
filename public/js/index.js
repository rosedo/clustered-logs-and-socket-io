function moveCursorToEnd(el) {
    if (typeof el.selectionStart == 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange !== 'undefined') {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

var message = '';
var pry_mode = false;

function command_regexp(command_name) {
    return new RegExp(";\\{begin _" + command_name + "\\};\\{(.+)\\};\\{end _" + command_name + "\\};"); 
}

function execute_message_commands() {
    for (var i = 0; i < commands.length; i++) {
        execute_command(commands[i]);
    };
}

function execute_command(name) {
    pattern = command_regexp(name);
    match = message.match(pattern);
    if (match != null) {
        window['command_' + name](match[1]);
        message = message.replace(pattern, '');
    }
}

function input_val() {
    return $('input.input_current').val();
}

var commands = ['tab', 'pry'];

function command_tab(input) {
    $('input.input_current').val(input);
}

function command_pry(input) {
    pry_mode = input == 'true';
}

$(function() {
    $('input.input_current').val(window.location.hash.substring(1, window.location.hash.length));
    moveCursorToEnd($('input.input_current')[0]);
    document.onkeypress = function(e) {
        var focused = $('input.input_current').is(':focus');
        $('input.input_current').focus();
    };
    Mousetrap.bind(['left', 'right', 'up', 'down', 'backspace'],
        function() {
            $('input.input_current').focus();
        });
    var world = new World('#world');
    var socket = io.connect('http://localhost:3000');
    var last_sent_date = new Date();
    var last_received_date = new Date();
    var resizeUI = function() {
        var pr = window.innerWidth - 1000;
        if (pr < 0) {
            pr = 0;
        }
        $('#world').css('padding-right', pr + 'px');
        $('#input input').width(window.innerWidth - 30);
        $('.output').height(window.innerHeight - 70);
        $('.output').attr({ scrollTop: $('.output').attr('scrollHeight') });
    };
    resizeUI();
    window.sendMsg = function(msg) {
        last_sent_date = new Date();
        socket.emit('client_command', msg);
        world.cleanHeight();
    };
    socket.on('connect', function() {
        $('input.input_current').focus();
        $('input').unbind("keyup");
        $('input').keyup(function(event) {
            if (event.keyCode == 13) {
                var msg = $('input.input_current').val();
                world.selfMesssage(msg);
                if (world.input_current == 'input_password') {
                    if (msg.length > 0) {
                        $('input.input_current').val('');
                        world.setInputStandard();  
                    }
                } else {
                    $('input#input_standard').select();
                    world.updateHistory(msg); 
                }
                sendMsg(msg);
            } else if (event.keyCode == 9) {
                if (pry_mode) {
                    sendMsg("TabCommand.pry_complete _pry_, \"" + input_val() + "\";");
                }
                else {
                    sendMsg("_tab " + input_val());
                }
            } else if (event.keyCode == 38 && world.input_current != 'input_password') {
                if (world.history[world.current - 1]) {
                    $('input').val(world.history[world.current -= 1]);
                }
            } else if (event.keyCode == 40 && world.input_current != 'input_password') {
                if (world.history[world.current]) {
                    $('input').val(world.history[world.current += 1]);
                }
            }
        });
        $('input').keydown(function(event) {
            if (event.keyCode == 9) {
                $('input.input_current').focus();
                // socket.emit('message', msg) get end of cmd typed
                return false;
            }
        });
        window.onresize = function(event) {
            resizeUI();
        };
        // if (window.location.hash.indexOf("#firefox") == 0)
        //   sendMsg("_homepage")
    });
    socket.on('server_command', function(_message) {
        message = _message;
        execute_message_commands();
        world.update(formatter_go(message));
        world.cleanHeight();
        last_received_date = new Date();
        // console.clear()
        // console.log(last_received_date.getTime() - last_sent_date.getTime() + "ms")
    });
    socket.on('error', function(ecode_or_error) {
        if (ecode_or_error == 'EPIPE') {
            return world.update(formatter_go('\r\nErreur : la connection a été coupée.\r\n'));
        }
        world.update(formatter_go('\r\nErreur : ' + ecode_or_error.code + '\r\n'));
        console.error(ecode_or_error);
    });
    socket.on('end', function() {
        // world.update(formatter_go('\r\nLa connection a été terminée.\r\n'))
    });
    socket.on('close', function(had_error) {
        if (had_error) {
            return world.update(formatter_go('\r\nLa connection a été coupée suite à une erreur.\r\n'));
        }
        world.update(formatter_go('\r\nLa connection a été fermée.\r\n'));
    });
});