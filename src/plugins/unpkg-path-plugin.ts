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
        // else if(args.path == 'tiny-test-pkg'){
        //     return {path:'unpkg.com/tiny-test-pkg@1.0.0/index.js',
        //     namespace:'a'}
        // }
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
              const message = require('medium-test-pkg');
              console.log(message);
            `,
          };
        }
        console.log(args.path);
        const {data} = await axios.get('https://unpkg.com/tiny-test-pkg@1.0.0/index.js');
        //returning final content to ESBuild.
        return {
            loader:'jsx',
            contents:data
        }
      });
    },
  };
}; 