/**
 * Domain spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Router) {
    /*jshint quotmark:false*/
    describe("router: set domain", function () {
        beforeEach(function () {
            Router.config({
                useHash: true
            });
            location.hash = '';
            waits(900);
        });

        afterEach(function () {
            Router.stop();
            Router.clearRoutes();
        });

        it("change domain works for router", function () {

            if (S.UA.ie === 6) {
                return;
            }

            var ok = 0;

            Router.get("/:path*", function (req) {
                expect(req.params.path).toBe("haha");
                expect(req.params[0]).toBe("/hah2/hah3");
                expect(req.params[1]).toBe("hah2/hah3");
                ok++;
            });

            document.domain = location.hostname;

            Dom.isCustomDomain = function () {
                return true;
            };

            Router.start();

            waits(500);

            runs(function () {
                Router.navigate("/haha/hah2/hah3");
            });

            waits(500);

            runs(function () {
                expect(ok).toBe(1);
            });

        });
    });
}, {
    requires: ['dom', 'router']
});