//We will take the code from the user and transfor it into common JS and then build it using ESBuild.

import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import * as esbuild from "esbuild-wasm"
import { useEffect } from "react";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
const App = () =>{
    const ref = useRef<any>()
    const [input,setInput]  =useState("");
    const [code,setCode] = useState("");
    const startService = async() => {
        ref.current = await esbuild.startService({
            worker:true,
            //address location of the compiled binary,which is in the PUBLIC folder
            wasmURL:'/esbuild.wasm'
        })
        
    }
    useEffect(() => {
       startService()
    }, [])
    const onClick1 = async () =>{
        //In case if the esbuild services are not ready
        if(!ref.current){
            return
        }
        console.log('====================================');
        console.log(ref.current);
        console.log('====================================');
       const result = await ref.current.build({
           entryPoints:["index.js"],
           bundle:true,
           write:false,
           plugins:[unpkgPathPlugin()],
           define:{
               'process.env.NODE_ENV':'"production"',
               global:'window'
           }
       })
      
        console.log(result);
        setCode(result.outputFiles[0].text)
    }
return <div>
    <textarea value={input} onChange={e=>setInput(e.target.value)}>
    </textarea>
        <div>
            <button onClick={onClick1}>
                Submit
            </button>
        </div>
        <pre>
            {code}
        </pre>
</div>
}
ReactDOM.render(<App />,document.querySelector("#root"))