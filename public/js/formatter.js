var attributes = {
    0:  'normal',
    1:  'bold',
    4:  'underline',
    30: 'black',
    31: 'red',
    32: 'green',
    33: 'yellow',
    34: 'blue',
    35: 'magenta',
    36: 'cyan',
    37: 'white',
    40: 'black-bg',
    41: 'red-bg',
    42: 'green-bg',
    43: 'yellow-bg',
    44: 'blue-bg',
    45: 'magenta-bg',
    46: 'cyan-bg',
    47: 'white-bg',
};

function formatter_go(data) {
    var matches = data.match(/\x1b\[((\d*);){0,2}(\d*)m/g);
    data = data.replace(/</g, '&lt;');
    data = data.replace(/>/g, '&gt;');
    var current_bg = '';
    var current_fg = 'normal';
    if (matches) {
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var codes = match.replace('\x1b[', '').replace('m', '').split(';');
            for (var c = 0; c < codes.length; c++) {
                num = parseInt(codes[c]);
                if (num >= 40) {
                    current_bg = attributes[codes[c]];
                } else if (num == 0) {
                    current_bg = '';
                    current_fg = 'normal';
                } else if (num >= 30) {
                    current_fg = attributes[codes[c]];
                }
                codes[c] = attributes[codes[c]];
            }
            data = data.replace(match, '</span><span class="' + current_fg + ' ' + current_bg + '">');
        }
    }
    return data;
}
