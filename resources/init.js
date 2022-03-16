'use strict';
async function loadAdditionalHljsScript() {
    const list = mw.config.get('hljsAdditionalLanguages');
    if (list && list.length) {
        const loadScript = async (url) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.onload = () => resolve();
                script.src = url;
                document.body.appendChild(script);
            });
        };
        const url = mw.config.get('hljsAdditionalLanguageScript');
        await Promise.all(
            [...new Set(list)].map((lang) => loadScript(url.replace('*', lang)))
        );
    }
}

async function highlightPre() {
    if (
        mw.config.get('wgHljsEnableForScribunto') &&
        mw.config.get('wgPageContentModel') === 'Scribunto'
    ) {
        $('.mw-parser-output>pre.mw-code.mw-script:last').addClass([
            'hljs',
            'line',
            'language-lua',
        ]);
    }

    $('pre.hljs').each(function (i, v) {
        const pre = $(v);
        pre.html(pre.html().replace(/^\n+/, '').trimEnd());
        const wrapper = $('<div>').addClass('hljsw-wrapper');
        const header = $('<div>').addClass('hljsw-header').hide();
        const content = $('<div>').addClass('hljsw-content');
        pre.before(wrapper);
        wrapper.append(header);
        wrapper.append(content);
        pre.appendTo(content);
        if (pre.attr('data-style')) {
            pre.attr('style', pre.attr('style') + pre.attr('data-style'));
            pre.removeAttr('data-style');
        }
        if (pre.attr('data-wrapper-style')) {
            wrapper.attr('style', pre.attr('data-wrapper-style'));
            pre.removeAttr('data-wrapper-style');
        }
        if (pre.hasClass('copy')) {
            header.show();
            const id = Math.random().toString(36).slice(-6);
            pre.after(
                $('<pre>')
                    .attr('id', 'hljsw-copysource-' + id)
                    .html(pre.html())
                    .hide()
            );
            header.append(
                $('<div>')
                    .attr('data-copysource', id)
                    .addClass('hljsw-copybutton')
                    .append(
                        '<i class="far fa-copy fa-fw"></i> ' +
                            '<i class="fas fa-check fa-fw hljsw-copied-icon" style="display:none"></i> ' +
                            mw.message('hljs-copy').text()
                    )
                    .on('click', function () {
                        const e = $(this);
                        if (e.hasClass('clicked')) return;
                        e.addClass('clicked');
                        navigator.clipboard.writeText(
                            $(
                                '#hljsw-copysource-' + e.attr('data-copysource')
                            ).text()
                        );
                        e.children('i:nth-child(1)').toggle();
                        e.children('i:nth-child(2)').toggle();
                        setTimeout(() => {
                            e.children('i:nth-child(1)').fadeToggle();
                            e.children('i:nth-child(2)').toggle();
                            e.removeClass('clicked');
                        }, 2000);
                    })
            );
        }
        if (pre.attr('data-title')) {
            header.show();
            header.prepend(
                $('<div>').addClass('hljsw-title').html(pre.attr('data-title'))
            );
            pre.removeAttr('data-title');
        }
        pre.css('color', '');
        pre.removeClass('loading');
        hljs.highlightElement(pre.get(0));
        if (pre.hasClass('line')) {
            const line = $('<pre>').addClass('hljsw-linenumber');
            content.prepend(line);
            const rawLineStart = parseInt(pre.attr('data-linestart'));
            const lineStart =
                !isNaN(rawLineStart) && rawLineStart > 0 ? rawLineStart : 1;
            for (
                let i = lineStart,
                    l = pre.text().split('\n').length + lineStart;
                i < l;
                i++
            ) {
                line.append(
                    $('<div>')
                        .addClass('linenumber line-' + i)
                        .text(i)
                );
            }
            pre.removeAttr('data-linestart');
            pre.html(
                pre
                    .html()
                    .split('\n')
                    .map((l, i) =>
                        $('<div>')
                            .addClass(`line line-${lineStart + i}`)
                            .html(l)
                    )
            );
            if (pre.attr('data-markline')) {
                const marks = pre.attr('data-markline');
                if (/^(\d+,)+\d+$/.test(marks)) {
                    marks.split(',').forEach((l) => {
                        content.find('.line-' + l).addClass('marked');
                    });
                } else if (/^\d+-\d+$/.test(marks)) {
                    const _ = marks.split('-').map((l) => parseInt(l));
                    for (let i = _[0], end = _[1] + 1; i < end; i++) {
                        content.find('.line-' + i).addClass('marked');
                    }
                }
            }
        }
    });
}

async function highlightCode() {
    $('code.hljs').each((i, e) => hljs.highlightElement(e));
}

(async () => {
    const defer = (callback) => {
        if (typeof hljs == 'undefined') setTimeout(() => defer(callback), 250);
        else callback();
    };
    defer(async () => {
        await loadAdditionalHljsScript();
        Promise.all([highlightPre(), highlightCode()]);
    });
})();
