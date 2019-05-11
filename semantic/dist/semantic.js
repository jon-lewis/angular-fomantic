 /*
 * # Fomantic UI - 2.7.4
 * https://github.com/fomantic/Fomantic-UI
 * http://fomantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
/*!
 * # Semantic UI 2.7.4 - Site
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.isFunction = $.isFunction || function(obj) {
    return typeof obj === "function" && typeof obj.nodeType !== "number";
};

$.site = $.fn.site = function(parameters) {
  var
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    settings        = ( $.isPlainObject(parameters) )
      ? $.extend(true, {}, $.site.settings, parameters)
      : $.extend({}, $.site.settings),

    namespace       = settings.namespace,
    error           = settings.error,

    moduleNamespace = 'module-' + namespace,

    $document       = $(document),
    $module         = $document,
    element         = this,
    instance        = $module.data(moduleNamespace),

    module,
    returnedValue
  ;
  module = {

    initialize: function() {
      module.instantiate();
    },

    instantiate: function() {
      module.verbose('Storing instance of site', module);
      instance = module;
      $module
        .data(moduleNamespace, module)
      ;
    },

    normalize: function() {
      module.fix.console();
      module.fix.requestAnimationFrame();
    },

    fix: {
      console: function() {
        module.debug('Normalizing window.console');
        if (console === undefined || console.log === undefined) {
          module.verbose('Console not available, normalizing events');
          module.disable.console();
        }
        if (typeof console.group == 'undefined' || typeof console.groupEnd == 'undefined' || typeof console.groupCollapsed == 'undefined') {
          module.verbose('Console group not available, normalizing events');
          window.console.group = function() {};
          window.console.groupEnd = function() {};
          window.console.groupCollapsed = function() {};
        }
        if (typeof console.markTimeline == 'undefined') {
          module.verbose('Mark timeline not available, normalizing events');
          window.console.markTimeline = function() {};
        }
      },
      consoleClear: function() {
        module.debug('Disabling programmatic console clearing');
        window.console.clear = function() {};
      },
      requestAnimationFrame: function() {
        module.debug('Normalizing requestAnimationFrame');
        if(window.requestAnimationFrame === undefined) {
          module.debug('RequestAnimationFrame not available, normalizing event');
          window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { setTimeout(callback, 0); }
          ;
        }
      }
    },

    moduleExists: function(name) {
      return ($.fn[name] !== undefined && $.fn[name].settings !== undefined);
    },

    enabled: {
      modules: function(modules) {
        var
          enabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(module.moduleExists(name)) {
            enabledModules.push(name);
          }
        });
        return enabledModules;
      }
    },

    disabled: {
      modules: function(modules) {
        var
          disabledModules = []
        ;
        modules = modules || settings.modules;
        $.each(modules, function(index, name) {
          if(!module.moduleExists(name)) {
            disabledModules.push(name);
          }
        });
        return disabledModules;
      }
    },

    change: {
      setting: function(setting, value, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? (modules === 'all')
            ? settings.modules
            : [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            namespace = (module.moduleExists(name))
              ? $.fn[name].settings.namespace || false
              : true,
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', setting, value, name);
            $.fn[name].settings[setting] = value;
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.length > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', setting, value);
              }
            }
          }
        });
      },
      settings: function(newSettings, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        $.each(modules, function(index, name) {
          var
            $existingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', newSettings, name);
            $.extend(true, $.fn[name].settings, newSettings);
            if(modifyExisting && namespace) {
              $existingModules = $(':data(module-' + namespace + ')');
              if($existingModules.length > 0) {
                module.verbose('Modifying existing settings', $existingModules);
                $existingModules[name]('setting', newSettings);
              }
            }
          }
        });
      }
    },

    enable: {
      console: function() {
        module.console(true);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling debug for modules', modules);
        module.change.setting('debug', true, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling verbose debug for modules', modules);
        module.change.setting('verbose', true, modules, modifyExisting);
      }
    },
    disable: {
      console: function() {
        module.console(false);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling debug for modules', modules);
        module.change.setting('debug', false, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling verbose debug for modules', modules);
        module.change.setting('verbose', false, modules, modifyExisting);
      }
    },

    console: function(enable) {
      if(enable) {
        if(instance.cache.console === undefined) {
          module.error(error.console);
          return;
        }
        module.debug('Restoring console function');
        window.console = instance.cache.console;
      }
      else {
        module.debug('Disabling console function');
        instance.cache.console = window.console;
        window.console = {
          clear          : function(){},
          error          : function(){},
          group          : function(){},
          groupCollapsed : function(){},
          groupEnd       : function(){},
          info           : function(){},
          log            : function(){},
          markTimeline   : function(){},
          warn           : function(){}
        };
      }
    },

    destroy: function() {
      module.verbose('Destroying previous site for', $module);
      $module
        .removeData(moduleNamespace)
      ;
    },

    cache: {},

    setting: function(name, value) {
      if( $.isPlainObject(name) ) {
        $.extend(true, settings, name);
      }
      else if(value !== undefined) {
        settings[name] = value;
      }
      else {
        return settings[name];
      }
    },
    internal: function(name, value) {
      if( $.isPlainObject(name) ) {
        $.extend(true, module, name);
      }
      else if(value !== undefined) {
        module[name] = value;
      }
      else {
        return module[name];
      }
    },
    debug: function() {
      if(settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.debug.apply(console, arguments);
        }
      }
    },
    verbose: function() {
      if(settings.verbose && settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.verbose.apply(console, arguments);
        }
      }
    },
    error: function() {
      module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
      module.error.apply(console, arguments);
    },
    performance: {
      log: function(message) {
        var
          currentTime,
          executionTime,
          previousTime
        ;
        if(settings.performance) {
          currentTime   = new Date().getTime();
          previousTime  = time || currentTime;
          executionTime = currentTime - previousTime;
          time          = currentTime;
          performance.push({
            'Element'        : element,
            'Name'           : message[0],
            'Arguments'      : [].slice.call(message, 1) || '',
            'Execution Time' : executionTime
          });
        }
        clearTimeout(module.performance.timer);
        module.performance.timer = setTimeout(module.performance.display, 500);
      },
      display: function() {
        var
          title = settings.name + ':',
          totalTime = 0
        ;
        time = false;
        clearTimeout(module.performance.timer);
        $.each(performance, function(index, data) {
          totalTime += data['Execution Time'];
        });
        title += ' ' + totalTime + 'ms';
        if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
          console.groupCollapsed(title);
          if(console.table) {
            console.table(performance);
          }
          else {
            $.each(performance, function(index, data) {
              console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
            });
          }
          console.groupEnd();
        }
        performance = [];
      }
    },
    invoke: function(query, passedArguments, context) {
      var
        object = instance,
        maxDepth,
        found,
        response
      ;
      passedArguments = passedArguments || queryArguments;
      context         = element         || context;
      if(typeof query == 'string' && object !== undefined) {
        query    = query.split(/[\. ]/);
        maxDepth = query.length - 1;
        $.each(query, function(depth, value) {
          var camelCaseValue = (depth != maxDepth)
            ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
            : query
          ;
          if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
            object = object[camelCaseValue];
          }
          else if( object[camelCaseValue] !== undefined ) {
            found = object[camelCaseValue];
            return false;
          }
          else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
            object = object[value];
          }
          else if( object[value] !== undefined ) {
            found = object[value];
            return false;
          }
          else {
            module.error(error.method, query);
            return false;
          }
        });
      }
      if ( $.isFunction( found ) ) {
        response = found.apply(context, passedArguments);
      }
      else if(found !== undefined) {
        response = found;
      }
      if(Array.isArray(returnedValue)) {
        returnedValue.push(response);
      }
      else if(returnedValue !== undefined) {
        returnedValue = [returnedValue, response];
      }
      else if(response !== undefined) {
        returnedValue = response;
      }
      return found;
    }
  };

  if(methodInvoked) {
    if(instance === undefined) {
      module.initialize();
    }
    module.invoke(query);
  }
  else {
    if(instance !== undefined) {
      module.destroy();
    }
    module.initialize();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.site.settings = {

  name        : 'Site',
  namespace   : 'site',

  error : {
    console : 'Console cannot be restored, most likely it was overwritten outside of module',
    method : 'The method you called is not defined.'
  },

  debug       : false,
  verbose     : false,
  performance : true,

  modules: [
    'accordion',
    'api',
    'calendar',
    'checkbox',
    'dimmer',
    'dropdown',
    'embed',
    'form',
    'modal',
    'nag',
    'popup',
    'slider',
    'rating',
    'shape',
    'sidebar',
    'state',
    'sticky',
    'tab',
    'toast',
    'transition',
    'visibility',
    'visit'
  ],

  siteNamespace   : 'site',
  namespaceStub   : {
    cache     : {},
    config    : {},
    sections  : {},
    section   : {},
    utilities : {}
  }

};

// allows for selection of elements with data attributes
$.extend($.expr[ ":" ], {
  data: ($.expr.createPseudo)
    ? $.expr.createPseudo(function(dataName) {
        return function(elem) {
          return !!$.data(elem, dataName);
        };
      })
    : function(elem, i, match) {
      // support: jQuery < 1.8
      return !!$.data(elem, match[ 3 ]);
    }
});


})( jQuery, window, document );

/*!
 * # Semantic UI 2.7.4 - Dimmer
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

'use strict';

$.isFunction = $.isFunction || function(obj) {
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

window = (typeof window != 'undefined' && window.Math == Math)
  ? window
  : (typeof self != 'undefined' && self.Math == Math)
    ? self
    : Function('return this')()
;

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
          : $.extend({}, $.fn.dimmer.settings),

        selector        = settings.selector,
        namespace       = settings.namespace,
        className       = settings.className,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        clickEvent      = ('ontouchstart' in document.documentElement)
          ? 'touchstart'
          : 'click',

        $module = $(this),
        $dimmer,
        $dimmable,

        element   = this,
        instance  = $module.data(moduleNamespace),
        module
      ;

      module = {

        preinitialize: function() {
          if( module.is.dimmer() ) {

            $dimmable = $module.parent();
            $dimmer   = $module;
          }
          else {
            $dimmable = $module;
            if( module.has.dimmer() ) {
              if(settings.dimmerName) {
                $dimmer = $dimmable.find(selector.dimmer).filter('.' + settings.dimmerName);
              }
              else {
                $dimmer = $dimmable.find(selector.dimmer);
              }
            }
            else {
              $dimmer = module.create();
            }
          }
        },

        initialize: function() {
          module.debug('Initializing dimmer', settings);

          module.bind.events();
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', $dimmer);
          module.unbind.events();
          module.remove.variation();
          $dimmable
            .off(eventNamespace)
          ;
        },

        bind: {
          events: function() {
            if(settings.on == 'hover') {
              $dimmable
                .on('mouseenter' + eventNamespace, module.show)
                .on('mouseleave' + eventNamespace, module.hide)
              ;
            }
            else if(settings.on == 'click') {
              $dimmable
                .on(clickEvent + eventNamespace, module.toggle)
              ;
            }
            if( module.is.page() ) {
              module.debug('Setting as a page dimmer', $dimmable);
              module.set.pageDimmer();
            }

            if( module.is.closable() ) {
              module.verbose('Adding dimmer close event', $dimmer);
              $dimmable
                .on(clickEvent + eventNamespace, selector.dimmer, module.event.click)
              ;
            }
          }
        },

        unbind: {
          events: function() {
            $module
              .removeData(moduleNamespace)
            ;
            $dimmable
              .off(eventNamespace)
            ;
          }
        },

        event: {
          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).length === 0 || $(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }
        },

        addContent: function(element) {
          var
            $content = $(element)
          ;
          module.debug('Add content to dimmer', $content);
          if($content.parent()[0] !== $dimmer[0]) {
            $content.detach().appendTo($dimmer);
          }
        },

        create: function() {
          var
            $element = $( settings.template.dimmer(settings) )
          ;
          if(settings.dimmerName) {
            module.debug('Creating named dimmer', settings.dimmerName);
            $element.addClass(settings.dimmerName);
          }
          $element
            .appendTo($dimmable)
          ;
          return $element;
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', $dimmer, settings);
          module.set.variation();
          if( (!module.is.dimmed() || module.is.animating()) && module.is.enabled() ) {
            module.animate.show(callback);
            settings.onShow.call(element);
            settings.onChange.call(element);
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.dimmed() || module.is.animating() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            settings.onHide.call(element);
            settings.onChange.call(element);
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( !module.is.dimmed() ) {
            module.show();
          }
          else {
            if ( module.is.closable() ) {
              module.hide();
            }
          }
        },

        animate: {
          show: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              if(settings.useFlex) {
                module.debug('Using flex dimmer');
                module.remove.legacy();
              }
              else {
                module.debug('Using legacy non-flex dimmer');
                module.set.legacy();
              }
              if(settings.opacity !== 'auto') {
                module.set.opacity();
              }
              $dimmer
                .transition({
                  displayType : settings.useFlex
                    ? 'flex'
                    : 'block',
                  animation   : settings.transition + ' in',
                  queue       : false,
                  duration    : module.get.duration(),
                  useFailSafe : true,
                  onStart     : function() {
                    module.set.dimmed();
                  },
                  onComplete  : function() {
                    module.set.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              module.set.dimmed();
              if(settings.opacity == 'auto') {
                settings.opacity = 0.8;
              }
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(module.get.duration(), settings.opacity, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition({
                  displayType : settings.useFlex
                    ? 'flex'
                    : 'block',
                  animation   : settings.transition + ' out',
                  queue       : false,
                  duration    : module.get.duration(),
                  useFailSafe : true,
                  onComplete  : function() {
                    module.remove.dimmed();
                    module.remove.variation();
                    module.remove.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              $dimmer
                .stop()
                .fadeOut(module.get.duration(), function() {
                  module.remove.dimmed();
                  module.remove.active();
                  $dimmer.removeAttr('style');
                  callback();
                })
              ;
            }
          }
        },

        get: {
          dimmer: function() {
            return $dimmer;
          },
          duration: function() {
            if(typeof settings.duration == 'object') {
              if( module.is.active() ) {
                return settings.duration.hide;
              }
              else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function() {
            if(settings.dimmerName) {
              return ($module.find(selector.dimmer).filter('.' + settings.dimmerName).length > 0);
            }
            else {
              return ( $module.find(selector.dimmer).length > 0 );
            }
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.is(':animated') || $dimmer.hasClass(className.animating) );
          },
          closable: function() {
            if(settings.closable == 'auto') {
              if(settings.on == 'hover') {
                return false;
              }
              return true;
            }
            return settings.closable;
          },
          dimmer: function() {
            return $module.hasClass(className.dimmer);
          },
          dimmable: function() {
            return $module.hasClass(className.dimmable);
          },
          dimmed: function() {
            return $dimmable.hasClass(className.dimmed);
          },
          disabled: function() {
            return $dimmable.hasClass(className.disabled);
          },
          enabled: function() {
            return !module.is.disabled();
          },
          page: function () {
            return $dimmable.is('body');
          },
          pageDimmer: function() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          opacity: function(opacity) {
            var
              color      = $dimmer.css('background-color'),
              colorArray = color.split(','),
              isRGB      = (colorArray && colorArray.length == 3),
              isRGBA     = (colorArray && colorArray.length == 4)
            ;
            opacity    = settings.opacity === 0 ? 0 : settings.opacity || opacity;
            if(isRGB || isRGBA) {
              colorArray[3] = opacity + ')';
              color         = colorArray.join(',');
            }
            else {
              color = 'rgba(0, 0, 0, ' + opacity + ')';
            }
            module.debug('Setting opacity to', opacity);
            $dimmer.css('background-color', color);
          },
          legacy: function() {
            $dimmer.addClass(className.legacy);
          },
          active: function() {
            $dimmer.addClass(className.active);
          },
          dimmable: function() {
            $dimmable.addClass(className.dimmable);
          },
          dimmed: function() {
            $dimmable.addClass(className.dimmed);
          },
          pageDimmer: function() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          },
          variation: function(variation) {
            variation = variation || settings.variation;
            if(variation) {
              $dimmer.addClass(variation);
            }
          }
        },

        remove: {
          active: function() {
            $dimmer
              .removeClass(className.active)
            ;
          },
          legacy: function() {
            $dimmer.removeClass(className.legacy);
          },
          dimmed: function() {
            $dimmable.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          },
          variation: function(variation) {
            variation = variation || settings.variation;
            if(variation) {
              $dimmer.removeClass(variation);
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            if($.isPlainObject(settings[name])) {
              $.extend(true, settings[name], value);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(!settings.silent && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(!settings.silent && settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          if(!settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          }
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.length > 1) {
              title += ' ' + '(' + $allModules.length + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(Array.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      module.preinitialize();

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          instance.invoke('destroy');
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  silent      : false,
  debug       : false,
  verbose     : false,
  performance : true,

  // whether should use flex layout
  useFlex     : true,

  // name to distinguish between multiple dimmers in context
  dimmerName  : false,

  // whether to add a variation type
  variation   : false,

  // whether to bind close events
  closable    : 'auto',

  // whether to use css animations
  useCSS      : true,

  // css animation to use
  transition  : 'fade',

  // event to bind to
  on          : false,

  // overriding opacity value
  opacity     : 'auto',

  // transition durations
  duration    : {
    show : 500,
    hide : 500
  },
// whether the dynamically created dimmer should have a loader
  displayLoader: false,
  loaderText  : false,
  loaderVariation : '',

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  className : {
    active     : 'active',
    animating  : 'animating',
    dimmable   : 'dimmable',
    dimmed     : 'dimmed',
    dimmer     : 'dimmer',
    disabled   : 'disabled',
    hide       : 'hide',
    legacy     : 'legacy',
    pageDimmer : 'page',
    show       : 'show',
    loader     : 'ui loader'
  },

  selector: {
    dimmer   : '> .ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function(settings) {
        var d = $('<div/>').addClass('ui dimmer'),l;
        if(settings.displayLoader) {
          l = $('<div/>')
              .addClass(settings.className.loader)
              .addClass(settings.loaderVariation);
          if(!!settings.loaderText){
            l.text(settings.loaderText);
            l.addClass('text');
          }
          d.append(l);
        }
        return d;
    }
  }

};

})( jQuery, window, document );

/*!
 * # Semantic UI 2.7.4 - Transition
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

'use strict';

$.isFunction = $.isFunction || function(obj) {
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

window = (typeof window != 'undefined' && window.Math == Math)
  ? window
  : (typeof self != 'undefined' && self.Math == Math)
    ? self
    : Function('return this')()
;

$.fn.transition = function() {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query === 'string'),

    returnedValue
  ;
  $allModules
    .each(function(index) {
      var
        $module  = $(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        animationEnd,

        moduleNamespace,
        eventNamespace,
        module
      ;

      module = {

        initialize: function() {

          // get full settings
          settings        = module.get.settings.apply(element, moduleArguments);

          // shorthand
          className       = settings.className;
          error           = settings.error;
          metadata        = settings.metadata;

          // define namespace
          eventNamespace  = '.' + settings.namespace;
          moduleNamespace = 'module-' + settings.namespace;
          instance        = $module.data(moduleNamespace) || module;

          // get vendor specific events
          animationEnd    = module.get.animationEndEvent();

          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }

          // method not invoked, lets run an animation
          if(methodInvoked === false) {
            module.verbose('Converted arguments into settings object', settings);
            if(settings.interval) {
              module.delay(settings.animate);
            }
            else  {
              module.animate();
            }
            module.instantiate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing display type on next animation');
          delete module.displayType;
        },

        forceRepaint: function() {
          module.verbose('Forcing element repaint');
          var
            $parentElement = $module.parent(),
            $nextElement = $module.next()
          ;
          if($nextElement.length === 0) {
            $module.detach().appendTo($parentElement);
          }
          else {
            $module.detach().insertBefore($nextElement);
          }
        },

        repaint: function() {
          module.verbose('Repainting element');
          var
            fakeAssignment = element.offsetWidth
          ;
        },

        delay: function(interval) {
          var
            direction = module.get.animationDirection(),
            shouldReverse,
            delay
          ;
          if(!direction) {
            direction = module.can.transition()
              ? module.get.direction()
              : 'static'
            ;
          }
          interval = (interval !== undefined)
            ? interval
            : settings.interval
          ;
          shouldReverse = (settings.reverse == 'auto' && direction == className.outward);
          delay = (shouldReverse || settings.reverse == true)
            ? ($allModules.length - index) * settings.interval
            : index * settings.interval
          ;
          module.debug('Delaying animation by', delay);
          setTimeout(module.animate, delay);
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(!module.is.supported()) {
            module.error(error.support);
            return false;
          }
          module.debug('Preparing animation', settings.animation);
          if(module.is.animating()) {
            if(settings.queue) {
              if(!settings.allowRepeats && module.has.direction() && module.is.occurring() && module.queuing !== true) {
                module.debug('Animation is currently occurring, preventing queueing same animation', settings.animation);
              }
              else {
                module.queue(settings.animation);
              }
              return false;
            }
            else if(!settings.allowRepeats && module.is.occurring()) {
              module.debug('Animation is already occurring, will not execute repeated animation', settings.animation);
              return false;
            }
            else {
              module.debug('New animation started, completing previous early', settings.animation);
              instance.complete();
            }
          }
          if( module.can.animate() ) {
            module.set.animating(settings.animation);
          }
          else {
            module.error(error.noAnimation, settings.animation, element);
          }
        },

        reset: function() {
          module.debug('Resetting animation to beginning conditions');
          module.remove.animationCallbacks();
          module.restore.conditions();
          module.remove.animating();
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          $module
            .one(animationEnd + '.queue' + eventNamespace, function() {
              module.queuing = false;
              module.repaint();
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function (event) {
          module.debug('Animation complete', settings.animation);
          module.remove.completeCallback();
          module.remove.failSafe();
          if(!module.is.looping()) {
            if( module.is.outward() ) {
              module.verbose('Animation is outward, hiding element');
              module.restore.conditions();
              module.hide();
            }
            else if( module.is.inward() ) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
            }
            else {
              module.verbose('Static animation completed');
              module.restore.conditions();
              settings.onComplete.call(element);
            }
          }
        },

        force: {
          visible: function() {
            var
              style          = $module.attr('style'),
              userStyle      = module.get.userStyle(style),
              displayType    = module.get.displayType(),
              overrideStyle  = userStyle + 'display: ' + displayType + ' !important;',
              inlineDisplay  = $module[0].style.display,
              mustStayHidden = !displayType || (inlineDisplay === 'none' && settings.skipInlineHidden) || $module[0].tagName.match(/(script|link|style)/i)
            ;
            if (mustStayHidden){
              module.remove.transition();
              return false;
            }
            module.verbose('Overriding default display to show element', displayType);
            $module
              .attr('style', overrideStyle)
            ;
            return true;
          },
          hidden: function() {
            var
              style          = $module.attr('style'),
              currentDisplay = $module.css('display'),
              emptyStyle     = (style === undefined || style === '')
            ;
            if(currentDisplay !== 'none' && !module.is.hidden()) {
              module.verbose('Overriding default display to hide element');
              $module
                .css('display', 'none')
              ;
            }
            else if(emptyStyle) {
              $module
                .removeAttr('style')
              ;
            }
          }
        },

        has: {
          direction: function(animation) {
            var
              hasDirection = false
            ;
            animation = animation || settings.animation;
            if(typeof animation === 'string') {
              animation = animation.split(' ');
              $.each(animation, function(index, word){
                if(word === className.inward || word === className.outward) {
                  hasDirection = true;
                }
              });
            }
            return hasDirection;
          },
          inlineDisplay: function() {
            var
              style = $module.attr('style') || ''
            ;
            return Array.isArray(style.match(/display.*?;/, ''));
          }
        },

        set: {
          animating: function(animation) {
            // remove previous callbacks
            module.remove.completeCallback();

            // determine exact animation
            animation = animation || settings.animation;
            var animationClass = module.get.animationClass(animation);

              // save animation class in cache to restore class names
            module.save.animation(animationClass);

            if(module.force.visible()) {
              module.remove.hidden();
              module.remove.direction();

              module.start.animation(animationClass);
            }
          },
          duration: function(animationName, duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            if(duration || duration === 0) {
              module.verbose('Setting animation duration', duration);
              $module
                .css({
                  'animation-duration':  duration
                })
              ;
            }
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            if(direction == className.inward) {
              module.set.inward();
            }
            else {
              module.set.outward();
            }
          },
          looping: function() {
            module.debug('Transition set to loop');
            $module
              .addClass(className.looping)
            ;
          },
          hidden: function() {
            $module
              .addClass(className.transition)
              .addClass(className.hidden)
            ;
          },
          inward: function() {
            module.debug('Setting direction to inward');
            $module
              .removeClass(className.outward)
              .addClass(className.inward)
            ;
          },
          outward: function() {
            module.debug('Setting direction to outward');
            $module
              .removeClass(className.inward)
              .addClass(className.outward)
            ;
          },
          visible: function() {
            $module
              .addClass(className.transition)
              .addClass(className.visible)
            ;
          }
        },

        start: {
          animation: function(animationClass) {
            animationClass = animationClass || module.get.animationClass();
            module.debug('Starting tween', animationClass);
            $module
              .addClass(animationClass)
              .one(animationEnd + '.complete' + eventNamespace, module.complete)
            ;
            if(settings.useFailSafe) {
              module.add.failSafe();
            }
            module.set.duration(settings.duration);
            settings.onStart.call(element);
          }
        },

        save: {
          animation: function(animation) {
            if(!module.cache) {
              module.cache = {};
            }
            module.cache.animation = animation;
          },
          displayType: function(displayType) {
            if(displayType !== 'none') {
              $module.data(metadata.displayType, displayType);
            }
          },
          transitionExists: function(animation, exists) {
            $.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          }
        },

        restore: {
          conditions: function() {
            var
              animation = module.get.currentAnimation()
            ;
            if(animation) {
              $module
                .removeClass(animation)
              ;
              module.verbose('Removing animation class', module.cache);
            }
            module.remove.duration();
          }
        },

        add: {
          failSafe: function() {
            var
              duration = module.get.duration()
            ;
            module.timer = setTimeout(function() {
              $module.triggerHandler(animationEnd);
            }, duration + settings.failSafeDelay);
            module.verbose('Adding fail safe timer', module.timer);
          }
        },

        remove: {
          animating: function() {
            $module.removeClass(className.animating);
          },
          animationCallbacks: function() {
            module.remove.queueCallback();
            module.remove.completeCallback();
          },
          queueCallback: function() {
            $module.off('.queue' + eventNamespace);
          },
          completeCallback: function() {
            $module.off('.complete' + eventNamespace);
          },
          display: function() {
            $module.css('display', '');
          },
          direction: function() {
            $module
              .removeClass(className.inward)
              .removeClass(className.outward)
            ;
          },
          duration: function() {
            $module
              .css('animation-duration', '')
            ;
          },
          failSafe: function() {
            module.verbose('Removing fail safe timer', module.timer);
            if(module.timer) {
              clearTimeout(module.timer);
            }
          },
          hidden: function() {
            $module.removeClass(className.hidden);
          },
          visible: function() {
            $module.removeClass(className.visible);
          },
          looping: function() {
            module.debug('Transitions are no longer looping');
            if( module.is.looping() ) {
              module.reset();
              $module
                .removeClass(className.looping)
              ;
            }
          },
          transition: function() {
            $module
              .removeClass(className.transition)
              .removeClass(className.visible)
              .removeClass(className.hidden)
            ;
          }
        },
        get: {
          settings: function(animation, duration, onComplete) {
            // single settings object
            if(typeof animation == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof onComplete == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : onComplete,
                duration   : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return $.extend({}, $.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return $.extend({}, $.fn.transition.settings, {
                animation  : animation,
                onComplete : duration
              });
            }
            // only animation provided
            else {
              return $.extend({}, $.fn.transition.settings, {
                animation : animation
              });
            }
          },
          animationClass: function(animation) {
            var
              animationClass = animation || settings.animation,
              directionClass = (module.can.transition() && !module.has.direction())
                ? module.get.direction() + ' '
                : ''
            ;
            return className.animating + ' '
              + className.transition + ' '
              + directionClass
              + animationClass
            ;
          },
          currentAnimation: function() {
            return (module.cache && module.cache.animation !== undefined)
              ? module.cache.animation
              : false
            ;
          },
          currentDirection: function() {
            return module.is.inward()
              ? className.inward
              : className.outward
            ;
          },
          direction: function() {
            return module.is.hidden() || !module.is.visible()
              ? className.inward
              : className.outward
            ;
          },
          animationDirection: function(animation) {
            var
              direction
            ;
            animation = animation || settings.animation;
            if(typeof animation === 'string') {
              animation = animation.split(' ');
              // search animation name for out/in class
              $.each(animation, function(index, word){
                if(word === className.inward) {
                  direction = className.inward;
                }
                else if(word === className.outward) {
                  direction = className.outward;
                }
              });
            }
            // return found direction
            if(direction) {
              return direction;
            }
            return false;
          },
          duration: function(duration) {
            duration = duration || settings.duration;
            if(duration === false) {
              duration = $module.css('animation-duration') || 0;
            }
            return (typeof duration === 'string')
              ? (duration.indexOf('ms') > -1)
                ? parseFloat(duration)
                : parseFloat(duration) * 1000
              : duration
            ;
          },
          displayType: function(shouldDetermine) {
            shouldDetermine = (shouldDetermine !== undefined)
              ? shouldDetermine
              : true
            ;
            if(settings.displayType) {
              return settings.displayType;
            }
            if(shouldDetermine && $module.data(metadata.displayType) === undefined) {
              var currentDisplay = $module.css('display');
              if(currentDisplay === '' || currentDisplay === 'none'){
              // create fake element to determine display state
                module.can.transition(true);
              } else {
                module.save.displayType(currentDisplay);
              }
            }
            return $module.data(metadata.displayType);
          },
          userStyle: function(style) {
            style = style || $module.attr('style') || '';
            return style.replace(/display.*?;/, '');
          },
          transitionExists: function(animation) {
            return $.fn.transition.exists[animation];
          },
          animationStartEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationstart',
                'OAnimation'      :'oAnimationStart',
                'MozAnimation'    :'mozAnimationStart',
                'WebkitAnimation' :'webkitAnimationStart'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          },
          animationEndEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          transition: function(forced) {
            var
              animation         = settings.animation,
              transitionExists  = module.get.transitionExists(animation),
              displayType       = module.get.displayType(false),
              elementClass,
              tagName,
              $clone,
              currentAnimation,
              inAnimation,
              directionExists
            ;
            if( transitionExists === undefined || forced) {
              module.verbose('Determining whether animation exists');
              elementClass = $module.attr('class');
              tagName      = $module.prop('tagName');

              $clone = $('<' + tagName + ' />').addClass( elementClass ).insertAfter($module);
              currentAnimation = $clone
                .addClass(animation)
                .removeClass(className.inward)
                .removeClass(className.outward)
                .addClass(className.animating)
                .addClass(className.transition)
                .css('animationName')
              ;
              inAnimation = $clone
                .addClass(className.inward)
                .css('animationName')
              ;
              if(!displayType) {
                displayType = $clone
                  .attr('class', elementClass)
                  .removeAttr('style')
                  .removeClass(className.hidden)
                  .removeClass(className.visible)
                  .show()
                  .css('display')
                ;
                module.verbose('Determining final display state', displayType);
                module.save.displayType(displayType);
              }

              $clone.remove();
              if(currentAnimation != inAnimation) {
                module.debug('Direction exists for animation', animation);
                directionExists = true;
              }
              else if(currentAnimation == 'none' || !currentAnimation) {
                module.debug('No animation defined in css', animation);
                return;
              }
              else {
                module.debug('Static animation found', animation, displayType);
                directionExists = false;
              }
              module.save.transitionExists(animation, directionExists);
            }
            return (transitionExists !== undefined)
              ? transitionExists
              : directionExists
            ;
          },
          animate: function() {
            // can transition does not return a value if animation does not exist
            return (module.can.transition() !== undefined);
          }
        },

        is: {
          animating: function() {
            return $module.hasClass(className.animating);
          },
          inward: function() {
            return $module.hasClass(className.inward);
          },
          outward: function() {
            return $module.hasClass(className.outward);
          },
          looping: function() {
            return $module.hasClass(className.looping);
          },
          occurring: function(animation) {
            animation = animation || settings.animation;
            animation = '.' + animation.replace(' ', '.');
            return ( $module.filter(animation).length > 0 );
          },
          visible: function() {
            return $module.is(':visible');
          },
          hidden: function() {
            return $module.css('visibility') === 'hidden';
          },
          supported: function() {
            return(animationEnd !== false);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          if( module.is.animating() ) {
            module.reset();
          }
          element.blur(); // IE will trigger focus change if element is not blurred before hiding
          module.remove.display();
          module.remove.visible();
          if($.isFunction(settings.onBeforeHide)){
            settings.onBeforeHide.call(element,function(){
                module.hideNow();
            });
          } else {
              module.hideNow();
          }

        },

        hideNow: function() {
            module.set.hidden();
            module.force.hidden();
            settings.onHide.call(element);
            settings.onComplete.call(element);
            // module.repaint();
        },

        show: function(display) {
          module.verbose('Showing element', display);
          if(module.force.visible()) {
            module.remove.hidden();
            module.set.visible();
            settings.onShow.call(element);
            settings.onComplete.call(element);
            // module.repaint();
          }
        },

        toggle: function() {
          if( module.is.visible() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        stop: function() {
          module.debug('Stopping current animation');
          $module.triggerHandler(animationEnd);
        },

        stopAll: function() {
          module.debug('Stopping all animation');
          module.remove.queueCallback();
          $module.triggerHandler(animationEnd);
        },

        clear: {
          queue: function() {
            module.debug('Clearing animation queue');
            module.remove.queueCallback();
          }
        },

        enable: function() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        disable: function() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            if($.isPlainObject(settings[name])) {
              $.extend(true, settings[name], value);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(!settings.silent && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(!settings.silent && settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          if(!settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          }
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.length > 1) {
              title += ' ' + '(' + $allModules.length + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        // modified for transition to return invoke success
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }

          if(Array.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return (found !== undefined)
            ? found
            : false
          ;
        }
      };
      module.initialize();
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

// Records if CSS transition is available
$.fn.transition.exists = {};

$.fn.transition.settings = {

  // module info
  name          : 'Transition',

  // hide all output from this component regardless of other settings
  silent        : false,

  // debug content outputted to console
  debug         : false,

  // verbose debug output
  verbose       : false,

  // performance data output
  performance   : true,

  // event namespace
  namespace     : 'transition',

  // delay between animations in group
  interval      : 0,

  // whether group animations should be reversed
  reverse       : 'auto',

  // animation callback event
  onStart       : function() {},
  onComplete    : function() {},
  onShow        : function() {},
  onHide        : function() {},

  // whether timeout should be used to ensure callback fires in cases animationend does not
  useFailSafe   : true,

  // delay in ms for fail safe
  failSafeDelay : 100,

  // whether EXACT animation can occur twice in a row
  allowRepeats  : false,

  // Override final display type on visible
  displayType   : false,

  // animation duration
  animation     : 'fade',
  duration      : false,

  // new animations will occur after previous ones
  queue         : true,

// whether initially inline hidden objects should be skipped for transition
  skipInlineHidden: false,

  metadata : {
    displayType: 'display'
  },

  className   : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    loading    : 'loading',
    looping    : 'looping',
    outward    : 'out',
    transition : 'transition',
    visible    : 'visible'
  },

  // possible errors
  error: {
    noAnimation : 'Element is no longer attached to DOM. Unable to animate.  Use silent setting to surpress this warning in production.',
    repeated    : 'That animation is already occurring, cancelling repeated animation',
    method      : 'The method you called is not defined',
    support     : 'This browser does not support CSS animations'
  }

};


})( jQuery, window, document );

/*!
 * # Semantic UI 2.7.4 - Calendar
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

'use strict';

$.isFunction = $.isFunction || function(obj) {
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

window = (typeof window != 'undefined' && window.Math == Math)
  ? window
  : (typeof self != 'undefined' && self.Math == Math)
    ? self
    : Function('return this')()
;

$.fn.calendar = function(parameters) {
  var
    $allModules    = $(this),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue,
    timeGapTable = {
      '5': {'row': 4, 'column': 3 },
      '10': {'row': 3, 'column': 2 },
      '15': {'row': 2, 'column': 2 },
      '20': {'row': 3, 'column': 1 },
      '30': {'row': 2, 'column': 1 }
    }
  ;

  $allModules
    .each(function () {
      var
        settings = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.calendar.settings, parameters)
          : $.extend({}, $.fn.calendar.settings),

        className = settings.className,
        namespace = settings.namespace,
        selector = settings.selector,
        formatter = settings.formatter,
        parser = settings.parser,
        metadata = settings.metadata,
        timeGap = timeGapTable[settings.minTimeGap],
        error = settings.error,

        eventNamespace = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module = $(this),
        $input = $module.find(selector.input),
        $container = $module.find(selector.popup),
        $activator = $module.find(selector.activator),

        element = this,
        instance = $module.data(moduleNamespace),

        isTouch,
        isTouchDown = false,
        focusDateUsedForRange = false,
        module
      ;

      module = {

        initialize: function () {
          module.debug('Initializing calendar for', element, $module);

          isTouch = module.get.isTouch();
          module.setup.config();
          module.setup.popup();
          module.setup.inline();
          module.setup.input();
          module.setup.date();
          module.create.calendar();

          module.bind.events();
          module.instantiate();
        },

        instantiate: function () {
          module.verbose('Storing instance of calendar');
          instance = module;
          $module.data(moduleNamespace, instance);
        },

        destroy: function () {
          module.verbose('Destroying previous calendar for', element);
          $module.removeData(moduleNamespace);
          module.unbind.events();
        },

        setup: {
          config: function () {
            if (module.get.minDate() !== null) {
              module.set.minDate($module.data(metadata.minDate));
            }
            if (module.get.maxDate() !== null) {
              module.set.maxDate($module.data(metadata.maxDate));
            }
          },
          popup: function () {
            if (settings.inline) {
              return;
            }
            if (!$activator.length) {
              $activator = $module.children().first();
              if (!$activator.length) {
                return;
              }
            }
            if ($.fn.popup === undefined) {
              module.error(error.popup);
              return;
            }
            if (!$container.length) {
              //prepend the popup element to the activator's parent so that it has less chance of messing with
              //the styling (eg input action button needs to be the last child to have correct border radius)
              $container = $('<div/>').addClass(className.popup).prependTo($activator.parent());
            }
            $container.addClass(className.calendar);
            var onVisible = settings.onVisible;
            var onHidden = settings.onHidden;
            if (!$input.length) {
              //no input, $container has to handle focus/blur
              $container.attr('tabindex', '0');
              onVisible = function () {
                module.focus();
                return settings.onVisible.apply($container, arguments);
              };
              onHidden = function () {
                module.blur();
                return settings.onHidden.apply($container, arguments);
              };
            }
            var onShow = function () {
              //reset the focus date onShow
              module.set.focusDate(module.get.date());
              module.set.mode(settings.startMode);
              return settings.onShow.apply($container, arguments);
            };
            var on = settings.on || ($input.length ? 'focus' : 'click');
            var options = $.extend({}, settings.popupOptions, {
              popup: $container,
              on: on,
              hoverable: on === 'hover',
              onShow: onShow,
              onVisible: onVisible,
              onHide: settings.onHide,
              onHidden: onHidden
            });
            module.popup(options);
          },
          inline: function () {
            if ($activator.length && !settings.inline) {
              return;
            }
            $container = $('<div/>').addClass(className.calendar).appendTo($module);
            if (!$input.length) {
              $container.attr('tabindex', '0');
            }
          },
          input: function () {
            if (settings.touchReadonly && $input.length && isTouch) {
              $input.prop('readonly', true);
            }
          },
          date: function () {
            if (settings.initialDate) {
              var date = parser.date(settings.initialDate, settings);
              module.set.date(date, settings.formatInput, false);
            } else if ($module.data(metadata.date) !== undefined) {
              var date = parser.date($module.data(metadata.date), settings);
              module.set.date(date, settings.formatInput, false);
            } else if ($input.length) {
              var val = $input.val();
              var date = parser.date(val, settings);
              module.set.date(date, settings.formatInput, false);
            }
          }
        },

        create: {
          calendar: function () {
            var i, r, c, p, row, cell, pageGrid;

            var mode = module.get.mode();
            var today = new Date();
            var date = module.get.date();
            var focusDate = module.get.focusDate();
            var display = focusDate || date || settings.initialDate || today;
            display = module.helper.dateInRange(display);

            if (!focusDate) {
              focusDate = display;
              module.set.focusDate(focusDate, false, false);
            }

            var isYear = mode === 'year';
            var isMonth = mode === 'month';
            var isDay = mode === 'day';
            var isHour = mode === 'hour';
            var isMinute = mode === 'minute';
            var isTimeOnly = settings.type === 'time';

            var multiMonth = Math.max(settings.multiMonth, 1);
            var monthOffset = !isDay ? 0 : module.get.monthOffset();

            var minute = display.getMinutes();
            var hour = display.getHours();
            var day = display.getDate();
            var startMonth = display.getMonth() + monthOffset;
            var year = display.getFullYear();

            var columns = isDay ? settings.showWeekNumbers ? 8 : 7 : isHour ? 4 : timeGap['column'];
            var rows = isDay || isHour ? 6 : timeGap['row'];
            var pages = isDay ? multiMonth : 1;

            var container = $container;
            var tooltipPosition = container.hasClass("left") ? "right center" : "left center";
            container.empty();
            if (pages > 1) {
              pageGrid = $('<div/>').addClass(className.grid).appendTo(container);
            }

            for (p = 0; p < pages; p++) {
              if (pages > 1) {
                var pageColumn = $('<div/>').addClass(className.column).appendTo(pageGrid);
                container = pageColumn;
              }

              var month = startMonth + p;
              var firstMonthDayColumn = (new Date(year, month, 1).getDay() - settings.firstDayOfWeek % 7 + 7) % 7;
              if (!settings.constantHeight && isDay) {
                var requiredCells = new Date(year, month + 1, 0).getDate() + firstMonthDayColumn;
                rows = Math.ceil(requiredCells / 7);
              }

              var yearChange = isYear ? 10 : isMonth ? 1 : 0;
              var monthChange = isDay ? 1 : 0;
              var dayChange = isHour || isMinute ? 1 : 0;
              var prevNextDay = isHour || isMinute ? day : 1;
              var prevDate = new Date(year - yearChange, month - monthChange, prevNextDay - dayChange, hour);
              var nextDate = new Date(year + yearChange, month + monthChange, prevNextDay + dayChange, hour);

              var prevLast = isYear ? new Date(Math.ceil(year / 10) * 10 - 9, 0, 0) :
                isMonth ? new Date(year, 0, 0) : isDay ? new Date(year, month, 0) : new Date(year, month, day, -1);
              var nextFirst = isYear ? new Date(Math.ceil(year / 10) * 10 + 1, 0, 1) :
                isMonth ? new Date(year + 1, 0, 1) : isDay ? new Date(year, month + 1, 1) : new Date(year, month, day + 1);

              var tempMode = mode;
              if (isDay && settings.showWeekNumbers){
                tempMode += ' andweek';
              }
              var table = $('<table/>').addClass(className.table).addClass(tempMode).appendTo(container);
              var textColumns = columns;
              //no header for time-only mode
              if (!isTimeOnly) {
                var thead = $('<thead/>').appendTo(table);

                row = $('<tr/>').appendTo(thead);
                cell = $('<th/>').attr('colspan', '' + columns).appendTo(row);

                var headerDate = isYear || isMonth ? new Date(year, 0, 1) :
                  isDay ? new Date(year, month, 1) : new Date(year, month, day, hour, minute);
                var headerText = $('<span/>').addClass(className.link).appendTo(cell);
                headerText.text(formatter.header(headerDate, mode, settings));
                var newMode = isMonth ? (settings.disableYear ? 'day' : 'year') :
                  isDay ? (settings.disableMonth ? 'year' : 'month') : 'day';
                headerText.data(metadata.mode, newMode);

                if (p === 0) {
                  var prev = $('<span/>').addClass(className.prev).appendTo(cell);
                  prev.data(metadata.focusDate, prevDate);
                  prev.toggleClass(className.disabledCell, !module.helper.isDateInRange(prevLast, mode));
                  $('<i/>').addClass(className.prevIcon).appendTo(prev);
                }

                if (p === pages - 1) {
                  var next = $('<span/>').addClass(className.next).appendTo(cell);
                  next.data(metadata.focusDate, nextDate);
                  next.toggleClass(className.disabledCell, !module.helper.isDateInRange(nextFirst, mode));
                  $('<i/>').addClass(className.nextIcon).appendTo(next);
                }
                if (isDay) {
                  row = $('<tr/>').appendTo(thead);
                  if(settings.showWeekNumbers) {
                      cell = $('<th/>').appendTo(row);
                      cell.text(settings.text.weekNo);
                      cell.addClass(className.weekCell);
                      textColumns--;
                  }
                  for (i = 0; i < textColumns; i++) {
                    cell = $('<th/>').appendTo(row);
                    cell.text(formatter.dayColumnHeader((i + settings.firstDayOfWeek) % 7, settings));
                  }
                }
              }

              var tbody = $('<tbody/>').appendTo(table);
              i = isYear ? Math.ceil(year / 10) * 10 - 9 : isDay ? 1 - firstMonthDayColumn : 0;
              for (r = 0; r < rows; r++) {
                row = $('<tr/>').appendTo(tbody);
                if(isDay && settings.showWeekNumbers){
                    cell = $('<th/>').appendTo(row);
                    cell.text(module.get.weekOfYear(year,month,i+1-settings.firstDayOfWeek));
                    cell.addClass(className.weekCell);
                }
                for (c = 0; c < textColumns; c++, i++) {
                  var cellDate = isYear ? new Date(i, month, 1, hour, minute) :
                    isMonth ? new Date(year, i, 1, hour, minute) : isDay ? new Date(year, month, i, hour, minute) :
                      isHour ? new Date(year, month, day, i) : new Date(year, month, day, hour, i * settings.minTimeGap);
                  var cellText = isYear ? i :
                    isMonth ? settings.text.monthsShort[i] : isDay ? cellDate.getDate() :
                      formatter.time(cellDate, settings, true);
                  cell = $('<td/>').addClass(className.cell).appendTo(row);
                  cell.text(cellText);
                  cell.data(metadata.date, cellDate);
                  var adjacent = isDay && cellDate.getMonth() !== ((month + 12) % 12);
                  var disabled = (!settings.selectAdjacentDays && adjacent) || !module.helper.isDateInRange(cellDate, mode) || settings.isDisabled(cellDate, mode) || module.helper.isDisabled(cellDate, mode) || !module.helper.isEnabled(cellDate, mode);
                  if (disabled) {
                    var disabledReason = module.helper.disabledReason(cellDate, mode);
                    if (disabledReason !== null) {
                      cell.attr("data-tooltip", disabledReason[metadata.message]);
                      cell.attr("data-position", tooltipPosition);
                    }
                  }
                  var active = module.helper.dateEqual(cellDate, date, mode);
                  var isToday = module.helper.dateEqual(cellDate, today, mode);
                  cell.toggleClass(className.adjacentCell, adjacent);
                  cell.toggleClass(className.disabledCell, disabled);
                  cell.toggleClass(className.activeCell, active && !adjacent);
                  if (!isHour && !isMinute) {
                    cell.toggleClass(className.todayCell, !adjacent && isToday);
                  }

                  // Allow for external modifications of each cell
                  var cellOptions = {
                    mode: mode,
                    adjacent: adjacent,
                    disabled: disabled,
                    active: active,
                    today: isToday
                  };
                  formatter.cell(cell, cellDate, cellOptions);

                  if (module.helper.dateEqual(cellDate, focusDate, mode)) {
                    //ensure that the focus date is exactly equal to the cell date
                    //so that, if selected, the correct value is set
                    module.set.focusDate(cellDate, false, false);
                  }
                }
              }

              if (settings.today) {
                var todayRow = $('<tr/>').appendTo(tbody);
                var todayButton = $('<td/>').attr('colspan', '' + columns).addClass(className.today).appendTo(todayRow);
                todayButton.text(formatter.today(settings));
                todayButton.data(metadata.date, today);
              }

              module.update.focus(false, table);
            }
          }
        },

        update: {
          focus: function (updateRange, container) {
            container = container || $container;
            var mode = module.get.mode();
            var date = module.get.date();
            var focusDate = module.get.focusDate();
            var startDate = module.get.startDate();
            var endDate = module.get.endDate();
            var rangeDate = (updateRange ? focusDate : null) || date || (!isTouch ? focusDate : null);

            container.find('td').each(function () {
              var cell = $(this);
              var cellDate = cell.data(metadata.date);
              if (!cellDate) {
                return;
              }
              var disabled = cell.hasClass(className.disabledCell);
              var active = cell.hasClass(className.activeCell);
              var adjacent = cell.hasClass(className.adjacentCell);
              var focused = module.helper.dateEqual(cellDate, focusDate, mode);
              var inRange = !rangeDate ? false :
                ((!!startDate && module.helper.isDateInRange(cellDate, mode, startDate, rangeDate)) ||
                (!!endDate && module.helper.isDateInRange(cellDate, mode, rangeDate, endDate)));
              cell.toggleClass(className.focusCell, focused && (!isTouch || isTouchDown) && (!adjacent || (settings.selectAdjacentDays && adjacent)) && !disabled);
              cell.toggleClass(className.rangeCell, inRange && !active && !disabled);
            });
          }
        },

        refresh: function () {
          module.create.calendar();
        },

        bind: {
          events: function () {
            module.debug('Binding events');
            $container.on('mousedown' + eventNamespace, module.event.mousedown);
            $container.on('touchstart' + eventNamespace, module.event.mousedown);
            $container.on('mouseup' + eventNamespace, module.event.mouseup);
            $container.on('touchend' + eventNamespace, module.event.mouseup);
            $container.on('mouseover' + eventNamespace, module.event.mouseover);
            if ($input.length) {
              $input.on('input' + eventNamespace, module.event.inputChange);
              $input.on('focus' + eventNamespace, module.event.inputFocus);
              $input.on('blur' + eventNamespace, module.event.inputBlur);
              $input.on('click' + eventNamespace, module.event.inputClick);
              $input.on('keydown' + eventNamespace, module.event.keydown);
            } else {
              $container.on('keydown' + eventNamespace, module.event.keydown);
            }
          }
        },

        unbind: {
          events: function () {
            module.debug('Unbinding events');
            $container.off(eventNamespace);
            if ($input.length) {
              $input.off(eventNamespace);
            }
          }
        },

        event: {
          mouseover: function (event) {
            var target = $(event.target);
            var date = target.data(metadata.date);
            var mousedown = event.buttons === 1;
            if (date) {
              module.set.focusDate(date, false, true, mousedown);
            }
          },
          mousedown: function (event) {
            if ($input.length) {
              //prevent the mousedown on the calendar causing the input to lose focus
              event.preventDefault();
            }
            isTouchDown = event.type.indexOf('touch') >= 0;
            var target = $(event.target);
            var date = target.data(metadata.date);
            if (date) {
              module.set.focusDate(date, false, true, true);
            }
          },
          mouseup: function (event) {
            //ensure input has focus so that it receives keydown events for calendar navigation
            module.focus();
            event.preventDefault();
            event.stopPropagation();
            isTouchDown = false;
            var target = $(event.target);
            if (target.hasClass("disabled")) {
              return;
            }
            var parent = target.parent();
            if (parent.data(metadata.date) || parent.data(metadata.focusDate) || parent.data(metadata.mode)) {
              //clicked on a child element, switch to parent (used when clicking directly on prev/next <i> icon element)
              target = parent;
            }
            var date = target.data(metadata.date);
            var focusDate = target.data(metadata.focusDate);
            var mode = target.data(metadata.mode);
            if (date) {
              var forceSet = target.hasClass(className.today);
              module.selectDate(date, forceSet);
            }
            else if (focusDate) {
              module.set.focusDate(focusDate);
            }
            else if (mode) {
              module.set.mode(mode);
            }
          },
          keydown: function (event) {
            if (event.keyCode === 27 || event.keyCode === 9) {
              //esc || tab
              module.popup('hide');
            }

            if (module.popup('is visible')) {
              if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
                //arrow keys
                var mode = module.get.mode();
                var bigIncrement = mode === 'day' ? 7 : mode === 'hour' ? 4 : mode === 'minute' ? timeGap['column'] : 3;
                var increment = event.keyCode === 37 ? -1 : event.keyCode === 38 ? -bigIncrement : event.keyCode == 39 ? 1 : bigIncrement;
                increment *= mode === 'minute' ? settings.minTimeGap : 1;
                var focusDate = module.get.focusDate() || module.get.date() || new Date();
                var year = focusDate.getFullYear() + (mode === 'year' ? increment : 0);
                var month = focusDate.getMonth() + (mode === 'month' ? increment : 0);
                var day = focusDate.getDate() + (mode === 'day' ? increment : 0);
                var hour = focusDate.getHours() + (mode === 'hour' ? increment : 0);
                var minute = focusDate.getMinutes() + (mode === 'minute' ? increment : 0);
                var newFocusDate = new Date(year, month, day, hour, minute);
                if (settings.type === 'time') {
                  newFocusDate = module.helper.mergeDateTime(focusDate, newFocusDate);
                }
                if (module.helper.isDateInRange(newFocusDate, mode)) {
                  module.set.focusDate(newFocusDate);
                }
              } else if (event.keyCode === 13) {
                //enter
                var mode = module.get.mode();
                var date = module.get.focusDate();
                if (date && !settings.isDisabled(date, mode) && !module.helper.isDisabled(date, mode) && module.helper.isEnabled(date, mode)) {
                  module.selectDate(date);
                }
                //disable form submission:
                event.preventDefault();
                event.stopPropagation();
              }
            }

            if (event.keyCode === 38 || event.keyCode === 40) {
              //arrow-up || arrow-down
              event.preventDefault(); //don't scroll
              module.popup('show');
            }
          },
          inputChange: function () {
            var val = $input.val();
            var date = parser.date(val, settings);
            module.set.date(date, false);
          },
          inputFocus: function () {
            $container.addClass(className.active);
          },
          inputBlur: function () {
            $container.removeClass(className.active);
            if (settings.formatInput) {
              var date = module.get.date();
              var text = formatter.datetime(date, settings);
              $input.val(text);
            }
          },
          inputClick: function () {
            module.popup('show');
          }
        },

        get: {
          weekOfYear: function(weekYear,weekMonth,weekDay) {
              // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
              var ms1d = 864e5, // milliseconds in a day
                  ms7d = 7 * ms1d; // milliseconds in a week

              return function() { // return a closure so constants get calculated only once
                  var DC3 = Date.UTC(weekYear, weekMonth, weekDay + 3) / ms1d, // an Absolute Day Number
                      AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                      Wyr = new Date(AWN * ms7d).getUTCFullYear();

                  return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
              }();
          },
          date: function () {
            return module.helper.sanitiseDate($module.data(metadata.date)) || null;
          },
          focusDate: function () {
            return $module.data(metadata.focusDate) || null;
          },
          startDate: function () {
            var startModule = module.get.calendarModule(settings.startCalendar);
            return (startModule ? startModule.get.date() : $module.data(metadata.startDate)) || null;
          },
          endDate: function () {
            var endModule = module.get.calendarModule(settings.endCalendar);
            return (endModule ? endModule.get.date() : $module.data(metadata.endDate)) || null;
          },
          minDate: function() {
            return $module.data(metadata.minDate) || null;
          },
          maxDate: function() {
            return $module.data(metadata.maxDate) || null;
          },
          monthOffset: function () {
            return $module.data(metadata.monthOffset) || 0;
          },
          mode: function () {
            //only returns valid modes for the current settings
            var mode = $module.data(metadata.mode) || settings.startMode;
            var validModes = module.get.validModes();
            if ($.inArray(mode, validModes) >= 0) {
              return mode;
            }
            return settings.type === 'time' ? 'hour' :
              settings.type === 'month' ? 'month' :
                settings.type === 'year' ? 'year' : 'day';
          },
          validModes: function () {
            var validModes = [];
            if (settings.type !== 'time') {
              if (!settings.disableYear || settings.type === 'year') {
                validModes.push('year');
              }
              if (!(settings.disableMonth || settings.type === 'year') || settings.type === 'month') {
                validModes.push('month');
              }
              if (settings.type.indexOf('date') >= 0) {
                validModes.push('day');
              }
            }
            if (settings.type.indexOf('time') >= 0) {
              validModes.push('hour');
              if (!settings.disableMinute) {
                validModes.push('minute');
              }
            }
            return validModes;
          },
          isTouch: function () {
            try {
              document.createEvent('TouchEvent');
              return true;
            }
            catch (e) {
              return false;
            }
          },
          calendarModule: function (selector) {
            if (!selector) {
              return null;
            }
            if (!(selector instanceof $)) {
              selector = $module.parent().children(selector).first();
            }
            //assume range related calendars are using the same namespace
            return selector.data(moduleNamespace);
          }
        },

        set: {
          date: function (date, updateInput, fireChange) {
            updateInput = updateInput !== false;
            fireChange = fireChange !== false;
            date = module.helper.sanitiseDate(date);
            date = module.helper.dateInRange(date);

            var mode = module.get.mode();
            var text = formatter.datetime(date, settings);
            if (fireChange && settings.onChange.call(element, date, text, mode) === false) {
              return false;
            }

            module.set.focusDate(date);

            if (settings.isDisabled(date, mode)) {
              return false;
            }

            var endDate = module.get.endDate();
            if (!!endDate && !!date && date > endDate) {
              //selected date is greater than end date in range, so clear end date
              module.set.endDate(undefined);
            }
            module.set.dataKeyValue(metadata.date, date);

            if (updateInput && $input.length) {
              $input.val(text);
            }
          },
          startDate: function (date, refreshCalendar) {
            date = module.helper.sanitiseDate(date);
            var startModule = module.get.calendarModule(settings.startCalendar);
            if (startModule) {
              startModule.set.date(date);
            }
            module.set.dataKeyValue(metadata.startDate, date, refreshCalendar);
          },
          endDate: function (date, refreshCalendar) {
            date = module.helper.sanitiseDate(date);
            var endModule = module.get.calendarModule(settings.endCalendar);
            if (endModule) {
              endModule.set.date(date);
            }
            module.set.dataKeyValue(metadata.endDate, date, refreshCalendar);
          },
          focusDate: function (date, refreshCalendar, updateFocus, updateRange) {
            date = module.helper.sanitiseDate(date);
            date = module.helper.dateInRange(date);
            var isDay = module.get.mode() === 'day';
            var oldFocusDate = module.get.focusDate();
            if (isDay && date && oldFocusDate) {
              var yearDelta = date.getFullYear() - oldFocusDate.getFullYear();
              var monthDelta = yearDelta * 12 + date.getMonth() - oldFocusDate.getMonth();
              if (monthDelta) {
                var monthOffset = module.get.monthOffset() - monthDelta;
                module.set.monthOffset(monthOffset, false);
              }
            }
            var changed = module.set.dataKeyValue(metadata.focusDate, date, refreshCalendar);
            updateFocus = (updateFocus !== false && changed && refreshCalendar === false) || focusDateUsedForRange != updateRange;
            focusDateUsedForRange = updateRange;
            if (updateFocus) {
              module.update.focus(updateRange);
            }
          },
          minDate: function (date) {
            date = module.helper.sanitiseDate(date);
            if (settings.maxDate !== null && settings.maxDate <= date) {
              module.verbose('Unable to set minDate variable bigger that maxDate variable', date, settings.maxDate);
            } else {
              module.setting('minDate', date);
              module.set.dataKeyValue(metadata.minDate, date);
            }
          },
          maxDate: function (date) {
            date = module.helper.sanitiseDate(date);
            if (settings.minDate !== null && settings.minDate >= date) {
              module.verbose('Unable to set maxDate variable lower that minDate variable', date, settings.minDate);
            } else {
              module.setting('maxDate', date);
              module.set.dataKeyValue(metadata.maxDate, date);
            }
          },
          monthOffset: function (monthOffset, refreshCalendar) {
            var multiMonth = Math.max(settings.multiMonth, 1);
            monthOffset = Math.max(1 - multiMonth, Math.min(0, monthOffset));
            module.set.dataKeyValue(metadata.monthOffset, monthOffset, refreshCalendar);
          },
          mode: function (mode, refreshCalendar) {
            module.set.dataKeyValue(metadata.mode, mode, refreshCalendar);
          },
          dataKeyValue: function (key, value, refreshCalendar) {
            var oldValue = $module.data(key);
            var equal = oldValue === value || (oldValue <= value && oldValue >= value); //equality test for dates and string objects
            if (value) {
              $module.data(key, value);
            } else {
              $module.removeData(key);
            }
            refreshCalendar = refreshCalendar !== false && !equal;
            if (refreshCalendar) {
              module.refresh();
            }
            return !equal;
          }
        },

        selectDate: function (date, forceSet) {
          module.verbose('New date selection', date)
          var mode = module.get.mode();
          var complete = forceSet || mode === 'minute' ||
            (settings.disableMinute && mode === 'hour') ||
            (settings.type === 'date' && mode === 'day') ||
            (settings.type === 'month' && mode === 'month') ||
            (settings.type === 'year' && mode === 'year');
          if (complete) {
            var canceled = module.set.date(date) === false;
            if (!canceled && settings.closable) {
              module.popup('hide');
              //if this is a range calendar, show the end date calendar popup and focus the input
              var endModule = module.get.calendarModule(settings.endCalendar);
              if (endModule) {
                endModule.popup('show');
                endModule.focus();
              }
            }
          } else {
            var newMode = mode === 'year' ? (!settings.disableMonth ? 'month' : 'day') :
              mode === 'month' ? 'day' : mode === 'day' ? 'hour' : 'minute';
            module.set.mode(newMode);
            if (mode === 'hour' || (mode === 'day' && module.get.date())) {
              //the user has chosen enough to consider a valid date/time has been chosen
              module.set.date(date);
            } else {
              module.set.focusDate(date);
            }
          }
        },

        changeDate: function (date) {
          module.set.date(date);
        },

        clear: function () {
          module.set.date(undefined);
        },

        popup: function () {
          return $activator.popup.apply($activator, arguments);
        },

        focus: function () {
          if ($input.length) {
            $input.focus();
          } else {
            $container.focus();
          }
        },
        blur: function () {
          if ($input.length) {
            $input.blur();
          } else {
            $container.blur();
          }
        },

        helper: {
          isDisabled: function(date, mode) {
            return mode === 'day' && ((settings.disabledDaysOfWeek.indexOf(date.getDay()) !== -1) || settings.disabledDates.some(function(d){
              if (d instanceof Date) {
                return module.helper.dateEqual(date, d, mode);
              }
              if (d !== null && typeof d === 'object') {
                return module.helper.dateEqual(date, d[metadata.date], mode);
              }
            }));
          },
          isEnabled: function(date, mode) {
            if (mode === 'day') {
              return settings.enabledDates.length == 0 || settings.enabledDates.some(function(d){
                if (d instanceof Date) {
                  return module.helper.dateEqual(date, d, mode);
                }
                if (d !== null && typeof d === 'object') {
                  return module.helper.dateEqual(date, d[metadata.date], mode);
                }
              });
            } else {
              return true;
            }
          },
          disabledReason: function(date, mode) {
            if (mode === 'day') {
              for (var i = 0; i < settings.disabledDates.length; i++) {
                var d = settings.disabledDates[i];
                if (d !== null && typeof d === 'object' && module.helper.dateEqual(date, d[metadata.date], mode)) {
                  var reason = {};
                  reason[metadata.message] = d[metadata.message];
                  return reason;
                }
              }
            }
            return null;
          },
          sanitiseDate: function (date) {
            if (!date) {
              return undefined;
            }
            if (!(date instanceof Date)) {
              date = parser.date('' + date, settings);
            }
            if (isNaN(date.getTime())) {
              return undefined;
            }
            return date;
          },
          dateDiff: function (date1, date2, mode) {
            mode = mode || 'day';
            var isTimeOnly = settings.type === 'time';
            var isYear = mode === 'year';
            var isYearOrMonth = isYear || mode === 'month';
            var isMinute = mode === 'minute';
            var isHourOrMinute = isMinute || mode === 'hour';
            //only care about a minute accuracy of settings.minTimeGap
            date1 = new Date(
              isTimeOnly ? 2000 : date1.getFullYear(),
              isTimeOnly ? 0 : isYear ? 0 : date1.getMonth(),
              isTimeOnly ? 1 : isYearOrMonth ? 1 : date1.getDate(),
              !isHourOrMinute ? 0 : date1.getHours(),
              !isMinute ? 0 : settings.minTimeGap * Math.floor(date1.getMinutes() / settings.minTimeGap));
            date2 = new Date(
              isTimeOnly ? 2000 : date2.getFullYear(),
              isTimeOnly ? 0 : isYear ? 0 : date2.getMonth(),
              isTimeOnly ? 1 : isYearOrMonth ? 1 : date2.getDate(),
              !isHourOrMinute ? 0 : date2.getHours(),
              !isMinute ? 0 : settings.minTimeGap * Math.floor(date2.getMinutes() / settings.minTimeGap));
            return date2.getTime() - date1.getTime();
          },
          dateEqual: function (date1, date2, mode) {
            return !!date1 && !!date2 && module.helper.dateDiff(date1, date2, mode) === 0;
          },
          isDateInRange: function (date, mode, minDate, maxDate) {
            if (!minDate && !maxDate) {
              var startDate = module.get.startDate();
              minDate = startDate && settings.minDate ? new Date(Math.max(startDate, settings.minDate)) : startDate || settings.minDate;
              maxDate = settings.maxDate;
            }
            minDate = minDate && new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), minDate.getHours(), settings.minTimeGap * Math.ceil(minDate.getMinutes() / settings.minTimeGap));
            return !(!date ||
            (minDate && module.helper.dateDiff(date, minDate, mode) > 0) ||
            (maxDate && module.helper.dateDiff(maxDate, date, mode) > 0));
          },
          dateInRange: function (date, minDate, maxDate) {
            if (!minDate && !maxDate) {
              var startDate = module.get.startDate();
              minDate = startDate && settings.minDate ? new Date(Math.max(startDate, settings.minDate)) : startDate || settings.minDate;
              maxDate = settings.maxDate;
            }
            minDate = minDate && new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), minDate.getHours(), settings.minTimeGap * Math.ceil(minDate.getMinutes() / settings.minTimeGap));
            var isTimeOnly = settings.type === 'time';
            return !date ? date :
              (minDate && module.helper.dateDiff(date, minDate, 'minute') > 0) ?
                (isTimeOnly ? module.helper.mergeDateTime(date, minDate) : minDate) :
                (maxDate && module.helper.dateDiff(maxDate, date, 'minute') > 0) ?
                  (isTimeOnly ? module.helper.mergeDateTime(date, maxDate) : maxDate) :
                  date;
          },
          mergeDateTime: function (date, time) {
            return (!date || !time) ? time :
              new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
          }
        },

        setting: function (name, value) {
          module.debug('Changing setting', name, value);
          if ($.isPlainObject(name)) {
            $.extend(true, settings, name);
          }
          else if (value !== undefined) {
            if ($.isPlainObject(settings[name])) {
              $.extend(true, settings[name], value);
            }
            else {
              settings[name] = value;
            }
          }
          else {
            return settings[name];
          }
        },
        internal: function (name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function () {
          if (!settings.silent && settings.debug) {
            if (settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function () {
          if (!settings.silent && settings.verbose && settings.debug) {
            if (settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function () {
          if (!settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          }
        },
        performance: {
          log: function (message) {
            var
              currentTime,
              executionTime,
              previousTime
              ;
            if (settings.performance) {
              currentTime = new Date().getTime();
              previousTime = time || currentTime;
              executionTime = currentTime - previousTime;
              time = currentTime;
              performance.push({
                'Name': message[0],
                'Arguments': [].slice.call(message, 1) || '',
                'Element': element,
                'Execution Time': executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
          },
          display: function () {
            var
              title = settings.name + ':',
              totalTime = 0
              ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function (index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if (moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if (console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function (index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function (query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
            ;
          passedArguments = passedArguments || queryArguments;
          context = element || context;
          if (typeof query == 'string' && object !== undefined) {
            query = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function (depth, value) {
              var camelCaseValue = (depth != maxDepth)
                  ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                  : query
                ;
              if ($.isPlainObject(object[camelCaseValue]) && (depth != maxDepth)) {
                object = object[camelCaseValue];
              }
              else if (object[camelCaseValue] !== undefined) {
                found = object[camelCaseValue];
                return false;
              }
              else if ($.isPlainObject(object[value]) && (depth != maxDepth)) {
                object = object[value];
              }
              else if (object[value] !== undefined) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ($.isFunction(found)) {
            response = found.apply(context, passedArguments);
          }
          else if (found !== undefined) {
            response = found;
          }
          if (Array.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if (returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if (response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if (methodInvoked) {
        if (instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if (instance !== undefined) {
          instance.invoke('destroy');
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
    ;
};

$.fn.calendar.settings = {

  name            : 'Calendar',
  namespace       : 'calendar',

  silent: false,
  debug: false,
  verbose: false,
  performance: false,

  type               : 'datetime', // picker type, can be 'datetime', 'date', 'time', 'month', or 'year'
  firstDayOfWeek     : 0,          // day for first day column (0 = Sunday)
  constantHeight     : true,       // add rows to shorter months to keep day calendar height consistent (6 rows)
  today              : false,      // show a 'today/now' button at the bottom of the calendar
  closable           : true,       // close the popup after selecting a date/time
  monthFirst         : true,       // month before day when parsing/converting date from/to text
  touchReadonly      : true,       // set input to readonly on touch devices
  inline             : false,      // create the calendar inline instead of inside a popup
  on                 : null,       // when to show the popup (defaults to 'focus' for input, 'click' for others)
  initialDate        : null,       // date to display initially when no date is selected (null = now)
  startMode          : false,      // display mode to start in, can be 'year', 'month', 'day', 'hour', 'minute' (false = 'day')
  minDate            : null,       // minimum date/time that can be selected, dates/times before are disabled
  maxDate            : null,       // maximum date/time that can be selected, dates/times after are disabled
  ampm               : true,       // show am/pm in time mode
  disableYear        : false,      // disable year selection mode
  disableMonth       : false,      // disable month selection mode
  disableMinute      : false,      // disable minute selection mode
  formatInput        : true,       // format the input text upon input blur and module creation
  startCalendar      : null,       // jquery object or selector for another calendar that represents the start date of a date range
  endCalendar        : null,       // jquery object or selector for another calendar that represents the end date of a date range
  multiMonth         : 1,          // show multiple months when in 'day' mode
  minTimeGap         : 5,
  showWeekNumbers    : null,       // show Number of Week at the very first column of a dayView
  disabledDates      : [],         // specific day(s) which won't be selectable and contain additional information.
  disabledDaysOfWeek : [],         // day(s) which won't be selectable(s) (0 = Sunday)
  enabledDates       : [],         // specific day(s) which will be selectable, all other days will be disabled
  centuryBreak       : 60,         // starting short year until 99 where it will be assumed to belong to the last century
  currentCentury     : 2000,       // century to be added to 2-digit years (00 to {centuryBreak}-1)
  selectAdjacentDays : false,     // The calendar can show dates from adjacent month. These adjacent month dates can also be made selectable.
  // popup options ('popup', 'on', 'hoverable', and show/hide callbacks are overridden)
  popupOptions: {
    position: 'bottom left',
    lastResort: 'bottom left',
    prefer: 'opposite',
    hideOnScroll: false
  },

  text: {
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    now: 'Now',
    am: 'AM',
    pm: 'PM',
    weekNo: 'Week'
  },

  formatter: {
    header: function (date, mode, settings) {
      return mode === 'year' ? settings.formatter.yearHeader(date, settings) :
        mode === 'month' ? settings.formatter.monthHeader(date, settings) :
          mode === 'day' ? settings.formatter.dayHeader(date, settings) :
            mode === 'hour' ? settings.formatter.hourHeader(date, settings) :
              settings.formatter.minuteHeader(date, settings);
    },
    yearHeader: function (date, settings) {
      var decadeYear = Math.ceil(date.getFullYear() / 10) * 10;
      return (decadeYear - 9) + ' - ' + (decadeYear + 2);
    },
    monthHeader: function (date, settings) {
      return date.getFullYear();
    },
    dayHeader: function (date, settings) {
      var month = settings.text.months[date.getMonth()];
      var year = date.getFullYear();
      return month + ' ' + year;
    },
    hourHeader: function (date, settings) {
      return settings.formatter.date(date, settings);
    },
    minuteHeader: function (date, settings) {
      return settings.formatter.date(date, settings);
    },
    dayColumnHeader: function (day, settings) {
      return settings.text.days[day];
    },
    datetime: function (date, settings) {
      if (!date) {
        return '';
      }
      var day = settings.type === 'time' ? '' : settings.formatter.date(date, settings);
      var time = settings.type.indexOf('time') < 0 ? '' : settings.formatter.time(date, settings, false);
      var separator = settings.type === 'datetime' ? ' ' : '';
      return day + separator + time;
    },
    date: function (date, settings) {
      if (!date) {
        return '';
      }
      var day = date.getDate();
      var month = settings.text.months[date.getMonth()];
      var year = date.getFullYear();
      return settings.type === 'year' ? year :
        settings.type === 'month' ? month + ' ' + year :
        (settings.monthFirst ? month + ' ' + day : day + ' ' + month) + ', ' + year;
    },
    time: function (date, settings, forCalendar) {
      if (!date) {
        return '';
      }
      var hour = date.getHours();
      var minute = date.getMinutes();
      var ampm = '';
      if (settings.ampm) {
        ampm = ' ' + (hour < 12 ? settings.text.am : settings.text.pm);
        hour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      }
      return hour + ':' + (minute < 10 ? '0' : '') + minute + ampm;
    },
    today: function (settings) {
      return settings.type === 'date' ? settings.text.today : settings.text.now;
    },
    cell: function (cell, date, cellOptions) {
    }
  },

  parser: {
    date: function (text, settings) {
      if (!text) {
        return null;
      }
      text = ('' + text).trim().toLowerCase();
      if (text.length === 0) {
        return null;
      }

      var i, j, k;
      var minute = -1, hour = -1, day = -1, month = -1, year = -1;
      var isAm = undefined;

      var isTimeOnly = settings.type === 'time';
      var isDateOnly = settings.type.indexOf('time') < 0;

      var words = text.split(settings.regExp.dateWords);
      var numbers = text.split(settings.regExp.dateNumbers);

      if (!isDateOnly) {
        //am/pm
        isAm = $.inArray(settings.text.am.toLowerCase(), words) >= 0 ? true :
          $.inArray(settings.text.pm.toLowerCase(), words) >= 0 ? false : undefined;

        //time with ':'
        for (i = 0; i < numbers.length; i++) {
          var number = numbers[i];
          if (number.indexOf(':') >= 0) {
            if (hour < 0 || minute < 0) {
              var parts = number.split(':');
              for (k = 0; k < Math.min(2, parts.length); k++) {
                j = parseInt(parts[k]);
                if (isNaN(j)) {
                  j = 0;
                }
                if (k === 0) {
                  hour = j % 24;
                } else {
                  minute = j % 60;
                }
              }
            }
            numbers.splice(i, 1);
          }
        }
      }

      if (!isTimeOnly) {
        //textual month
        for (i = 0; i < words.length; i++) {
          var word = words[i];
          if (word.length <= 0) {
            continue;
          }
          word = word.substring(0, Math.min(word.length, 3));
          for (j = 0; j < settings.text.months.length; j++) {
            var monthString = settings.text.months[j];
            monthString = monthString.substring(0, Math.min(word.length, Math.min(monthString.length, 3))).toLowerCase();
            if (monthString === word) {
              month = j + 1;
              break;
            }
          }
          if (month >= 0) {
            break;
          }
        }

        //year > settings.centuryBreak
        for (i = 0; i < numbers.length; i++) {
          j = parseInt(numbers[i]);
          if (isNaN(j)) {
            continue;
          }
          if (j >= settings.centuryBreak && i === numbers.length-1) {
            if (j <= 99) {
              j += settings.currentCentury - 100;
            }
            year = j;
            numbers.splice(i, 1);
            break;
          }
        }

        //numeric month
        if (month < 0) {
          for (i = 0; i < numbers.length; i++) {
            k = i > 1 || settings.monthFirst ? i : i === 1 ? 0 : 1;
            j = parseInt(numbers[k]);
            if (isNaN(j)) {
              continue;
            }
            if (1 <= j && j <= 12) {
              month = j;
              numbers.splice(k, 1);
              break;
            }
          }
        }

        //day
        for (i = 0; i < numbers.length; i++) {
          j = parseInt(numbers[i]);
          if (isNaN(j)) {
            continue;
          }
          if (1 <= j && j <= 31) {
            day = j;
            numbers.splice(i, 1);
            break;
          }
        }

        //year <= settings.centuryBreak
        if (year < 0) {
          for (i = numbers.length - 1; i >= 0; i--) {
            j = parseInt(numbers[i]);
            if (isNaN(j)) {
              continue;
            }
            if (j <= 99) {
              j += settings.currentCentury;
            }
            year = j;
            numbers.splice(i, 1);
            break;
          }
        }
      }

      if (!isDateOnly) {
        //hour
        if (hour < 0) {
          for (i = 0; i < numbers.length; i++) {
            j = parseInt(numbers[i]);
            if (isNaN(j)) {
              continue;
            }
            if (0 <= j && j <= 23) {
              hour = j;
              numbers.splice(i, 1);
              break;
            }
          }
        }

        //minute
        if (minute < 0) {
          for (i = 0; i < numbers.length; i++) {
            j = parseInt(numbers[i]);
            if (isNaN(j)) {
              continue;
            }
            if (0 <= j && j <= 59) {
              minute = j;
              numbers.splice(i, 1);
              break;
            }
          }
        }
      }

      if (minute < 0 && hour < 0 && day < 0 && month < 0 && year < 0) {
        return null;
      }

      if (minute < 0) {
        minute = 0;
      }
      if (hour < 0) {
        hour = 0;
      }
      if (day < 0) {
        day = 1;
      }
      if (month < 0) {
        month = 1;
      }
      if (year < 0) {
        year = new Date().getFullYear();
      }

      if (isAm !== undefined) {
        if (isAm) {
          if (hour === 12) {
            hour = 0;
          }
        } else if (hour < 12) {
          hour += 12;
        }
      }

      var date = new Date(year, month - 1, day, hour, minute);
      if (date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        //month or year don't match up, switch to last day of the month
        date = new Date(year, month, 0, hour, minute);
      }
      return isNaN(date.getTime()) ? null : date;
    }
  },

  // callback when date changes, return false to cancel the change
  onChange: function (date, text, mode) {
    return true;
  },

  // callback before show animation, return false to prevent show
  onShow: function () {
  },

  // callback after show animation
  onVisible: function () {
  },

  // callback before hide animation, return false to prevent hide
  onHide: function () {
  },

  // callback after hide animation
  onHidden: function () {
  },

  // is the given date disabled?
  isDisabled: function (date, mode) {
    return false;
  },

  selector: {
    popup: '.ui.popup',
    input: 'input',
    activator: 'input'
  },

  regExp: {
    dateWords: /[^A-Za-z\u00C0-\u024F]+/g,
    dateNumbers: /[^\d:]+/g
  },

  error: {
    popup: 'UI Popup, a required component is not included in this page',
    method: 'The method you called is not defined.'
  },

  className: {
    calendar: 'calendar',
    active: 'active',
    popup: 'ui popup',
    grid: 'ui equal width grid',
    column: 'column',
    table: 'ui celled center aligned unstackable table',
    prev: 'prev link',
    next: 'next link',
    prevIcon: 'chevron left icon',
    nextIcon: 'chevron right icon',
    link: 'link',
    cell: 'link',
    disabledCell: 'disabled',
    weekCell: 'disabled',
    adjacentCell: 'adjacent',
    activeCell: 'active',
    rangeCell: 'range',
    focusCell: 'focus',
    todayCell: 'today',
    today: 'today link'
  },

  metadata: {
    date: 'date',
    focusDate: 'focusDate',
    startDate: 'startDate',
    endDate: 'endDate',
    minDate: 'minDate',
    maxDate: 'maxDate',
    mode: 'mode',
    monthOffset: 'monthOffset',
    message: 'message'
  }
};

})(jQuery, window, document);
