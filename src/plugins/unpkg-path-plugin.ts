//First call for index.js,then there will be a module being imported in the index.js,that module is imported with unpkg,if there are helper-modules being imported in that module,then that will be also imported.
import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
import localforage from 'localforage';
 const fileCache = localforage.createInstance({
   name:'filecache',
 });


export const unpkgPathPlugin = (inputCode:string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      //onResolve searches for the target file.
      //filter is  showing the regex type for the file.
      //Namespace is a name given to the result file of the onResolve function.
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);
        if(args.path == 'index.js'){
            return { path: args.path, namespace: 'a' };
        }
        if(args.path.includes("./")||args.path.includes("../")){
         return{
          namespace:'a',
          path:new URL(args.path,'https://unpkg.com' + args.resolveDir +'/').href
         } 
        }
        return{
            namespace:'a',
            path:`https://unpkg.com/${args.path}`
        }
      });
      //onLoad is there for taking action on the onResolve file(after getting the target file,onLoad takes the required action on it).
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
 
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }
        //To check whether we have already fetched this file and if it is already there in the cache.
        const cacheResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        if(cacheResult){
          return cacheResult
        }
        console.log(args.path);
        const {data,request} = await axios.get(args.path);
        console.log(request);
        
        //returning final content to ESBuild.
        const result:esbuild.OnLoadResult = {
            loader:'jsx',
            contents:data,
            resolveDir:new URL("./",request.responseURL).pathname
        }
        //storing response in cache
        await fileCache.setItem(args.path,result);
        return result;
      });
    },
  };
}; 