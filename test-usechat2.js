const react = require('react');
// Mock react hooks so we can call useChat outside a component
react.useState = (init) => [init, () => {}];
react.useEffect = () => {};
react.useCallback = (fn) => fn;
react.useRef = () => ({ current: null });

const { useChat } = require('@ai-sdk/react');

try {
  const result = useChat({ api: '/api/chat' });
  console.log("Keys in useChat result:", Object.keys(result));
} catch (e) {
  console.error(e);
}
