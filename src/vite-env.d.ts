/// <reference types="vite/client" />

declare module '*.svg?react' {
  import React = require('react');
  const Component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default Component;
}