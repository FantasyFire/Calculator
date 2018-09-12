class Calculator {
    constructor() {
        this.numberReg = /^-?\d+\.?\d*/;
    }
    
    calc_0(number1, number2, operator) {
        var funcs = {
            '+': (n1, n2) => n1+n2,
            '-': (n1, n2) => n1-n2,
            '*': (n1, n2) => n1*n2,
            '/': (n1, n2) => n1/n2
        };
        if (funcs[operator]) {
            return funcs[operator](number1, number2);
        } else {
            console.error('unexpected operator $1 in Calculator.calc_0', operator);
            return NaN;
        }
    }
    calc_1(opStack, numStack) {
        if (opStack[opStack.length-1]==='(' && numStack.length<2) {
            opStack.pop();
        }
        var lastBracketIndex = opStack.lastIndexOf('(');
        var _opStack = opStack.splice(lastBracketIndex==-1 ? 0 : lastBracketIndex+1);
        lastBracketIndex!=-1 && opStack.pop();
        if (numStack.length >= _opStack.length+1) {
            var _numStack = numStack.splice(-(_opStack.length+1));
            while (_numStack.length > 1) {
                var [n1, n2] = _numStack.splice(0,2), op = _opStack.splice(0,1)[0];
                var res = this.calc_0(n1, n2, op);
                if (res !== res) { // 返回NaN的情况
                    ret = NaN;
                    success = false;
                } else {
                    _numStack.splice(0,0,res);
                }
            }
            numStack.push(_numStack[0]);
        } else {
            console.error('numStack.length $1 less than _opStack.length+1 $2 in Calculator.calc_1', numStack.length, _opStack.length+1);
        }
        while (opStack.length>=1 && numStack.length>=2) {
            var topOp = opStack.pop();
            _opStack.unshift(topOp);
            if (topOp === '(') break;
            var n2 = numStack.pop(), n1 = numStack.pop();
            _numStack.unshift(n1)
            var res = this.calc_0(n1, n2, topOp);
            if (res !== res) { // 返回NaN的情况
                ret = NaN;
                success = false;
            } else {
                numStack.push(res);
            }
        }
    }
    run(expression) {
        // todo: 验证expression的合法性（数据类型是否string）
        var exp = expression, ret = NaN, opStack = [], numStack = [], success = true, state = 0;
        // 特殊处理首位负号问题
        while (exp.length>0) {
            var c = exp[0];
            if (state === 0) { // 找数字
                if (c === '-' && exp[1] === '(') { // 特殊处理负号问题
                    numStack.push(-1);
                    opStack.push('*');
                    exp = exp.substr(1);
                    continue;
                } else if (c === '(') {
                    opStack.push('(');
                    exp = exp.substr(1);
                    continue;
                } else {
                    // 找一个数字
                    var matchNumber = exp.match(this.numberReg);
                    if (matchNumber) {
                        numStack.push(parseFloat(matchNumber[0]));
                        exp  = exp.substr(matchNumber[0].length);
                    } else {
                        console.error('expression: $1 解析失败 in Calculator.run', expression);
                        ret = NaN;
                        success = false;
                        break;
                    }
                    state = 1;
                }
            } else if (state === 1) { // 找符号
                switch (c) {
                    case ')':
                        this.calc_1(opStack, numStack);
                        exp = exp.substr(1);
                        break;
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                        exp = exp.substr(1);
                        var topOp = opStack[opStack.length-1];
                        if (['*','/'].includes(topOp)) { //  || ['+','-'].includes(topOp)&&['+','-'].includes(c)
                            if (numStack.length>=2) {
                                var n2 = numStack.pop(), n1 = numStack.pop();
                                opStack.pop();
                                var res = this.calc_0(n1, n2, topOp);
                                if (res !== res) { // 返回NaN的情况
                                    ret = NaN;
                                    success = false;
                                } else {
                                    numStack.push(res);
                                }
                            } else {
                                console.error('expression: $1 解析失败 in Calculator.run', expression);
                                ret = NaN;
                                success = false;
                                break;
                            }
                        }
                        opStack.push(c); // 新操作符入栈
                        state = 0;
                        break;
                    default:
                        console.error('unexpected c $1 in Calculator.run', c);
                        ret = NaN;
                        success = false;
                }
                if (!success) break;
            } else {
                console.error('unexpected state $1 in Calculator.run', state);
                ret = NaN;
                success = false;
                break;
            }
        }
        if (success) {
            this.calc_1(opStack, numStack);
            if (opStack.length==0 && numStack.length==1) {
                ret = numStack[0];
            } else {
                console.error('unexpected opStack $1 or numStack $2 in Calculator.calc_0', opStack, numStack);
                ret = NaN;
                success = false;
            }
        }
        
        return ret;
    }
}
