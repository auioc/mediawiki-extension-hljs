<?php

class HLJSHooks
{
    public static function onParserFirstCallInit(Parser $parser)
    {
        global $wgOut,$wgHljsScriptURL,$wgHljsStyleURL;

        $wgOut->addJsConfigVars('wgHljsScriptURL', $wgHljsScriptURL);
        $wgOut->addJsConfigVars('wgHljsStyleURL', $wgHljsStyleURL);

        $parser->setHook('hljs', __CLASS__.'::render');
    }

    public static function render($input, array $args, Parser $parser, PPFrame $frame)
    {
        $parser->getOutput()->addModules('ext.HLJS');

        $code = htmlspecialchars(trim($input));

        $lang = isset($args['lang']) ? ' language-'.$args['lang'] : '';
        $inline = isset($args['inline']);
        $class = isset($args['class']) ? ' '.$args['class'] : '';

        $htmlAttribs = [];

        $htmlAttribs['class'] = 'hljs'.$lang.$class;

        if (isset($args['style'])) {
            $htmlAttribs['style'] = $args['style'];
        }

        if ($inline) {
            $htmlAttribs['style'] .= 'display: inline;';
            $output = Html::rawElement('code', $htmlAttribs, $code);
        } else {
            if (isset($args['copyable'])) {
                $htmlAttribs['class'] .= ' copyable';
            }
            if (isset($args['title'])) {
                $htmlAttribs['data-title'] = $args['title'];
            }
            $output = Html::rawElement('pre', $htmlAttribs, $code);
        }

        return $output;
    }
}
