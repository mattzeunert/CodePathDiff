class App extends React.Component {
    constructor(props){
        super(props)
        this.state = {}

        // debugger
        // this.backgroundPagePort = chrome.runtime.connect({name: 'code-path-diff'});
        // this.backgroundPagePort.onMessage.addListener((msg) => {
        //     if (msg[0] === "newLogs"){
        //         this.setState({logs: msg[1]})
        //     }
        // });
        // this.backgroundPagePort.postMessage(['connect', chrome.devtools.inspectedWindow.tabId])
        setInterval(() => {
            chrome.devtools.inspectedWindow.eval(
             "codePathDiff",
             (result, isException) => {
                 if (result) {
                     var stateUpdates = {};
                     if (!this.state.codePathDiff || this.state.codePathDiff.id !== result.id){
                        stateUpdates.previousCodePathDiff = this.state.codePathDiff
                     }
                     stateUpdates.codePathDiff = result

                     this.setState(stateUpdates, function(){
                         chrome.storage.local.set(this.state)
                     })
                 }
             }
           );
        }, 1000)

        chrome.storage.local.get(null, (data) => {
            this.setState(data)
        })
    }
    render(){
        console.log("state", this.state)
        var logs = null
        if (this.state.codePathDiff){
            logs = this.state.codePathDiff.calls.map(log => <div>{JSON.stringify(log)}</div>)
        }
        var previousLogs = null;
        if (this.state.previousCodePathDiff){
            debugger
            previousLogs = this.state.previousCodePathDiff.calls.map(log => <div>{JSON.stringify(log)}</div>)
        }
        return <div>
            <div style={{width: "40%", float: "left"}}>
                {logs}
            </div>
            <div style={{width: "40%", float: "left"}}>
                {previousLogs}
            </div>
        </div>
    }
}

ReactDOM.render(<App />, document.querySelector(".app"))
