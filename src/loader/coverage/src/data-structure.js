function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/data-structure.js']) {
  _$jscoverage['/data-structure.js'] = {};
  _$jscoverage['/data-structure.js'].lineData = [];
  _$jscoverage['/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/data-structure.js'].lineData[28] = 0;
  _$jscoverage['/data-structure.js'].lineData[32] = 0;
  _$jscoverage['/data-structure.js'].lineData[41] = 0;
  _$jscoverage['/data-structure.js'].lineData[49] = 0;
  _$jscoverage['/data-structure.js'].lineData[56] = 0;
  _$jscoverage['/data-structure.js'].lineData[64] = 0;
  _$jscoverage['/data-structure.js'].lineData[72] = 0;
  _$jscoverage['/data-structure.js'].lineData[80] = 0;
  _$jscoverage['/data-structure.js'].lineData[84] = 0;
  _$jscoverage['/data-structure.js'].lineData[91] = 0;
  _$jscoverage['/data-structure.js'].lineData[92] = 0;
  _$jscoverage['/data-structure.js'].lineData[96] = 0;
  _$jscoverage['/data-structure.js'].lineData[101] = 0;
  _$jscoverage['/data-structure.js'].lineData[106] = 0;
  _$jscoverage['/data-structure.js'].lineData[111] = 0;
  _$jscoverage['/data-structure.js'].lineData[114] = 0;
  _$jscoverage['/data-structure.js'].lineData[115] = 0;
  _$jscoverage['/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/data-structure.js'].lineData[119] = 0;
  _$jscoverage['/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/data-structure.js'].lineData[130] = 0;
  _$jscoverage['/data-structure.js'].lineData[134] = 0;
  _$jscoverage['/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/data-structure.js'].lineData[142] = 0;
  _$jscoverage['/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/data-structure.js'].lineData[160] = 0;
  _$jscoverage['/data-structure.js'].lineData[161] = 0;
  _$jscoverage['/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/data-structure.js'].lineData[165] = 0;
  _$jscoverage['/data-structure.js'].lineData[167] = 0;
  _$jscoverage['/data-structure.js'].lineData[171] = 0;
  _$jscoverage['/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/data-structure.js'].lineData[191] = 0;
  _$jscoverage['/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/data-structure.js'].lineData[239] = 0;
  _$jscoverage['/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/data-structure.js'].lineData[241] = 0;
  _$jscoverage['/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/data-structure.js'].lineData[283] = 0;
  _$jscoverage['/data-structure.js'].lineData[284] = 0;
  _$jscoverage['/data-structure.js'].lineData[285] = 0;
  _$jscoverage['/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[304] = 0;
  _$jscoverage['/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/data-structure.js'].lineData[314] = 0;
  _$jscoverage['/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[323] = 0;
}
if (! _$jscoverage['/data-structure.js'].functionData) {
  _$jscoverage['/data-structure.js'].functionData = [];
  _$jscoverage['/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/data-structure.js'].functionData[28] = 0;
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['159'] = [];
  _$jscoverage['/data-structure.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['160'] = [];
  _$jscoverage['/data-structure.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['175'] = [];
  _$jscoverage['/data-structure.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['179'] = [];
  _$jscoverage['/data-structure.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['182'] = [];
  _$jscoverage['/data-structure.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['188'] = [];
  _$jscoverage['/data-structure.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['192'] = [];
  _$jscoverage['/data-structure.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['196'] = [];
  _$jscoverage['/data-structure.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['197'] = [];
  _$jscoverage['/data-structure.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['200'] = [];
  _$jscoverage['/data-structure.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['207'] = [];
  _$jscoverage['/data-structure.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['220'] = [];
  _$jscoverage['/data-structure.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['240'] = [];
  _$jscoverage['/data-structure.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['246'] = [];
  _$jscoverage['/data-structure.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['250'] = [];
  _$jscoverage['/data-structure.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['262'] = [];
  _$jscoverage['/data-structure.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['271'] = [];
  _$jscoverage['/data-structure.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['282'] = [];
  _$jscoverage['/data-structure.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['283'] = [];
  _$jscoverage['/data-structure.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['284'] = [];
  _$jscoverage['/data-structure.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['309'] = [];
  _$jscoverage['/data-structure.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['310'] = [];
  _$jscoverage['/data-structure.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['311'] = [];
  _$jscoverage['/data-structure.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['313'] = [];
  _$jscoverage['/data-structure.js'].branchData['313'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['313'][1].init(114, 35, 'normalizedRequiresStatus === status');
function visit142_313_1(result) {
  _$jscoverage['/data-structure.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['311'][1].init(346, 151, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit141_311_1(result) {
  _$jscoverage['/data-structure.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['310'][1].init(25, 14, 'requires || []');
function visit140_310_1(result) {
  _$jscoverage['/data-structure.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['309'][2].init(255, 21, 'requires.length === 0');
function visit139_309_2(result) {
  _$jscoverage['/data-structure.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['309'][1].init(242, 34, '!requires || requires.length === 0');
function visit138_309_1(result) {
  _$jscoverage['/data-structure.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['284'][1].init(255, 18, '!requiresWithAlias');
function visit137_284_1(result) {
  _$jscoverage['/data-structure.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['283'][1].init(25, 14, 'requires || []');
function visit136_283_1(result) {
  _$jscoverage['/data-structure.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['282'][2].init(165, 21, 'requires.length === 0');
function visit135_282_2(result) {
  _$jscoverage['/data-structure.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['282'][1].init(152, 34, '!requires || requires.length === 0');
function visit134_282_1(result) {
  _$jscoverage['/data-structure.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['271'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit133_271_1(result) {
  _$jscoverage['/data-structure.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['262'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit132_262_1(result) {
  _$jscoverage['/data-structure.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['250'][1].init(408, 32, 'packages[pName] || packages.core');
function visit131_250_1(result) {
  _$jscoverage['/data-structure.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['246'][2].init(69, 23, 'p.length > pName.length');
function visit130_246_2(result) {
  _$jscoverage['/data-structure.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['246'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit129_246_1(result) {
  _$jscoverage['/data-structure.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['240'][1].init(48, 17, '!self.packageInfo');
function visit128_240_1(result) {
  _$jscoverage['/data-structure.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['220'][1].init(48, 9, '!self.url');
function visit127_220_1(result) {
  _$jscoverage['/data-structure.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['207'][1].init(774, 11, '!ret.length');
function visit126_207_1(result) {
  _$jscoverage['/data-structure.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['200'][1].init(161, 11, 'normalAlias');
function visit125_200_1(result) {
  _$jscoverage['/data-structure.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['197'][1].init(22, 8, 'alias[i]');
function visit124_197_1(result) {
  _$jscoverage['/data-structure.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['196'][1].init(344, 5, 'i < l');
function visit123_196_1(result) {
  _$jscoverage['/data-structure.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['192'][1].init(192, 25, 'typeof alias === \'string\'');
function visit122_192_1(result) {
  _$jscoverage['/data-structure.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['188'][1].init(48, 20, 'self.normalizedAlias');
function visit121_188_1(result) {
  _$jscoverage['/data-structure.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['182'][1].init(388, 11, 'alias || []');
function visit120_182_1(result) {
  _$jscoverage['/data-structure.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['179'][1].init(268, 17, 'packageInfo.alias');
function visit119_179_1(result) {
  _$jscoverage['/data-structure.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['175'][1].init(150, 5, 'alias');
function visit118_175_1(result) {
  _$jscoverage['/data-structure.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['160'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit117_160_1(result) {
  _$jscoverage['/data-structure.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['159'][1].init(80, 2, '!v');
function visit116_159_1(result) {
  _$jscoverage['/data-structure.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Config = S.Config, Utils = Loader.Utils, mix = Utils.mix;
  _$jscoverage['/data-structure.js'].lineData[12]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[24]++;
    this.filter = '';
    _$jscoverage['/data-structure.js'].lineData[25]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[28]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[32]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[41]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[49]++;
  return this.name;
}, 
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[56]++;
  return this.base;
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[64]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[72]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[80]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[84]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[91]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[10]++;
    _$jscoverage['/data-structure.js'].lineData[92]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[96]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[101]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[106]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[111]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[114]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[115]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[116]++;
    self.waits = {};
    _$jscoverage['/data-structure.js'].lineData[118]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[11]++;
  _$jscoverage['/data-structure.js'].lineData[119]++;
  return S.require(moduleName, self.name);
};
  }
  _$jscoverage['/data-structure.js'].lineData[123]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[130]++;
  return Utils.normalizePath(this.name, relativeName);
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[134]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[138]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[142]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[146]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[147]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[149]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[157]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[159]++;
  if (visit116_159_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[160]++;
    if (visit117_160_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[161]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[163]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[165]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[167]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[171]++;
  var self = this, name = self.name, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[175]++;
  if (visit118_175_1(alias)) {
    _$jscoverage['/data-structure.js'].lineData[176]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[178]++;
  packageInfo = self.getPackage();
  _$jscoverage['/data-structure.js'].lineData[179]++;
  if (visit119_179_1(packageInfo.alias)) {
    _$jscoverage['/data-structure.js'].lineData[180]++;
    alias = packageInfo.alias(name);
  }
  _$jscoverage['/data-structure.js'].lineData[182]++;
  alias = self.alias = visit120_182_1(alias || []);
  _$jscoverage['/data-structure.js'].lineData[183]++;
  return alias;
}, 
  getNormalizedAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[187]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[188]++;
  if (visit121_188_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[189]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[191]++;
  var alias = self.getAlias();
  _$jscoverage['/data-structure.js'].lineData[192]++;
  if (visit122_192_1(typeof alias === 'string')) {
    _$jscoverage['/data-structure.js'].lineData[193]++;
    alias = [alias];
  }
  _$jscoverage['/data-structure.js'].lineData[195]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[196]++;
  for (var i = 0, l = alias.length; visit123_196_1(i < l); i++) {
    _$jscoverage['/data-structure.js'].lineData[197]++;
    if (visit124_197_1(alias[i])) {
      _$jscoverage['/data-structure.js'].lineData[198]++;
      var mod = Utils.getOrCreateModuleInfo(alias[i]);
      _$jscoverage['/data-structure.js'].lineData[199]++;
      var normalAlias = mod.getNormalizedAlias();
      _$jscoverage['/data-structure.js'].lineData[200]++;
      if (visit125_200_1(normalAlias)) {
        _$jscoverage['/data-structure.js'].lineData[201]++;
        ret.push.apply(ret, normalAlias);
      } else {
        _$jscoverage['/data-structure.js'].lineData[203]++;
        ret.push(alias[i]);
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[207]++;
  if (visit126_207_1(!ret.length)) {
    _$jscoverage['/data-structure.js'].lineData[208]++;
    ret.push(self.name);
  }
  _$jscoverage['/data-structure.js'].lineData[210]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[211]++;
  return ret;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[219]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[220]++;
  if (visit127_220_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[221]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[223]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[231]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[239]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[240]++;
  if (visit128_240_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[241]++;
    var packages = Config.packages, modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[245]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[246]++;
      if (visit129_246_1(Utils.startsWith(modNameSlash, p + '/') && visit130_246_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[247]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[250]++;
    self.packageInfo = visit131_250_1(packages[pName] || packages.core);
  }
  _$jscoverage['/data-structure.js'].lineData[252]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[261]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[262]++;
  return visit132_262_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[271]++;
  return visit133_271_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[279]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[282]++;
  if (visit134_282_1(!requires || visit135_282_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[283]++;
    return visit136_283_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[284]++;
    if (visit137_284_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[285]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[288]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[296]++;
  return Utils.getOrCreateModulesInfo(this.getNormalizedRequires());
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[304]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[309]++;
  if (visit138_309_1(!requires || visit139_309_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[310]++;
    return visit140_310_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[311]++;
    if (visit141_311_1((normalizedRequires = self.normalizedRequires) && (visit142_313_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[314]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[316]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[317]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[318]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[323]++;
  Loader.Module = Module;
})(KISSY);
