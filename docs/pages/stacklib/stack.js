(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) {
        window.alert("This extension must run unsandboxed");
        throw new Error("This extension must run unsandboxed");
    }

    const vm = Scratch.vm;
    const runtime = vm.runtime;
    const Cast = Scratch.Cast;

    class Scope {
        constructor() {
            this.variables = {};
            this.lists = {};
        }
    }

    class StackLib {
        getInfo() {
            return {
                id: "stacklib",
                color1: "#fab041",
                color2: "#c1842d",
                name: "Stack",
                blocks: [
                    {
                        opcode: "newScope",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "new scope",
                    },
                    {
                        opcode: "cleanScope",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "clean up scope",
                    },
                    {
                        opcode: "createVariable",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "create local [NAME] with value [VALUE]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0"
                            }
                        }
                    },
                    {
                        opcode: "setVariable",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set local [NAME] to [VALUE]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0"
                            }
                        }
                    },
                    {
                        opcode: "changeVariable",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "change local [NAME] by [VALUE]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "1"
                            }
                        }
                    },
                    {
                        opcode: "getVariable",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "local [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            }
                        }
                    },
                    {
                        opcode: "getVariableOr",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "local [NAME] or [DEFAULT]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            },
                            DEFAULT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0"
                            }
                        }
                    },
                    {
                        opcode: "variableExists",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "local [NAME] exists?",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "my variable"
                            }
                        }
                    }
                ]
            };
        }

        // find or attach stacklib specific data to the current thread
        _scopeData(util) {
            const thread = util.thread;

            if (!thread || !thread.stackFrames || thread.stackFrames.length === 0) { 
                return null; 
            }

            const currentFrame = thread.stackFrames[thread.stackFrames.length - 1];

            if (!currentFrame.stackLibScopeData) {
                currentFrame.stackLibScopeData = { 
                    scopes: [new Scope()], 
                    // cleanup: false 
                };
            }

            return currentFrame.stackLibScopeData;
        }

        _currentScope(util) {
            const scopeData = this._scopeData(util);
            if (!scopeData) { return null; };

            return scopeData.scopes[scopeData.scopes.length - 1];
        }

        newScope(args, util) {
            let scopeData = this._scopeData(util);
            if (!scopeData) { return; }

            scopeData.scopes.push(new Scope());
        }

        cleanScope(args, util) {
            let scopeData = this._scopeData(util);
            if (!scopeData) { return; }

            scopeData.scopes.pop();
        }

        createVariable({NAME, VALUE}, util) {
            let currentScope = this._currentScope(util);
            if (!currentScope) { return; }

            currentScope.variables[NAME] = VALUE;
        }

        setVariable({NAME, VALUE}, util) {
            let currentScope = this._currentScope(util);
            let currentVar = currentScope.variables[NAME];
            if (!currentScope || currentVar === undefined) { return; }

            currentVar = VALUE;
        }

        changeVariable({NAME, VALUE}, util) {
            let currentScope = this._currentScope(util);
            let currentVar = currentScope.variables[NAME];
            if (!currentScope || currentVar === undefined) { return; }

            currentVar = Cast.toNumber(currentVar) + Cast.toNumber(VALUE);
        }

        getVariable({NAME}, util) {
            let currentScope = this._currentScope(util);
            let currentVar = currentScope.variables[NAME];
            if (!currentScope || currentVar === undefined) { return ""; }

            return currentVar;
        }

        getVariableOr({NAME, DEFAULT}, util) {
            let currentScope = this._currentScope(util);
            let currentVar = currentScope.variables[NAME];
            if (!currentScope) { return ""; }

            return currentVar ?? DEFAULT;
        }

        variableExists({NAME}, util) {
            let currentScope = this._currentScope(util);
            if (!currentScope) { return false; }

            let currentVar = currentScope.variables[NAME];
            return !(currentVar === undefined);
        }
    }
    
    Scratch.extensions.register(new StackLib());
})(Scratch)
