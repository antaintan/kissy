describe("timestamp for individual module works", function () {
    var S = KISSY;

    beforeEach(function () {
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });

    it("works and avoid repeated loading", function () {
        var mods = KISSY.Env.mods;

        KISSY.config({
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var ok1;

        KISSY.use("timestamp/x", function () {
            ok1 = 1;
        });

        waitsFor(function () {
            return ok1 == 1;
        });

        runs(function () {
            expect(S.Loader.Utils.endsWith(mods["timestamp/x"].url, "b.js")).toBe(true);
            expect(S.Loader.Utils.endsWith(mods["timestamp/z"].url, "z.js")).toBe(true);
            expect(mods["timestamp/x"].getTag()).toBe("b");
            expect(mods["timestamp/z"].getTag()).toBe("z");
            expect(window.TIMESTAMP_X).toBe(1);
        });

        runs(function () {
            KISSY.use("timestamp/y", function () {
                ok1 = 2;
            });
        });

        waitsFor(function () {
            return ok1 == 2;
        });

        runs(function () {
            expect(mods["timestamp/x"].getTag()).toBe("b");
            expect(mods["timestamp/y"].getTag()).toBe("a");
            expect(window.TIMESTAMP_X).toBe(1);
        });
    });


    it("can be set later", function () {
        window.TIMESTAMP_X = 0;

        var mods = KISSY.Env.mods;

        KISSY.config({
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        KISSY.config("modules", {
            'timestamp/x': {
                tag: 'q'
            }
        });


        var ok1;

        KISSY.use("timestamp/x", function () {
            ok1 = 1;
        });

        waitsFor(function () {
            return ok1 == 1;
        });

        runs(function () {
            expect(S.Loader.Utils.endsWith(mods["timestamp/x"].url, "q.js")).toBe(true);
            expect(S.Loader.Utils.endsWith(mods["timestamp/z"].url, "z.js")).toBe(true);
            expect(mods["timestamp/x"].getTag()).toBe("q");
            expect(mods["timestamp/z"].getTag()).toBe("z");
            expect(window.TIMESTAMP_X).toBe(1);
        });

        runs(function () {
            KISSY.use("timestamp/y", function () {
                ok1 = 2;
            });
        });

        waitsFor(function () {
            return ok1 == 2;
        });

        runs(function () {
            expect(mods["timestamp/x"].getTag()).toBe("q");
            expect(mods["timestamp/y"].getTag()).toBe("a");
            expect(window.TIMESTAMP_X).toBe(1);
        });
    });
});
