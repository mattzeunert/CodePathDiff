var codeInstrumenter = new ChromeCodeInstrumenter({
    additionalMessageHandlers: {
        sendLogs: function(session, request, callback){
            alert("BG PAGE!!" + JSON.stringify(request))
        },
    }
});

// http://stackoverflow.com/questions/11661613/chrome-devpanel-extension-communicating-with-background-page
var ports = [];
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== "babel-instrumenter") return;
    ports.push(port);
    // Remove port when destroyed (eg when devtools instance is closed)
    port.onDisconnect.addListener(function() {
        var i = ports.indexOf(port);
        if (i !== -1) ports.splice(i, 1);
    });
    port.onMessage.addListener(function(msg) {
		if (msg[0] === "connect") {
			port.tabId = msg[1];
		}
		if (msg[0] === "enableInstrumentation") {
			updateTab(port.tabId, codeInstrumenter.reloadTabWithInstrumentationEnabled.bind(codeInstrumenter))
		}
        // Received message from devtools. Do something:
        console.log('Received message from devtools page', msg);
    });
});

function onBrowserActionClicked(tab) {
	updateTab(tab.id, codeInstrumenter.toggleTabInstrumentation.bind(codeInstrumenter))
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);

function updateTab(tabId, updateFn){
	chrome.storage.local.get(null, function(){
		var babelPlugin = function babelPlugin(babel) {
            function addLoggingCall(path, name){
  	             if (!name){ name="unknown" + JSON.stringify(path.node.loc.start)}

                 var call = babel.types.callExpression(
                    babel.types.identifier("logCall"),
                    [babel.types.stringLiteral(name)]
                )
                var expression = babel.types.expressionStatement(call)
                path.node.body.body.unshift(expression)
            }

            return {
                visitor: {
                    FunctionDeclaration(path) {
                        addLoggingCall(path, path.node.id.name)
                    },
                    FunctionExpression(path){
			            addLoggingCall(path)
                    },
                    ClassMethod(path){
                        addLoggingCall(path)
                    },
                    ArrowFunctionExpression(path){
                        if (path.node.body.type === "BlockStatement"){
   		                   addLoggingCall(path)
                       } else {
                           path.node.body = babel.types.BlockStatement(
                               [babel.types.ReturnStatement(path.node.body)]
                           )
                           addLoggingCall(path)
                       }
                   }
               }
           }
       }

       updateFn(tabId, {
			babelPlugin,
			jsExecutionInhibitedMessage: "Babel Code Instrumenter: JavaScript Execution Inhibited (this exception is normal and expected)",
			loadingMessagePrefix: "Babel Code Instrumenter: ",
			onInstrumentationError(err, filename, session){
				onError(session.tabId, err)
			},
			onBeforePageLoad: function(callback){
				this.executeScriptOnPage(`var instrumenterDocumentReadyInterval = setInterval(function(){
					if (f__getReadyState(document) === "complete") {
						clearInterval(instrumenterDocumentReadyInterval);
						if (window.onBabelInstrumenterDocumentReady){
							window.onBabelInstrumenterDocumentReady();
						}
					}
				}, 50)



window.calls = []
window.logCall = function(fnName){
    calls.push({fnName})
}
`, () => {

			        setTimeout(function(){
		                callback();
		            },100)
				})
		    }
		})
	})
}

function onError(tabId, err){
	if (err !== null){
		err = err.toString();

		var encodedError = encodeURI(err);
		chrome.tabs.executeScript(tabId, {
			code: `console.error("Babel Instrumenter Error:", decodeURI("${encodedError}"))`
		})

		chrome.browserAction.setBadgeText({
            text: "!",
            tabId: tabId
        });
        chrome.browserAction.setBadgeBackgroundColor({
            tabId: tabId,
            color: "red"
        })
	}

	var port = ports.filter(port => port.tabId === tabId)[0];
	if (port){
		port.postMessage(["runtimeError", err])
	}
}
