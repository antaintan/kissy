/**
 * @ignore
 * double-touch base
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var Touch = require('./touch');

    function DoubleTouch() {
    }

    S.extend(DoubleTouch, Touch, {
        requiredTouchCount: 2,

        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 === t2) {
                return t1;
            }
            if (Dom.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (Dom.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        }
    });

    return DoubleTouch;
});