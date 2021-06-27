//First call for index.js,then there will be a module being imported in the index.js,that module is imported with unpkg,if there are helper-modules being imported in that module,then that will be also imported.
import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
 
export const unpkgPathPlugin = () => {
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
            contents: `
              import React from 'react';
              console.log(react,reactDOM);
            `,
          };
        }
        console.log(args.path);
        const {data,request} = await axios.get(args.path);
        console.log(request);
        
        //returning final content to ESBuild.
        return {
            loader:'jsx',
            contents:data,
            resolveDir:new URL("./",request.responseURL).pathname
        }
      });
    },
  };
}; 