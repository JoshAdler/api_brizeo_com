angular.module("utilsApp").directive('imgHolder', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                return Holder.run({
                    images: ele[0]
                });
            }
        };
    }
]).directive('typeaheadClickOpen', function ($parse, $timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, elem, attrs) {
            triggerFunc = function (evt) {
                var ctrl = elem.controller('ngModel'),
                    prev = ctrl.$modelValue || '';
                if (prev) {
                    ctrl.$setViewValue('');
                    $timeout(function () {
                        ctrl.$setViewValue(prev);
                    });
                } else {
                    ctrl.$setViewValue(' ');
                }
            }
            elem.bind('click', triggerFunc);
        }
    }
}).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
}).directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
}).directive('onFinishRenderDropdown', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {

                    var dropRight = false;

                    if (attr.onFinishRenderDropdown == "user-role") {
                        dropRight = true;
                    }
                    $("#" + attr.onFinishRenderDropdown).multiselect({
                        buttonClass: 'btn btn-default btn-sm',
                        buttonWidth: 100,
                        dropRight: dropRight
                    });
                });
            }
        }
    }
}).directive('multiSelectDropdown', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {

            $timeout(function () {

                //this is hack to remove that empty option added by angularjs
                $("#" + attr.multiSelectDropdown + ">option").remove();

                var dropRight = true;

                //if (attr.onFinishRenderDropdown == "user-role") {
                //    dropRight = true;
                //}
                $("#" + attr.multiSelectDropdown).multiselect({
                    buttonClass: 'btn btn-default btn-sm',
                    //buttonWidth: 100,
                    dropRight: dropRight
                });
            });

        }
    }
}).directive('currency', function () {
    return {
        require: 'ngModel',
        link: function (elem, $scope, attrs, ngModel) {
            ngModel.$formatters.push(function (val) {
                return '$' + val
            });
            ngModel.$parsers.push(function (val) {
                return val.replace(/^\$/, '')
            });
        }
    }
}).directive('customBackground', function () {
    return {
        restrict: "A",
        controller: [
            '$scope', '$element', '$location', function ($scope, $element, $location) {
                var addBg, path;
                path = function () {
                    return $location.path();
                };
                addBg = function (path) {
                    $element.removeClass('body-home body-special body-tasks body-lock');
                    switch (path) {
                        case '/':
                            return $element.addClass('body-home');
                        case '/404':
                        case '/pages/500':
                        case '/pages/signin':
                        case '/pages/signup':
                        case '/pages/forgot':
                            return $element.addClass('body-special');
                        case '/pages/lock-screen':
                            return $element.addClass('body-special body-lock');
                        case '/tasks':
                            return $element.addClass('body-tasks');
                    }
                };
                addBg($location.path());
                return $scope.$watch(path, function (newVal, oldVal) {
                    if (newVal === oldVal) {
                        return;
                    }
                    return addBg($location.path());
                });
            }
        ]
    };
}).directive('uiColorSwitch', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                return ele.find('.color-option').on('click', function (event) {
                    var $this, hrefUrl, style;
                    $this = $(this);
                    hrefUrl = void 0;
                    style = $this.data('style');
                    if (style === 'loulou') {
                        hrefUrl = 'styles/main.css';
                        $('link[href^="styles/main"]').attr('href', hrefUrl);
                    } else if (style) {
                        style = '-' + style;
                        hrefUrl = 'styles/main' + style + '.css';
                        $('link[href^="styles/main"]').attr('href', hrefUrl);
                    } else {
                        return false;
                    }
                    return event.preventDefault();
                });
            }
        };
    }
]).directive('toggleMinNav', [
    '$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                var $content, $nav, $window, Timer, app, updateClass;
                app = $('#app');
                $window = $(window);
                $nav = $('#nav-container');
                $content = $('#content');
                ele.on('click', function (e) {
                    if (app.hasClass('nav-min')) {
                        app.removeClass('nav-min');
                    } else {
                        app.addClass('nav-min');
                        $rootScope.$broadcast('minNav:enabled');
                    }
                    return e.preventDefault();
                });
                Timer = void 0;
                updateClass = function () {
                    var width;
                    width = $window.width();
                    if (width < 768) {
                        return app.removeClass('nav-min');
                    }
                };
                return $window.resize(function () {
                    var t;
                    clearTimeout(t);
                    return t = setTimeout(updateClass, 300);
                });
            }
        };
    }
]).directive('collapseNav', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                var $a, $aRest, $lists, $listsRest, app;
                $lists = ele.find('ul').parent('li');
                $lists.append('<i class="fa fa-caret-right icon-has-ul"></i>');
                $a = $lists.children('a');
                $listsRest = ele.children('li').not($lists);
                $aRest = $listsRest.children('a');
                app = $('#app');
                $a.on('click', function (event) {
                    var $parent, $this;
                    if (app.hasClass('nav-min')) {
                        return false;
                    }
                    $this = $(this);
                    $parent = $this.parent('li');
                    $lists.not($parent).removeClass('open').find('ul').slideUp();
                    $parent.toggleClass('open').find('ul').slideToggle();
                    return event.preventDefault();
                });
                $aRest.on('click', function (event) {
                    return $lists.removeClass('open').find('ul').slideUp();
                });
                return scope.$on('minNav:enabled', function (event) {
                    return $lists.removeClass('open').find('ul').slideUp();
                });
            }
        };
    }
]).directive('highlightActive', [
    function () {
        return {
            restrict: "A",
            controller: [
                '$scope', '$element', '$attrs', '$location', function ($scope, $element, $attrs, $location) {
                    var highlightActive, links, path;
                    links = $element.find('a');
                    path = function () {
                        return $location.path();
                    };
                    highlightActive = function (links, path) {
                        path = '#' + path;
                        return angular.forEach(links, function (link) {
                            var $li, $link, href;
                            $link = angular.element(link);
                            $li = $link.parent('li');
                            href = $link.attr('href');
                            if ($li.hasClass('active')) {
                                $li.removeClass('active');
                            }
                            if (path.indexOf(href) === 0) {
                                return $li.addClass('active');
                            }
                        });
                    };
                    highlightActive(links, $location.path());
                    return $scope.$watch(path, function (newVal, oldVal) {
                        if (newVal === oldVal) {
                            return;
                        }
                        return highlightActive(links, $location.path());
                    });
                }
            ]
        };
    }
]).directive('toggleOffCanvas', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                return ele.on('click', function () {
                    return $('#app').toggleClass('on-canvas');
                });
            }
        };
    }
]).directive('slimScroll', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                return ele.slimScroll({
                    height: attrs.scrollHeight || '100%'
                });
            }
        };
    }
]).directive('goBack', [
    function () {
        return {
            restrict: "A",
            controller: [
                '$scope', '$element', '$window', function ($scope, $element, $window) {
                    return $element.on('click', function () {
                        return $window.history.back();
                    });
                }
            ]
        };
    }
]).directive('backImg', function () {
    return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
            element.css({
                'background-image': 'url(' + value + ')',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
                'background-position': 'center center'
            });
        });
    };
}).directive('clickRedirect', function () {
    return {
        restrict: 'A',
        link: function (scope, ele, attr) {
            var eventName = attr.evetName || 'click';
            var url = attr.clickRedirect || 'just console';
            ele.addClass('cursor-pointer');
            ele.on(eventName, function () {
                window.location = url;
            });
        }
    };
});